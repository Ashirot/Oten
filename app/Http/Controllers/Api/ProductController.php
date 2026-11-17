<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier']);

        if ($request->filled('category')) {
            $cat = $request->input('category');
            if ($cat !== 'all') {
                $query->whereHas('category', function ($q) use ($cat) {
                    $q->where('slug', $cat)->orWhere('name', $cat);
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'asc');
        $query->orderBy($sort, $direction);

        $products = $query->get();

        // Include computed stock status using MySQL UDF
        $products->transform(function ($product) {
            $product->stock_status = DB::selectOne(
                "SELECT fn_GetProductStockStatus(?, ?) as status",
                [$product->stock_quantity, $product->reorder_level]
            )->status ?? 'IN_STOCK';
            return $product;
        });

        return response()->json($products);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'supplier', 'reviews.user', 'priceAudits']);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'required|string|max:150|unique:products,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string|url',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['cost_price'] = $validated['cost_price'] ?? ($validated['price'] * 0.55);
        $validated['reorder_level'] = $validated['reorder_level'] ?? 15;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $product = Product::create($validated);

        // Record initial inventory log
        DB::table('inventory_logs')->insert([
            'product_id' => $product->id,
            'movement_type' => 'initial',
            'quantity' => $product->stock_quantity,
            'stock_before' => 0,
            'stock_after' => $product->stock_quantity,
            'reference_type' => 'product_creation',
            'notes' => 'Product catalog initialized',
            'performed_by' => auth()->id() ?? 1,
            'created_at' => now(),
        ]);

        return response()->json($product->load(['category', 'supplier']), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'required|string|max:150|unique:products,name,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // MySQL trigger trg_product_price_audit and trg_prevent_negative_stock will automatically execute on update!
        $product->update($validated);

        return response()->json($product->fresh()->load(['category', 'supplier']));
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->count() > 0) {
            // Cannot delete product with orders (foreign key constraint)
            // Provide option to deactivate instead
            $product->update(['is_active' => false]);
            return response()->json([
                'message' => 'Product has existing sales history and cannot be deleted due to Foreign Key integrity constraint. It has been deactivated instead.',
                'deactivated' => true,
            ]);
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
