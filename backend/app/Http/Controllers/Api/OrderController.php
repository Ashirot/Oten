<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'user', 'reviews']);
        $account = $request->user();

        // Never trust a caller-supplied user_id to grant access to other customers' orders.
        if (!($account instanceof Employee)) {
            $query->where('user_id', $account->id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($account instanceof Employee && $request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderBy('id', 'desc')->get();
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product.category', 'user', 'reviews'])->findOrFail($id);
        abort_unless($request->user() instanceof Employee || $order->user_id === $request->user()->id,
            403, 'You cannot access this order.');
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|max:50',
            'delivery_address' => 'required|string',
            'delivery_landmark' => 'nullable|string|max:255',
            'delivery_instructions' => 'nullable|string',
            'payment_method' => 'required|in:cod,gcash,card,cash',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Guest orders are unlinked; signed-in customer orders use the actual token.
        // Do not accept a forged user_id in request JSON.
        $authenticated = auth('sanctum')->user();
        $userId = $authenticated instanceof User ? $authenticated->id : null;
        $orderNumber = 'ORD-' . strtoupper(Str::random(3)) . '-' . rand(1000, 9999);

        // Execute inside a database transaction with stock validation and row locking
        $order = DB::transaction(function () use ($validated, $userId, $orderNumber) {
            $subtotal = 0;
            $orderItemsData = [];

            // 1. Verify stock availability with Pessimistic Locking (SELECT ... FOR UPDATE)
            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                if (!$product || !$product->is_active) {
                    throw new \Exception("Product '{$product?->name}' is no longer available.");
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for '{$product->name}'. Available: {$product->stock_quantity}, Requested: {$item['quantity']}.");
                }

                $itemSubtotal = $product->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discountAmount = $subtotal >= 500 ? 50.00 : 0.00;
            $serviceFee = 0.00;
            $totalAmount = max(0, $subtotal - $discountAmount + $serviceFee);

            // 2. Create Order record
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => $validated['delivery_address'],
                'delivery_landmark' => $validated['delivery_landmark'] ?? null,
                'delivery_instructions' => $validated['delivery_instructions'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'service_fee' => $serviceFee,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                // Selecting GCash/card is not proof of payment; no gateway is integrated.
                'payment_status' => 'pending',
                'order_status' => 'preparing',
            ]);

            // 3. Insert Order Items
            // Note: The database trigger `trg_after_order_item_insert` will automatically
            // decrement the product stock quantity and create the inventory_logs record!
            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product']->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Order created successfully with database transaction and triggers.',
            'order' => $order->load(['items.product', 'user']),
        ], 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'required|in:pending,preparing,out_for_delivery,delivered,cancelled',
            'payment_status' => 'sometimes|required|in:pending,paid,refunded,cancelled',
        ]);

        DB::transaction(function () use ($request, $order, $validated) {
            $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->order_status === 'cancelled' && $validated['order_status'] !== 'cancelled') {
                abort(422, 'A cancelled order cannot be reopened automatically. Place a new order instead.');
            }
            if ($lockedOrder->order_status === 'delivered' && $validated['order_status'] === 'cancelled') {
                abort(422, 'Delivered orders require a separate refund or return process.');
            }

            if (array_key_exists('payment_status', $validated)) {
                // Staff explicitly confirming a payment or recording a refund.
                // Do not allow a paid/refunded order to be reset to pending.
                $nextPayment = $validated['payment_status'];
                $currentPayment = $lockedOrder->payment_status;

                if ($nextPayment === 'paid') {
                    abort_if($validated['order_status'] === 'cancelled', 422,
                        'A cancelled order cannot be marked as paid.');
                    abort_unless(in_array($currentPayment, ['pending', 'paid'], true), 422,
                        'A cancelled or refunded payment cannot be marked as paid.');
                } elseif ($nextPayment === 'refunded') {
                    abort_unless(in_array($currentPayment, ['paid', 'refunded'], true), 422,
                        'Record a refund only after the payment was confirmed and actually returned.');
                } elseif ($nextPayment === 'cancelled') {
                    abort_unless($validated['order_status'] === 'cancelled'
                        && in_array($currentPayment, ['pending', 'cancelled'], true), 422,
                        'Only unpaid cancelled orders can have a cancelled payment.');
                } else {
                    abort_unless($currentPayment === 'pending', 422,
                        'A processed payment cannot be returned to pending.');
                }
            } elseif ($validated['order_status'] === 'cancelled'
                && $lockedOrder->payment_status === 'pending') {
                // Cancellation voids an unpaid order; it is not a refund.
                $validated['payment_status'] = 'cancelled';
            } elseif ($validated['order_status'] === 'delivered'
                && $lockedOrder->payment_status === 'pending'
                && in_array($lockedOrder->payment_method, ['cod', 'cash'], true)) {
                // Cash/COD is collected on delivery. GCash/card require manual
                // staff confirmation because no payment gateway is connected.
                $validated['payment_status'] = 'paid';
            }

            // The insert trigger removes stock once at checkout. Return it exactly
            // once when an order is cancelled; preserve an audit trail.
            if ($lockedOrder->order_status !== 'cancelled' && $validated['order_status'] === 'cancelled') {
                foreach ($lockedOrder->items as $item) {
                    $product = Product::whereKey($item->product_id)->lockForUpdate()->firstOrFail();
                    $before = $product->stock_quantity;
                    $product->update(['stock_quantity' => $before + $item->quantity]);

                    DB::table('inventory_logs')->insert([
                        'product_id' => $product->id,
                        'movement_type' => 'return',
                        'quantity' => $item->quantity,
                        'stock_before' => $before,
                        'stock_after' => $before + $item->quantity,
                        'reference_type' => 'order_cancellation',
                        'reference_id' => $lockedOrder->id,
                        'notes' => 'Stock restored after order cancellation',
                        'performed_by' => $request->user()->id,
                        'created_at' => now(),
                    ]);
                }
            }
            $lockedOrder->update($validated);
        });

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->fresh()->load('items.product'),
        ]);
    }
}
