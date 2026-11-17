# MASTER PROJECT DOCUMENTATION
# Database Systems 1 — Final Project

**Project Title:** Design and Development of a Database-Driven Information System: *Pastil Rice Davao Management System*  
**Course:** Database Systems 1  
**Project Type:** Group Project / Individual Capstone  
**Target Organization:** Pastil Rice Davao (Mindanao Food Service & Delivery)  
**Technology Architecture:**
- **Backend:** Laravel 11/12 (PHP 8.4 REST API Architecture)
- **Frontend:** ReactJS 19 (Single-Page Application SPA)
- **Styling:** Tailwind CSS 4
- **Database Engine:** MySQL 8.0+ (InnoDB Storage Engine)

---

## 1. Submission Deliverables Checklist (13/13 Complete)

- [x] **1. Project Proposal** (See [`docs/01_PROJECT_PROPOSAL.md`](file:///d:/Project/docs/01_PROJECT_PROPOSAL.md))
- [x] **2. Complete Project Documentation** (This consolidated master document)
- [x] **3. ERD and Relational Schema** (See [`docs/02_DATABASE_DESIGN_AND_ERD.md`](file:///d:/Project/docs/02_DATABASE_DESIGN_AND_ERD.md))
- [x] **4. Normalization Explanation (1NF, 2NF, 3NF)** (Section 3 of this document)
- [x] **5. Data Dictionary** (Section 4 of this document)
- [x] **6. SQL file containing database creation and sample data** (See [`database/sql/01_schema_and_seed.sql`](file:///d:/Project/database/sql/01_schema_and_seed.sql))
- [x] **7. SQL file containing procedures, functions, triggers, and queries** (See [`database/sql/02_procedures_functions_triggers.sql`](file:///d:/Project/database/sql/02_procedures_functions_triggers.sql) & [`database/sql/03_complex_queries_and_set_operations.sql`](file:///d:/Project/database/sql/03_complex_queries_and_set_operations.sql))
- [x] **8. Working application source code** (Laravel backend in `app/`, `routes/`, `database/`; ReactJS frontend in `resources/js/`)
- [x] **9. Query optimization evidence and explanation** (See [`database/sql/04_query_optimization.sql`](file:///d:/Project/database/sql/04_query_optimization.sql) & [`docs/04_QUERY_OPTIMIZATION_AND_TRANSACTIONS.md`](file:///d:/Project/docs/04_QUERY_OPTIMIZATION_AND_TRANSACTIONS.md))
- [x] **10. Testing results and test matrix** (See [`docs/06_TESTING_RESULTS_AND_TEST_MATRIX.md`](file:///d:/Project/docs/06_TESTING_RESULTS_AND_TEST_MATRIX.md))
- [x] **11. User guide** (See [`docs/07_USER_GUIDE.md`](file:///d:/Project/docs/07_USER_GUIDE.md))
- [x] **12. Presentation slides outline / script** (See [`docs/08_PRESENTATION_SLIDES_OUTLINE.md`](file:///d:/Project/docs/08_PRESENTATION_SLIDES_OUTLINE.md))
- [x] **13. Demo video or live demonstration script** (See [`docs/09_LIVE_DEMO_SCRIPT.md`](file:///d:/Project/docs/09_LIVE_DEMO_SCRIPT.md))

---

## 2. System Architecture & Requirements Summary

### 2.1 Problem Description
Pastil Rice Davao serves freshly cooked pastil meals across Davao City. Prior to system deployment, order tracking, ingredient restocking, and profit calculation relied on disparate paper slips and spreadsheets. During lunch rushes, inventory stockouts frequently led to customer dissatisfaction, unrecorded raw material wastage, and lack of accountability.

### 2.2 System Solution
A full-stack, database-enforced management system:
1. **Front-facing Ordering Portal:** Allows customers to browse pastil dishes with dynamic stock badges, pick quantities, and place orders with GPS drop-off mapping.
2. **Back-office Management Dashboard:** Provides kitchen staff and managers with real-time order tracking, supplier management, and instant restocking via stored procedures.
3. **Database Integrity Engine:** Uses MySQL triggers, foreign key constraints, and check constraints to guarantee that data corruption (such as negative stock or unlinked orders) is physically impossible at the database engine level.

---

## 3. Relational Schema & 3NF Normalization

### 3.1 Relational Schema Representation
```text
USERS (id [PK], name, email [UQ], password, role, phone, address, created_at, updated_at)
CATEGORIES (id [PK], name, slug [UQ], description, created_at, updated_at)
SUPPLIERS (id [PK], name, contact_person, phone, email, address, created_at, updated_at)
PRODUCTS (id [PK], category_id [FK], supplier_id [FK], name, slug [UQ], description, price, cost_price, stock_quantity, reorder_level, rating, image_url, is_active, created_at, updated_at)
ORDERS (id [PK], order_number [UQ], user_id [FK], customer_name, customer_phone, delivery_address, delivery_landmark, delivery_instructions, subtotal, discount_amount, service_fee, total_amount, payment_method, payment_status, order_status, created_at, updated_at)
ORDER_ITEMS (id [PK], order_id [FK], product_id [FK], quantity, unit_price, subtotal, created_at, updated_at)
INVENTORY_LOGS (id [PK], product_id [FK], movement_type, quantity, stock_before, stock_after, reference_type, reference_id, notes, performed_by [FK], created_at)
REVIEWS (id [PK], order_id [FK], user_id [FK], product_id [FK], rating, comment, created_at, updated_at)
PRODUCT_PRICE_AUDITS (id [PK], product_id [FK], old_price, new_price, changed_at, changed_by [FK])
```

### 3.2 Normalization Proof
- **1NF:** Every column contains atomic values (no repeating sets or comma-delimited fields). Every relation possesses a declared primary key.
- **2NF:** No partial dependencies. All non-prime attributes in `ORDER_ITEMS` depend fully on the surrogate key `id` rather than partially on composite keys.
- **3NF:** No transitive dependencies. Category descriptions depend solely on `category_id`; supplier details depend solely on `supplier_id`; user attributes depend solely on `user_id`. Every non-key attribute depends strictly on the primary key.

---

## 4. Database Programming Summary

### 4.1 Stored Procedures (3)
1. `sp_RestockProduct`: Restocks inventory atomically using `SELECT ... FOR UPDATE` row locks, logs into `inventory_logs`, and outputs updated stock.
2. `sp_ProcessOrder`: Initiates an order header within a managed transaction.
3. `sp_GetMonthlySalesReport`: Aggregates order volume, revenue, and discounts by year and month.

### 4.2 User-Defined Functions (2)
1. `fn_CalculateCustomerTotalSpent(p_user_id)`: Returns total revenue generated by a customer across completed orders.
2. `fn_GetProductStockStatus(p_stock, p_reorder_level)`: Dynamically categorizes stock level as `IN_STOCK`, `LOW_STOCK`, or `OUT_OF_STOCK`.

### 4.3 Database Triggers (3)
1. `trg_after_order_item_insert` (AFTER INSERT): Automatically deducts purchased quantities from `products.stock_quantity` and inserts an audit log into `inventory_logs`.
2. `trg_prevent_negative_stock` (BEFORE UPDATE): Rejects any update where `NEW.stock_quantity < 0` by signalling `SQLSTATE 45000`.
3. `trg_product_price_audit` (AFTER UPDATE): Automatically writes previous and new prices to `product_price_audits` whenever product price is altered.

### 4.4 Database Views (3)
1. `vw_sales_summary`: Daily aggregated orders, gross revenue, average order value, and units sold.
2. `vw_low_stock_alerts`: Products at or below reorder threshold, supplier contact details, units needed, and status computed via UDF.
3. `vw_product_performance`: Product ranking table showing lifetime units sold, total revenue generated, and order frequency.

---

## 5. Query Optimization & Transaction Control Summary

- **Query Optimization 1:** Composite B-Tree index on `orders(order_status, created_at)` reduces full table scans (`ALL`) into indexed `range` scans for date-filtered order queries.
- **Query Optimization 2:** Eliminates correlated scalar subqueries by rewriting category revenue calculations into a single-pass indexed `LEFT JOIN` with `GROUP BY`.
- **Transaction Management:** ACID guarantees demonstrated with `START TRANSACTION`, `COMMIT`, and `ROLLBACK`. Pessimistic row locking (`SELECT ... FOR UPDATE`) guarantees complete consistency against lost updates during concurrent rushes.

---

## 6. How to Run & Grade the Project
1. Ensure MySQL is running on `127.0.0.1:3306` with credentials in `.env`.
2. Run database setup:
   ```bash
   php artisan migrate:fresh --seed
   ```
3. Build React & Tailwind assets:
   ```bash
   npm run build
   ```
4. Start server:
   ```bash
   php artisan serve
   ```
5. Visit `http://127.0.0.1:8000`. Use the 1-click demo buttons in the **Sign In** modal to evaluate as Admin, Staff, or Customer!
