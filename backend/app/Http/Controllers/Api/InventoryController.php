<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryLog::with(['product.category', 'user']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('movement_type', $request->type);
        }

        $logs = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 50));
        return response()->json($logs);
    }

    public function lowStockAlerts()
    {
        // Query directly from database view vw_low_stock_alerts
        $alerts = DB::select("SELECT * FROM vw_low_stock_alerts ORDER BY stock_quantity ASC");
        return response()->json($alerts);
    }

    public function restock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        $userId = auth()->id() ?? 1;
        $notes = $validated['notes'] ?? 'Stock replenishment via admin';

        // Call MySQL Stored Procedure sp_RestockProduct
        DB::statement("CALL sp_RestockProduct(?, ?, ?, ?, @out_new_stock)", [
            $validated['product_id'],
            $validated['quantity'],
            $userId,
            $notes,
        ]);

        $result = DB::selectOne("SELECT @out_new_stock as new_stock");

        return response()->json([
            'message' => 'Product successfully restocked via MySQL Stored Procedure (sp_RestockProduct)',
            'product_id' => $validated['product_id'],
            'added_quantity' => $validated['quantity'],
            'new_stock' => $result->new_stock ?? 0,
        ]);
    }
}
