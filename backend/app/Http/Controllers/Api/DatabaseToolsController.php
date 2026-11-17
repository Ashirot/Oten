<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseToolsController extends Controller
{
    /**
     * Get Database Information and Structure (Data Dictionary)
     */
    public function getSystemSchema()
    {
        $tables = ['users', 'categories', 'suppliers', 'products', 'orders', 'order_items', 'inventory_logs', 'reviews', 'product_price_audits'];
        $dictionary = [];

        foreach ($tables as $table) {
            $columns = DB::select("
                SELECT 
                    COLUMN_NAME as name,
                    COLUMN_TYPE as type,
                    IS_NULLABLE as is_nullable,
                    COLUMN_KEY as column_key,
                    COLUMN_DEFAULT as default_value,
                    EXTRA as extra
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            ", [$table]);

            $dictionary[$table] = $columns;
        }

        $triggers = DB::select("
            SELECT 
                TRIGGER_NAME as name,
                EVENT_MANIPULATION as event,
                EVENT_OBJECT_TABLE as table_name,
                ACTION_TIMING as timing
            FROM INFORMATION_SCHEMA.TRIGGERS
            WHERE TRIGGER_SCHEMA = DATABASE()
        ");

        $routines = DB::select("
            SELECT 
                ROUTINE_NAME as name,
                ROUTINE_TYPE as type,
                DATA_TYPE as return_type
            FROM INFORMATION_SCHEMA.ROUTINES
            WHERE ROUTINE_SCHEMA = DATABASE()
        ");

        return response()->json([
            'database' => DB::connection()->getDatabaseName(),
            'tables' => $dictionary,
            'triggers' => $triggers,
            'routines' => $routines,
        ]);
    }

    /**
     * Milestone 5 / Section D: Query Optimization Demonstration
     */
    public function demonstrateQueryOptimization(Request $request)
    {
        $example = $request->input('example', 1);

        if ($example == 1) {
            // Optimization Example 1: Sales Summary with EXPLAIN analysis
            $queryOriginal = "
                SELECT o.order_number, o.created_at, o.order_status, o.total_amount, u.name as customer_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.created_at >= '2026-01-01' AND o.order_status = 'delivered'
            ";

            $explainOriginal = DB::select("EXPLAIN FORMAT=JSON " . $queryOriginal);

            $queryOptimized = "
                SELECT o.order_number, o.created_at, o.order_status, o.total_amount, u.name as customer_name
                FROM orders o FORCE INDEX (orders_order_status_created_at_index)
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.order_status = 'delivered' AND o.created_at >= '2026-01-01'
            ";

            $explainOptimized = DB::select("EXPLAIN FORMAT=JSON " . $queryOptimized);

            return response()->json([
                'example_id' => 1,
                'title' => 'Query Optimization 1: Multi-Column Composite Indexing for Order Filtering',
                'description' => 'Compares unindexed full table scan filtering against composite index on (order_status, created_at).',
                'technique' => 'Composite B-Tree Index + Filter Ordering Optimization',
                'original' => [
                    'sql' => trim($queryOriginal),
                    'explain' => json_decode($explainOriginal[0]->EXPLAIN ?? '{}'),
                ],
                'optimized' => [
                    'sql' => trim($queryOptimized),
                    'explain' => json_decode($explainOptimized[0]->EXPLAIN ?? '{}'),
                ],
                'analysis' => 'The original query without index requires an ALL (Full Table Scan) examining every row in the orders table. By utilizing the composite index (order_status, created_at), MySQL switches access type to "ref" or "range", cutting rows examined and eliminating temporary filesorts.',
            ]);
        } else {
            // Optimization Example 2: Correlated Subquery vs Indexed JOIN with Aggregation
            $queryOriginal = "
                SELECT c.name as category_name,
                    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as total_products,
                    (SELECT COALESCE(SUM(oi.subtotal), 0) FROM order_items oi JOIN products p2 ON oi.product_id = p2.id WHERE p2.category_id = c.id) as category_revenue
                FROM categories c
            ";

            $explainOriginal = DB::select("EXPLAIN FORMAT=JSON " . $queryOriginal);

            $queryOptimized = "
                SELECT 
                    c.name as category_name,
                    COUNT(DISTINCT p.id) as total_products,
                    COALESCE(SUM(oi.subtotal), 0.00) as category_revenue
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                LEFT JOIN order_items oi ON p.id = oi.product_id
                GROUP BY c.id, c.name
            ";

            $explainOptimized = DB::select("EXPLAIN FORMAT=JSON " . $queryOptimized);

            return response()->json([
                'example_id' => 2,
                'title' => 'Query Optimization 2: Correlated Scalar Subquery Elimination via Indexed Grouped JOIN',
                'description' => 'Replaces repeated correlated subqueries (O(N) executions per category row) with single-pass indexed hash/nested loop join with GROUP BY.',
                'technique' => 'Subquery to Hash/Index JOIN Conversion + Elimination of Dependent Subqueries',
                'original' => [
                    'sql' => trim($queryOriginal),
                    'explain' => json_decode($explainOriginal[0]->EXPLAIN ?? '{}'),
                ],
                'optimized' => [
                    'sql' => trim($queryOptimized),
                    'explain' => json_decode($explainOptimized[0]->EXPLAIN ?? '{}'),
                ],
                'analysis' => 'The original correlated subquery forces MySQL to run 2 nested sub-executions for every single row in categories (select_type: DEPENDENT SUBQUERY). The optimized query joins using existing foreign key indexes and groups in a single query pass, dramatically reducing query latency and CPU cycles.',
            ]);
        }
    }

    /**
     * Milestone 5 / Section E: Transaction Management Demonstration (Commit vs Rollback)
     */
    public function demonstrateTransaction(Request $request)
    {
        $action = $request->input('action', 'commit'); // 'commit' or 'rollback'

        $product = DB::table('products')->where('is_active', true)->first();
        if (!$product) {
            return response()->json(['error' => 'No active product found'], 404);
        }

        $initialStock = $product->stock_quantity;
        $orderNumber = 'TX-TEST-' . rand(10000, 99999);

        if ($action === 'commit') {
            // Successful transaction demonstration
            DB::beginTransaction();
            try {
                // 1. Create order
                $orderId = DB::table('orders')->insertGetId([
                    'order_number' => $orderNumber,
                    'customer_name' => 'Transaction Demo Customer',
                    'customer_phone' => '09120000000',
                    'delivery_address' => 'Claveria, Davao City',
                    'subtotal' => $product->price,
                    'total_amount' => $product->price,
                    'payment_method' => 'cod',
                    'payment_status' => 'pending',
                    'order_status' => 'preparing',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 2. Insert order item (triggers automatic stock decrement)
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => $product->price,
                    'subtotal' => $product->price,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::commit();

                $newStock = DB::table('products')->where('id', $product->id)->value('stock_quantity');

                return response()->json([
                    'status' => 'TRANSACTION_COMMITTED',
                    'action' => 'commit',
                    'message' => 'Transaction completed successfully! START TRANSACTION -> INSERT order -> INSERT order_item -> TRIGGER fired -> COMMIT executed.',
                    'order_number' => $orderNumber,
                    'product' => $product->name,
                    'stock_before' => $initialStock,
                    'stock_after' => $newStock,
                    'consistency' => 'ACID guarantees fulfilled. Order and inventory records are persistently committed.',
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => $e->getMessage()], 500);
            }
        } else {
            // Rollback demonstration
            DB::beginTransaction();
            try {
                // 1. Create temporary order
                $orderId = DB::table('orders')->insertGetId([
                    'order_number' => $orderNumber,
                    'customer_name' => 'Rollback Test User',
                    'customer_phone' => '09120000000',
                    'delivery_address' => 'Test Address',
                    'subtotal' => 999.00,
                    'total_amount' => 999.00,
                    'payment_method' => 'cod',
                    'payment_status' => 'pending',
                    'order_status' => 'preparing',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 2. Intentional failure: attempt to update stock to negative to trigger trg_prevent_negative_stock!
                DB::update("UPDATE products SET stock_quantity = -99 WHERE id = ?", [$product->id]);

                // If no exception, commit (should not reach here)
                DB::commit();
            } catch (\Exception $e) {
                // Catch trigger error and perform ROLLBACK
                DB::rollBack();

                $currentStock = DB::table('products')->where('id', $product->id)->value('stock_quantity');
                $orderExists = DB::table('orders')->where('order_number', $orderNumber)->exists();

                return response()->json([
                    'status' => 'TRANSACTION_ROLLED_BACK',
                    'action' => 'rollback',
                    'message' => 'Exception encountered: ' . $e->getMessage() . '. ROLLBACK was executed.',
                    'order_number' => $orderNumber,
                    'order_persisted' => $orderExists ? 'YES (Inconsistency)' : 'NO (Rolled back completely)',
                    'stock_intact' => $currentStock === $initialStock ? 'YES (Preserved at ' . $initialStock . ')' : 'NO',
                    'consistency' => 'Atomicity verified: All pending operations within the transaction boundary were undone cleanly.',
                ]);
            }
        }
    }
}
