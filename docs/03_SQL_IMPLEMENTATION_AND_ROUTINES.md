# SQL IMPLEMENTATION & DATABASE PROGRAMMING
## Database Systems 1 — Milestone 3

**System:** Pastil Rice Davao: Inventory and Sales Management System  
**Engine:** MySQL 8.0+ InnoDB  

---

### 1. DDL Implementation (Data Definition Language)
The system schema enforces constraints directly in the storage engine:
- **CREATE Statements:** Defined in `database/sql/01_schema_and_seed.sql` for all 9 tables with strict engine specifications (`ENGINE=InnoDB`).
- **ALTER Statements & Constraints:**
  ```sql
  -- Adding check constraints to enforce non-negative prices and quantities
  ALTER TABLE products ADD CONSTRAINT chk_product_price CHECK (price >= 0.00);
  ALTER TABLE products ADD CONSTRAINT chk_product_cost CHECK (cost_price >= 0.00);
  ALTER TABLE products ADD CONSTRAINT chk_product_stock CHECK (stock_quantity >= 0);
  ALTER TABLE orders ADD CONSTRAINT chk_order_total CHECK (total_amount >= 0.00);
  ALTER TABLE order_items ADD CONSTRAINT chk_item_quantity CHECK (quantity > 0);
  ALTER TABLE reviews ADD CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5);
  ```
- **DROP Statements:** Includes graceful tear-down in reverse foreign key order with safety toggles:
  ```sql
  SET FOREIGN_KEY_CHECKS = 0;
  DROP TABLE IF EXISTS product_price_audits, reviews, inventory_logs, order_items, orders, products, suppliers, categories, users;
  SET FOREIGN_KEY_CHECKS = 1;
  ```

---

### 2. DML Implementation (Data Manipulation Language)
- **INSERT:** Seeded realistic master data across all relations (e.g. 5 users, 5 categories, 4 suppliers, 8 products, orders, order items, inventory logs, and customer reviews).
- **SELECT:** Powers product catalog filtering, customer order history, and business reporting.
- **UPDATE:** Supports product price adjustments (triggering audit logs), stock restocking, and order stage progression (`preparing` &rarr; `delivered`).
- **DELETE:** Enforces relational protection. For example, deleting a category referenced by products is rejected with an SQL error, preserving database integrity.

---

### 3. Complex Queries, Joins, Subqueries & Set Operations

#### A. Multi-Table Joins (4-Table Join)
Joins `orders`, `users`, `order_items`, `products`, and `suppliers` to produce an operational fulfillment manifest:
```sql
SELECT 
    o.order_number,
    o.created_at AS order_timestamp,
    u.name AS registered_customer_name,
    p.name AS ordered_pastil_flavor,
    s.name AS raw_ingredient_supplier,
    oi.quantity AS units_ordered,
    oi.unit_price,
    oi.subtotal AS line_item_subtotal,
    o.order_status
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
ORDER BY o.id DESC, oi.id ASC;
```

#### B. Aggregates with GROUP BY & HAVING
Identifies top revenue-generating pastil categories with a minimum threshold:
```sql
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT p.id) AS total_menu_items,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.subtotal) AS gross_category_revenue
FROM categories c
JOIN products p ON c.id = p.category_id
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_status <> 'cancelled'
GROUP BY c.id, c.name
HAVING gross_category_revenue >= 200.00
ORDER BY gross_category_revenue DESC;
```

#### C. Subqueries (Correlated & Nested IN)
Finds products whose sales volume exceeds the system-wide average:
```sql
SELECT p.id, p.name, p.price,
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
```

#### D. Set Operations (UNION ALL)
Combines active low-stock reorder requirements with recently completed restock events into a consolidated inventory intelligence stream:
```sql
SELECT 
    'RESTOCK NEEDED' AS activity_type,
    p.name AS product_name,
    (p.reorder_level - p.stock_quantity) AS volume,
    CONCAT('Current: ', p.stock_quantity, ' (Reorder at ', p.reorder_level, ')') AS details,
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
```

---

### 4. Stored Procedures (3 Implemented)

#### Procedure 1: `sp_RestockProduct`
- **Purpose:** Restocks product inventory atomically, acquires an exclusive row lock (`FOR UPDATE`), logs the audit entry into `inventory_logs`, and outputs the updated stock level.
- **Signature:**
  ```sql
  CALL sp_RestockProduct(
      IN p_product_id BIGINT,
      IN p_quantity INT,
      IN p_user_id BIGINT,
      IN p_notes VARCHAR(255),
      OUT p_new_stock INT
  );
  ```
- **Verification Example:**
  ```sql
  CALL sp_RestockProduct(3, 50, 1, 'Delivery batch #GENSAN-102', @updated_stock);
  SELECT @updated_stock; -- Returns: 64
  ```

#### Procedure 2: `sp_ProcessOrder`
- **Purpose:** Initiates a customer order transaction, inserts the order header, sets status to `preparing`, and returns the generated primary key.
- **Signature:**
  ```sql
  CALL sp_ProcessOrder(
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
  );
  ```

#### Procedure 3: `sp_GetMonthlySalesReport`
- **Purpose:** Accepts a year and month integer, outputting daily order volume, gross revenue, average tickets, and discounts for administrative reporting.

---

### 5. User-Defined Functions (2 Implemented)

#### Function 1: `fn_CalculateCustomerTotalSpent(p_user_id BIGINT)`
- **Purpose:** Computes the lifetime financial contribution of a registered customer across all non-cancelled orders.
- **Implementation:**
  ```sql
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
  ```
- **Verification:** `SELECT fn_CalculateCustomerTotalSpent(3);` &rarr; Returns `240.00`.

#### Function 2: `fn_GetProductStockStatus(p_stock INT, p_reorder_level INT)`
- **Purpose:** Categorizes a product's stock health into `'OUT_OF_STOCK'`, `'LOW_STOCK'`, or `'IN_STOCK'`.

---

### 6. Database Triggers (3 Implemented)

#### Trigger 1: `trg_prevent_negative_stock` (BEFORE UPDATE)
- **Event & Timing:** Fires before any `UPDATE` on `products`.
- **Logic:** If `NEW.stock_quantity < 0`, signals `SQLSTATE '45000'` with the message:
  `"Operation rejected by trigger: Product stock quantity cannot be negative."`
- **Verification:** An illegal update `UPDATE products SET stock_quantity = -5 WHERE id = 1;` throws Error 1644 (45000) and aborts immediately.

#### Trigger 2: `trg_product_price_audit` (AFTER UPDATE)
- **Event & Timing:** Fires after any `UPDATE` on `products`.
- **Logic:** If `OLD.price <> NEW.price`, automatically creates an audit record in `product_price_audits`.

#### Trigger 3: `trg_after_order_item_insert` (AFTER INSERT)
- **Event & Timing:** Fires after every `INSERT` into `order_items`.
- **Logic:** Automatically calculates and decrements the purchased quantity from `products.stock_quantity`, and inserts an audit log into `inventory_logs` referencing the order ID.

---

### 7. Database Views (3 Implemented)
1. `vw_sales_summary`: Daily aggregated orders, gross revenue, average order value (AOV), and units sold.
2. `vw_low_stock_alerts`: Products at or below reorder threshold, supplier contact details, units needed, and status computed via `fn_GetProductStockStatus`.
3. `vw_product_performance`: Product ranking table showing lifetime units sold, total revenue generated, and order frequency.
