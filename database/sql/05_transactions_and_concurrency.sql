-- ============================================================================
-- FINAL PROJECT - DATABASE SYSTEMS 1
-- Project Title: Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System
-- File: 05_transactions_and_concurrency.sql
-- Platform: MySQL 8.0+
-- Description: Milestone 5 / Section E: Transaction Management and Concurrency Control
-- ============================================================================

USE pastil_rice_davao_db;

-- ============================================================================
-- 1. TRANSACTION DEMONSTRATION WITH COMMIT (SUCCESS CASE)
-- ============================================================================

-- Scenario: A customer places an order for 2 units of 'Beef Pastil' (Product ID: 1).
-- Operations involved:
-- 1. Lock product row to verify stock availability.
-- 2. Insert order header into orders.
-- 3. Insert line item into order_items.
-- 4. Automatic database trigger trg_after_order_item_insert fires, reducing stock
--    and writing to inventory_logs.
-- 5. COMMIT transaction, ensuring all changes persist atomically.

START TRANSACTION;

-- Step 1: Pessimistic Row Lock (SELECT ... FOR UPDATE)
SELECT id, name, price, stock_quantity 
FROM products 
WHERE id = 1 
FOR UPDATE;

-- Step 2: Insert into orders header
INSERT INTO orders (
    order_number, user_id, customer_name, customer_phone,
    delivery_address, subtotal, discount_amount, service_fee, total_amount,
    payment_method, payment_status, order_status, created_at, updated_at
) VALUES (
    'TX-DEMO-001', 3, 'Maria C.', '09201112233',
    'Matina Aplaya, Davao City', 240.00, 0.00, 0.00, 240.00,
    'cod', 'pending', 'preparing', NOW(), NOW()
);

SET @demo_order_id = LAST_INSERT_ID();

-- Step 3: Insert order line items (Trigger fires automatically)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
VALUES (@demo_order_id, 1, 2, 120.00, 240.00);

-- Step 4: Verify intermediate state before commit
SELECT id, name, stock_quantity FROM products WHERE id = 1;
SELECT * FROM inventory_logs WHERE reference_id = @demo_order_id;

-- Step 5: Commit changes permanently
COMMIT;

-- Consistency Explanation:
-- Atomicity: Both the order header and line items are saved together; neither can exist without the other.
-- Consistency: The product stock is decremented accurately and an audit record is created simultaneously.
-- Isolation: The FOR UPDATE lock prevents any other connection from seeing or deducting stale stock.
-- Durability: Once COMMIT executes, changes survive database server restarts.


-- ============================================================================
-- 2. TRANSACTION DEMONSTRATION WITH ROLLBACK (ERROR / INTEGRITY VIOLATION CASE)
-- ============================================================================

-- Scenario: An order is started, but during the process an invalid operation occurs
-- (such as attempting to set stock to a negative number or system failure).
-- The transaction issues ROLLBACK, ensuring zero dirty or orphaned records exist.

START TRANSACTION;

INSERT INTO orders (
    order_number, user_id, customer_name, customer_phone,
    delivery_address, subtotal, total_amount, payment_method, order_status
) VALUES (
    'TX-DEMO-FAIL', 3, 'Rollback Test User', '09120000000',
    'Lanang, Davao City', 500.00, 500.00, 'cod', 'pending'
);

-- Simulate error: attempting to update stock to negative value
-- This triggers trg_prevent_negative_stock which raises SQLSTATE 45000:
-- UPDATE products SET stock_quantity = -10 WHERE id = 1;

-- When the error is caught by the application handler, a ROLLBACK is executed:
ROLLBACK;

-- Verification: Confirm that 'TX-DEMO-FAIL' was completely rolled back
SELECT * FROM orders WHERE order_number = 'TX-DEMO-FAIL';
-- (Returns empty set: Atomicity preserved!)


-- ============================================================================
-- 3. CONCURRENCY ISSUES & LOCKING MECHANISMS DISCUSSION
-- ============================================================================

/*
1. Possible Concurrency Issue: Race Condition / Lost Update Anomaly
   - Situation: Suppose product "Family Pack" has only 1 unit remaining in stock.
   - Two customers (Customer A and Customer B) submit an order at the exact same millisecond.
   - Without concurrency control:
       Session A reads stock = 1 (valid)
       Session B reads stock = 1 (valid)
       Session A deducts 1 -> stock becomes 0
       Session B deducts 1 -> stock becomes -1 (Overselling / Data corruption!)
       
2. How MySQL & InnoDB Manage Concurrency:
   a. Transaction Isolation Levels:
      - MySQL InnoDB defaults to REPEATABLE READ.
      - In REPEATABLE READ, Consistent Non-locking Reads (MVCC - Multi-Version Concurrency Control)
        read snapshots of data without blocking read queries.
   
   b. Pessimistic Row-Level Locking (SELECT ... FOR UPDATE):
      - When Session A executes `SELECT * FROM products WHERE id = 1 FOR UPDATE;`,
        InnoDB sets an exclusive write lock (X-lock) on the index record.
      - Session B's transaction attempting to lock or update the same record is placed into a
        lock-wait queue until Session A executes COMMIT or ROLLBACK.
      - When Session B resumes, it reads the updated stock (0) and safely halts the order
        with an "Insufficient Stock" message.
        
   c. Database-Level Check Constraints & Trigger Backstop:
      - As a secondary defense line, our BEFORE UPDATE trigger `trg_prevent_negative_stock`
        and CHECK constraint `chk_product_stock` will immediately abort any transaction
        attempting to drive stock below zero.
*/
