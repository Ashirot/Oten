<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'user', 'reviews']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('user_id')) {
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

    public function show($id)
    {
        $order = Order::with(['items.product.category', 'user', 'reviews'])->findOrFail($id);
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

        $userId = auth()->id() ?? $request->input('user_id');
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
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'paid',
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
            'payment_status' => 'nullable|in:pending,paid,refunded',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->fresh()->load('items.product'),
        ]);
    }
}
