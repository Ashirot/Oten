-- ============================================================================
-- FINAL PROJECT - DATABASE SYSTEMS 1
-- Project Title: Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System
-- File: 03_complex_queries_and_set_operations.sql
-- Platform: MySQL 8.0+
-- Description: Demonstration of Complex SQL Queries, Joins, Aggregates, Subqueries, and Set Operations
-- ============================================================================

USE pastil_rice_davao_db;

-- ----------------------------------------------------------------------------
-- 1. FILTERING, SORTING, AND AGGREGATE QUERIES (COUNT, SUM, AVG, GROUP BY, HAVING)
-- ----------------------------------------------------------------------------

-- Query 1.1: Aggregated Category Sales with HAVING Clause
-- Filters only categories generating at least 200 PHP in total revenue
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(DISTINCT p.id) AS total_menu_items,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.subtotal) AS gross_category_revenue,
    AVG(oi.unit_price) AS average_item_price
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_status <> 'cancelled'
GROUP BY c.id, c.name
HAVING gross_category_revenue >= 200.00
ORDER BY gross_category_revenue DESC;

-- Query 1.2: Daily Order Volume and Payment Distribution
SELECT 
    DATE(created_at) AS sale_date,
    payment_method,
    COUNT(id) AS total_orders,
    SUM(total_amount) AS total_amount_collected,
    AVG(total_amount) AS average_ticket
FROM orders
WHERE order_status = 'delivered'
GROUP BY DATE(created_at), payment_method
ORDER BY sale_date DESC, total_amount_collected DESC;

-- ----------------------------------------------------------------------------
-- 2. MULTI-TABLE JOINS (INNER JOIN, LEFT JOIN ACROSS 4+ TABLES)
-- ----------------------------------------------------------------------------

-- Query 2.1: Complete Customer Sales & Fulfillment Manifest (4-Table Join)
-- Joins: orders -> users -> order_items -> products -> suppliers
SELECT 
    o.order_number,
    o.created_at AS order_timestamp,
    u.name AS registered_customer_name,
    u.email AS customer_email,
    p.name AS ordered_pastil_flavor,
    s.name AS raw_ingredient_supplier,
    oi.quantity AS units_ordered,
    oi.unit_price,
    oi.subtotal AS line_item_subtotal,
    o.order_status,
    o.payment_method
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
ORDER BY o.id DESC, oi.id ASC;

-- ----------------------------------------------------------------------------
-- 3. SUBQUERIES (CORRELATED, IN, SCALAR SUBQUERIES)
-- ----------------------------------------------------------------------------

-- Query 3.1: Products with Above-Average Sales Volume (Subquery in WHERE)
SELECT 
    p.id,
    p.name,
    p.price,
    (SELECT SUM(quantity) FROM order_items WHERE product_id = p.id) AS units_sold
FROM products p
WHERE p.id IN (
    SELECT product_id 
    FROM order_items 
    GROUP BY product_id 
    HAVING SUM(quantity) > (
        SELECT AVG(total_qty) 
        FROM (SELECT SUM(quantity) AS total_qty FROM order_items GROUP BY product_id) AS avg_sales
    )
);

-- Query 3.2: Correlated Subquery showing Customer Orders and Recent Review
SELECT 
    u.id AS user_id,
    u.name AS customer_name,
    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders_count,
    (SELECT AVG(rating) FROM reviews r WHERE r.user_id = u.id) AS average_satisfaction_rating,
    (SELECT comment FROM reviews r WHERE r.user_id = u.id ORDER BY r.id DESC LIMIT 1) AS latest_feedback
FROM users u
WHERE u.role = 'customer';

-- ----------------------------------------------------------------------------
-- 4. SET OPERATIONS: UNION / UNION ALL
-- ----------------------------------------------------------------------------

-- Query 4.1: Unified Inventory Movement & Reorder Stream (UNION ALL)
-- Combines active low-stock deficit alerts with recent restock transactions
SELECT 
    'RESTOCK NEEDED' AS activity_type,
    p.name AS product_name,
    (p.reorder_level - p.stock_quantity) AS volume,
    CONCAT('Current stock: ', p.stock_quantity, ' (Threshold: ', p.reorder_level, ')') AS details,
    NOW() AS event_time
FROM products p
WHERE p.stock_quantity <= p.reorder_level

UNION ALL

SELECT 
    'RECENT RESTOCK COMPLETED' AS activity_type,
    p.name AS product_name,
    il.quantity AS volume,
    CONCAT('Logged from ', il.stock_before, ' to ', il.stock_after) AS details,
    il.created_at AS event_time
FROM inventory_logs il
JOIN products p ON il.product_id = p.id
WHERE il.movement_type = 'restock'

ORDER BY event_time DESC;
