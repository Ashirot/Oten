<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing if any
        DB::unprepared("DROP TRIGGER IF EXISTS trg_prevent_negative_stock");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_product_price_audit");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_after_order_item_insert");
        DB::unprepared("DROP FUNCTION IF EXISTS fn_CalculateCustomerTotalSpent");
        DB::unprepared("DROP FUNCTION IF EXISTS fn_GetProductStockStatus");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_RestockProduct");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_ProcessOrder");
        DB::unprepared("DROP VIEW IF EXISTS vw_sales_summary");
        DB::unprepared("DROP VIEW IF EXISTS vw_low_stock_alerts");
        DB::unprepared("DROP VIEW IF EXISTS vw_product_performance");

        // 1. Function: fn_CalculateCustomerTotalSpent
        DB::unprepared("
            CREATE FUNCTION fn_CalculateCustomerTotalSpent(p_user_id BIGINT)
            RETURNS DECIMAL(10,2)
            DETERMINISTIC
            READS SQL DATA
            BEGIN
                DECLARE v_total DECIMAL(10,2);
                SELECT COALESCE(SUM(total_amount), 0.00)
                INTO v_total
                FROM orders
                WHERE user_id = p_user_id
                  AND order_status IN ('delivered', 'preparing', 'out_for_delivery');
                RETURN v_total;
            END
        ");

        // 2. Function: fn_GetProductStockStatus
        DB::unprepared("
            CREATE FUNCTION fn_GetProductStockStatus(p_stock INT, p_reorder_level INT)
            RETURNS VARCHAR(20)
            DETERMINISTIC
            NO SQL
            BEGIN
                IF p_stock <= 0 THEN
                    RETURN 'OUT_OF_STOCK';
                ELSEIF p_stock <= p_reorder_level THEN
                    RETURN 'LOW_STOCK';
                ELSE
                    RETURN 'IN_STOCK';
                END IF;
            END
        ");

        // 3. Stored Procedure: sp_RestockProduct
        DB::unprepared("
            CREATE PROCEDURE sp_RestockProduct(
                IN p_product_id BIGINT,
                IN p_quantity INT,
                IN p_user_id BIGINT,
                IN p_notes VARCHAR(255),
                OUT p_new_stock INT
            )
            BEGIN
                DECLARE v_current_stock INT DEFAULT 0;

                IF p_quantity <= 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Restock quantity must be greater than zero.';
                END IF;

                START TRANSACTION;
                    SELECT stock_quantity INTO v_current_stock
                    FROM products
                    WHERE id = p_product_id
                    FOR UPDATE;

                    IF v_current_stock IS NULL THEN
                        ROLLBACK;
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Product not found.';
                    END IF;

                    SET p_new_stock = v_current_stock + p_quantity;

                    UPDATE products
                    SET stock_quantity = p_new_stock,
                        updated_at = NOW()
                    WHERE id = p_product_id;

                    INSERT INTO inventory_logs (
                        product_id, movement_type, quantity, stock_before, stock_after,
                        reference_type, notes, performed_by, created_at
                    ) VALUES (
                        p_product_id, 'restock', p_quantity, v_current_stock, p_new_stock,
                        'manual_restock', p_notes, p_user_id, NOW()
                    );
                COMMIT;
            END
        ");

        // 4. Stored Procedure: sp_ProcessOrder
        DB::unprepared("
            CREATE PROCEDURE sp_ProcessOrder(
                IN p_order_number VARCHAR(50),
                IN p_user_id BIGINT,
                IN p_customer_name VARCHAR(150),
                IN p_customer_phone VARCHAR(50),
                IN p_delivery_address TEXT,
                IN p_delivery_landmark VARCHAR(255),
                IN p_delivery_instructions TEXT,
                IN p_subtotal DECIMAL(10,2),
                IN p_discount DECIMAL(10,2),
                IN p_service_fee DECIMAL(10,2),
                IN p_total DECIMAL(10,2),
                IN p_payment_method VARCHAR(20),
                OUT p_order_id BIGINT
            )
            BEGIN
                START TRANSACTION;
                    INSERT INTO orders (
                        order_number, user_id, customer_name, customer_phone,
                        delivery_address, delivery_landmark, delivery_instructions,
                        subtotal, discount_amount, service_fee, total_amount,
                        payment_method, payment_status, order_status, created_at, updated_at
                    ) VALUES (
                        p_order_number, p_user_id, p_customer_name, p_customer_phone,
                        p_delivery_address, p_delivery_landmark, p_delivery_instructions,
                        p_subtotal, p_discount, p_service_fee, p_total,
                        p_payment_method, 'pending', 'preparing', NOW(), NOW()
                    );

                    SET p_order_id = LAST_INSERT_ID();
                COMMIT;
            END
        ");

        // 5. Trigger: trg_prevent_negative_stock
        DB::unprepared("
            CREATE TRIGGER trg_prevent_negative_stock
            BEFORE UPDATE ON products
            FOR EACH ROW
            BEGIN
                IF NEW.stock_quantity < 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Operation rejected by trigger: Product stock quantity cannot be negative.';
                END IF;
            END
        ");

        // 6. Trigger: trg_product_price_audit
        DB::unprepared("
            CREATE TRIGGER trg_product_price_audit
            AFTER UPDATE ON products
            FOR EACH ROW
            BEGIN
                IF OLD.price <> NEW.price THEN
                    INSERT INTO product_price_audits (
                        product_id, old_price, new_price, changed_at
                    ) VALUES (
                        OLD.id, OLD.price, NEW.price, NOW()
                    );
                END IF;
            END
        ");

        // 7. Trigger: trg_after_order_item_insert
        DB::unprepared("
            CREATE TRIGGER trg_after_order_item_insert
            AFTER INSERT ON order_items
            FOR EACH ROW
            BEGIN
                DECLARE v_old_stock INT;
                SELECT stock_quantity INTO v_old_stock
                FROM products
                WHERE id = NEW.product_id;

                UPDATE products
                SET stock_quantity = stock_quantity - NEW.quantity,
                    updated_at = NOW()
                WHERE id = NEW.product_id;

                INSERT INTO inventory_logs (
                    product_id, movement_type, quantity, stock_before, stock_after,
                    reference_type, reference_id, notes, created_at
                ) VALUES (
                    NEW.product_id, 'sale', NEW.quantity, v_old_stock, (v_old_stock - NEW.quantity),
                    'order', NEW.order_id, CONCAT('Ordered in Order #', NEW.order_id), NOW()
                );
            END
        ");

        // 8. Views
        DB::unprepared("
            CREATE VIEW vw_sales_summary AS
            SELECT 
                DATE(o.created_at) as sale_date,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(o.total_amount) as total_revenue,
                AVG(o.total_amount) as average_order_value,
                SUM(oi.quantity) as total_items_sold
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.order_status <> 'cancelled'
            GROUP BY DATE(o.created_at)
        ");

        DB::unprepared("
            CREATE VIEW vw_low_stock_alerts AS
            SELECT 
                p.id,
                p.name as product_name,
                c.name as category_name,
                s.name as supplier_name,
                s.contact_person as supplier_contact,
                s.phone as supplier_phone,
                p.stock_quantity,
                p.reorder_level,
                (p.reorder_level - p.stock_quantity) as units_needed,
                fn_GetProductStockStatus(p.stock_quantity, p.reorder_level) as stock_status
            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.stock_quantity <= p.reorder_level
              AND p.is_active = 1
        ");

        DB::unprepared("
            CREATE VIEW vw_product_performance AS
            SELECT 
                p.id as product_id,
                p.name as product_name,
                c.name as category_name,
                p.price as current_price,
                p.stock_quantity as current_stock,
                COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
                COALESCE(SUM(oi.subtotal), 0.00) as total_revenue_generated,
                COUNT(DISTINCT o.id) as number_of_orders
            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.order_status <> 'cancelled'
            GROUP BY p.id, p.name, c.name, p.price, p.stock_quantity
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP VIEW IF EXISTS vw_product_performance");
        DB::unprepared("DROP VIEW IF EXISTS vw_low_stock_alerts");
        DB::unprepared("DROP VIEW IF EXISTS vw_sales_summary");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_after_order_item_insert");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_product_price_audit");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_prevent_negative_stock");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_ProcessOrder");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_RestockProduct");
        DB::unprepared("DROP FUNCTION IF EXISTS fn_GetProductStockStatus");
        DB::unprepared("DROP FUNCTION IF EXISTS fn_CalculateCustomerTotalSpent");
    }
};
