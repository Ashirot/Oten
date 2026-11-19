<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'orders_customer_history_idx');
        });
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['product_id', 'created_at'], 'reviews_product_recent_idx');
        });

        // The old view joined order_items before SUM(orders.total_amount),
        // counting the full order total once for each item in a multi-item order.
        DB::unprepared("
            CREATE OR REPLACE VIEW vw_sales_summary AS
            SELECT
                DATE(o.created_at) AS sale_date,
                COUNT(*) AS total_orders,
                SUM(o.total_amount) AS total_revenue,
                AVG(o.total_amount) AS average_order_value,
                SUM(COALESCE(items.units, 0)) AS total_items_sold
            FROM orders o
            LEFT JOIN (
                SELECT order_id, SUM(quantity) AS units
                FROM order_items
                GROUP BY order_id
            ) items ON items.order_id = o.id
            WHERE o.order_status <> 'cancelled'
            GROUP BY DATE(o.created_at)
        ");

        // Cancelled orders must not contribute items or revenue to rankings.
        DB::unprepared("
            CREATE OR REPLACE VIEW vw_product_performance AS
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                c.name AS category_name,
                p.price AS current_price,
                p.stock_quantity AS current_stock,
                COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity ELSE 0 END), 0) AS total_quantity_sold,
                COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.subtotal ELSE 0 END), 0.00) AS total_revenue_generated,
                COUNT(DISTINCT o.id) AS number_of_orders
            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.order_status <> 'cancelled'
            GROUP BY p.id, p.name, c.name, p.price, p.stock_quantity
        ");

        // Link price audits to the employee responsible when an API edit
        // supplies a request-scoped MySQL session variable.
        DB::unprepared('DROP TRIGGER IF EXISTS trg_product_price_audit');
        DB::unprepared("
            CREATE TRIGGER trg_product_price_audit
            AFTER UPDATE ON products
            FOR EACH ROW
            BEGIN
                IF OLD.price <> NEW.price THEN
                    INSERT INTO product_price_audits
                        (product_id, old_price, new_price, changed_at, changed_by)
                    VALUES (OLD.id, OLD.price, NEW.price, NOW(), @app_employee_id);
                END IF;
            END
        ");
    }

    public function down(): void
    {
        throw new \RuntimeException('Restore the database backup to reverse the upgraded reporting views.');
    }
};
