<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Report 1: Sales & Revenue Analytics Report
     */
    public function salesSummary(Request $request)
    {
        $dailySummary = DB::select("
            SELECT 
                sale_date,
                total_orders,
                total_revenue,
                average_order_value,
                total_items_sold
            FROM vw_sales_summary
            ORDER BY sale_date DESC
            LIMIT 30
        ");

        $overallMetrics = DB::selectOne("
            SELECT 
                COUNT(id) as total_completed_orders,
                COALESCE(SUM(total_amount), 0.00) as gross_revenue,
                COALESCE(AVG(total_amount), 0.00) as overall_aov,
                COALESCE(SUM(discount_amount), 0.00) as total_discounts_granted
            FROM orders
            WHERE order_status <> 'cancelled'
        ");

        $paymentBreakdown = DB::select("
            SELECT 
                payment_method,
                COUNT(id) as transaction_count,
                SUM(total_amount) as total_volume
            FROM orders
            WHERE order_status <> 'cancelled'
            GROUP BY payment_method
        ");

        return response()->json([
            'report_name' => 'Sales & Revenue Analytics Report',
            'overall_metrics' => $overallMetrics,
            'daily_summary' => $dailySummary,
            'payment_breakdown' => $paymentBreakdown,
        ]);
    }

    /**
     * Report 2: Low Stock & Reorder Alert Report
     */
    public function lowStockReport()
    {
        $lowStockItems = DB::select("SELECT * FROM vw_low_stock_alerts ORDER BY units_needed DESC");

        $summary = DB::selectOne("
            SELECT 
                COUNT(*) as total_alerts,
                SUM(CASE WHEN stock_status = 'OUT_OF_STOCK' THEN 1 ELSE 0 END) as out_of_stock_count,
                SUM(CASE WHEN stock_status = 'LOW_STOCK' THEN 1 ELSE 0 END) as low_stock_count,
                SUM(units_needed) as total_units_to_order
            FROM vw_low_stock_alerts
        ");

        return response()->json([
            'report_name' => 'Low Stock & Reorder Alert Report',
            'summary' => $summary,
            'items' => $lowStockItems,
        ]);
    }

    /**
     * Report 3: Top-Selling Products & Category Performance
     */
    public function productPerformanceReport()
    {
        $products = DB::select("
            SELECT * FROM vw_product_performance 
            ORDER BY total_revenue_generated DESC, total_quantity_sold DESC
        ");

        $categoryPerformance = DB::select("
            SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(DISTINCT p.id) as product_count,
                COALESCE(SUM(oi.quantity), 0) as total_units_sold,
                COALESCE(SUM(oi.subtotal), 0.00) as category_revenue
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.order_status <> 'cancelled'
            GROUP BY c.id, c.name
            ORDER BY category_revenue DESC
        ");

        return response()->json([
            'report_name' => 'Top-Selling Products & Category Performance Report',
            'product_rankings' => $products,
            'category_breakdown' => $categoryPerformance,
        ]);
    }

    /**
     * Report 4 (Bonus): Customer Spending & Loyalty Report (Demonstrates fn_CalculateCustomerTotalSpent)
     */
    public function customerSpendingReport()
    {
        $customers = DB::select("
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.created_at,
                fn_CalculateCustomerTotalSpent(u.id) as total_spent,
                (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders
            FROM users u
            WHERE u.role = 'customer'
            ORDER BY total_spent DESC
        ");

        return response()->json([
            'report_name' => 'Customer Spending & Lifetime Value Report',
            'demonstrates_udf' => 'fn_CalculateCustomerTotalSpent(u.id)',
            'customers' => $customers,
        ]);
    }
}
