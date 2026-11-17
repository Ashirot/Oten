-- ============================================================================
-- FINAL PROJECT - DATABASE SYSTEMS 1
-- Project Title: Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System
-- File: 02_procedures_functions_triggers.sql
-- Platform: MySQL 8.0+
-- Description: Stored Procedures, User-Defined Functions, Triggers, and Database Views
-- ============================================================================

USE pastil_rice_davao_db;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- 1. USER-DEFINED FUNCTIONS (UDF)
-- ----------------------------------------------------------------------------

-- Function 1: Calculate Customer Lifetime Spending Across Completed Orders
DROP FUNCTION IF EXISTS fn_CalculateCustomerTotalSpent$$
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
END$$

-- Function 2: Categorize Stock Level into Status Enum Strings
DROP FUNCTION IF EXISTS fn_GetProductStockStatus$$
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
END$$

-- ----------------------------------------------------------------------------
-- 2. STORED PROCEDURES
-- ----------------------------------------------------------------------------

-- Procedure 1: sp_RestockProduct (Replenish Product Stock with Transaction & Audit Logging)
DROP PROCEDURE IF EXISTS sp_RestockProduct$$
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
        SET MESSAGE_TEXT = 'Validation Error: Restock quantity must be greater than zero.';
    END IF;

    START TRANSACTION;
        -- Pessimistic Lock for concurrency protection
        SELECT stock_quantity INTO v_current_stock
        FROM products
        WHERE id = p_product_id
        FOR UPDATE;

        IF v_current_stock IS NULL THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lookup Error: Product not found.';
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
            'supplier_delivery', p_notes, p_user_id, NOW()
        );
    COMMIT;
END$$

-- Procedure 2: sp_ProcessOrder (Atomic Order Creation with Transaction Control)
DROP PROCEDURE IF EXISTS sp_ProcessOrder$$
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
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

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
END$$

-- Procedure 3: sp_GetMonthlySalesReport (Monthly Sales Aggregation Procedure)
DROP PROCEDURE IF EXISTS sp_GetMonthlySalesReport$$
CREATE PROCEDURE sp_GetMonthlySalesReport(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        DATE(created_at) AS report_date,
        COUNT(id) AS total_orders,
        SUM(total_amount) AS daily_revenue,
        AVG(total_amount) AS avg_ticket,
        SUM(discount_amount) AS total_discounts
    FROM orders
    WHERE YEAR(created_at) = p_year
      AND MONTH(created_at) = p_month
      AND order_status <> 'cancelled'
    GROUP BY DATE(created_at)
    ORDER BY report_date ASC;
END$$

-- ----------------------------------------------------------------------------
-- 3. TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger 1: Enforce Non-Negative Stock Quantity (BEFORE UPDATE)
DROP TRIGGER IF EXISTS trg_prevent_negative_stock$$
CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operation rejected by trigger: Product stock quantity cannot be negative.';
    END IF;
END$$

-- Trigger 2: Audit Product Price Modifications (AFTER UPDATE)
DROP TRIGGER IF EXISTS trg_product_price_audit$$
CREATE TRIGGER trg_product_price_audit
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.price <> NEW.price THEN
        INSERT INTO product_price_audits (
            product_id, old_price, new_price, changed_at, changed_by
        ) VALUES (
            OLD.id, OLD.price, NEW.price, NOW(), NULL
        );
    END IF;
END$$

-- Trigger 3: Automatic Stock Decrement and Inventory Audit Trail (AFTER INSERT)
DROP TRIGGER IF EXISTS trg_after_order_item_insert$$
CREATE TRIGGER trg_after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE v_old_stock INT;
    
    SELECT stock_quantity INTO v_old_stock
    FROM products
    WHERE id = NEW.product_id;

    -- Decrement stock in products table
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    -- Automatically generate an audit entry in inventory_logs
    INSERT INTO inventory_logs (
        product_id, movement_type, quantity, stock_before, stock_after,
        reference_type, reference_id, notes, created_at
    ) VALUES (
        NEW.product_id, 'sale', NEW.quantity, v_old_stock, (v_old_stock - NEW.quantity),
        'order', NEW.order_id, CONCAT('Sold in Order #', NEW.order_id), NOW()
    );
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 4. DATABASE VIEWS
-- ----------------------------------------------------------------------------

-- View 1: Sales Daily Summary
DROP VIEW IF EXISTS vw_sales_summary;
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
GROUP BY DATE(o.created_at);

-- View 2: Low Stock and Reorder Alerts
DROP VIEW IF EXISTS vw_low_stock_alerts;
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
  AND p.is_active = 1;

-- View 3: Product Performance Rankings
DROP VIEW IF EXISTS vw_product_performance;
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
GROUP BY p.id, p.name, c.name, p.price, p.stock_quantity;
