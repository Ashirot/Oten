# FINAL PRESENTATION SLIDES & DEFENSE OUTLINE
## Database Systems 1 — Final Project Defense

**Project Title:** Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System  
**Presentation Time:** 10–15 Minutes  
**Format:** 10 Structured Slides matching Rubric & Section 7 Guidelines  

---

### Slide 1: Title Slide & Project Identification
- **Title:** Pastil Rice Davao — Database-Driven Ordering, Inventory, and Sales Management System
- **Course:** Database Systems 1 (Final Project Presentation)
- **Topic:** Topic 2 — Inventory and Sales Management System
- **Tech Stack:** Laravel 11/12 (PHP 8.4 REST API), ReactJS 19, Tailwind CSS 4, MySQL 8.0 Engine
- **Presenter Roles:**
  - *Speaker 1:* Problem statement, objectives, scope, and user roles.
  - *Speaker 2:* ERD, 3NF normalization, business rules, and constraints.
  - *Speaker 3:* SQL features (procedures, functions, triggers, joins, subqueries).
  - *Speaker 4:* Application demo, query optimization, and transaction concurrency.

---

### Slide 2: Problem Statement & Objectives
- **The Problem:**
  - Davao pastil food ventures struggle with manual paper logs and static spreadsheets.
  - Frequent overselling of out-of-stock kagikit (shredded beef/chicken/tuna).
  - Lack of audit trails for supplier restocking and price changes.
  - Manual, error-prone sales calculations and stockout risks during rush hours.
- **Project Objectives:**
  - Build a 3NF-normalized relational database in MySQL 8.0.
  - Enforce business integrity using triggers, check constraints, and foreign keys.
  - Implement stored procedures and functions to automate ordering and restocks.
  - Optimize query execution plans with indexing and subquery elimination.
  - Ensure 100% ACID transaction atomicity and concurrency control.

---

### Slide 3: System Scope & User Roles
- **Target Setting:** Pastil Rice Davao (Mindanao fast-casual dining & food delivery).
- **Users & Role-Based Access:**
  - **👑 Administrator:** Catalog CRUD, Stored Procedure Restocking, Business Reports, and Database Diagnostic Suite.
  - **💼 Staff / Kitchen:** Order status tracker, kitchen dispatching, and stock alert monitoring.
  - **🛒 Customer:** Menu browsing, cart quantity picker, Davao GPS delivery routing, order tracking, and review submission.
- **System Scope:**
  - 9 Interconnected Database Tables in MySQL.
  - Full-stack CRUD with input validation and error handling.
  - 4 Business Intelligence Reports and Database Testing Laboratory.

---

### Slide 4: Relational Database Design & ERD
- **ERD Architecture:**
  - `USERS` (1:N) &rarr; `ORDERS`, `REVIEWS`, `INVENTORY_LOGS`, `PRODUCT_PRICE_AUDITS`
  - `CATEGORIES` (1:N) &rarr; `PRODUCTS` (`ON DELETE RESTRICT`)
  - `SUPPLIERS` (1:N) &rarr; `PRODUCTS` (`ON DELETE SET NULL`)
  - `PRODUCTS` (1:N) &rarr; `ORDER_ITEMS`, `INVENTORY_LOGS`, `REVIEWS`, `PRODUCT_PRICE_AUDITS`
  - `ORDERS` (1:N) &rarr; `ORDER_ITEMS` (`ON DELETE CASCADE`), `REVIEWS`
- **Data Integrity & Constraints:**
  - Primary Keys on all tables with InnoDB auto-increment.
  - Domain constraints: `chk_product_price`, `chk_product_stock`, `chk_item_quantity`, `chk_review_rating`.

---

### Slide 5: Normalization (UNF &rarr; 3NF) & Business Rules
- **UNF &rarr; 1NF:** Eliminating repeating items; converting comma-separated dishes into discrete relational rows with atomic attributes.
- **1NF &rarr; 2NF:** Eliminating partial dependencies; moving product descriptions and category attributes out of the composite order item relation into `PRODUCTS`.
- **2NF &rarr; 3NF:** Eliminating transitive dependencies; moving category descriptions into `CATEGORIES` and supplier details into `SUPPLIERS`.
- **Anomaly Prevention:**
  - *Insertion:* Add new suppliers without creating dummy orders.
  - *Deletion:* Removing a cancelled order preserves customer and product records.
  - *Update:* Changing a supplier phone number requires editing exactly one row.

---

### Slide 6: SQL Implementation & Database Programming
- **Stored Procedures:**
  - `sp_RestockProduct`: Atomically replenishes stock, writes to `inventory_logs`, and returns updated count.
  - `sp_ProcessOrder`: Initiates atomic order transactions.
- **User-Defined Functions (UDF):**
  - `fn_CalculateCustomerTotalSpent`: Computes customer lifetime value across completed orders.
  - `fn_GetProductStockStatus`: Classifies inventory into `IN_STOCK`, `LOW_STOCK`, or `OUT_OF_STOCK`.
- **Database Triggers:**
  - `trg_after_order_item_insert`: Automatic stock deduction and inventory movement logging.
  - `trg_prevent_negative_stock`: Signals `SQLSTATE 45000` to prevent stock from dropping below zero.
  - `trg_product_price_audit`: Automatically audits historical price modifications.
- **Advanced SQL:**
  - 4-Table JOINs, correlated subqueries, and `UNION ALL` inventory intelligence stream.

---

### Slide 7: Live Application Demonstration
- **Customer Storefront:**
  - Hero showcase carousel with live pastil highlights.
  - Category filtering (Beef, Chicken, Seafood, Combo, Sides & Drinks).
  - Interactive shopping cart with quantity picker and free delivery discounts.
  - Checkout modal with interactive OpenStreetMap/Leaflet GPS map of Davao City.
  - Real-time order progress tracker and 5-star customer review submission.
- **Administrative Panel:**
  - Product catalog CRUD and restock procedure invocation.
  - Order progression and customer dispatch manifest.
  - 4 Business reports (Sales Analytics, Low Stock Reorders, Rankings, Customer LTV).

---

### Slide 8: Query Optimization & Transaction Concurrency
- **Query Optimization Demonstration (Section D):**
  - *Example 1:* Adding composite index `(order_status, created_at)` converts an `ALL` table scan into an `Index range scan`, reducing examined rows and I/O buffer reads.
  - *Example 2:* Converting repeated $O(N)$ correlated subqueries into a single grouped `LEFT JOIN` eliminates dependent subquery executions.
- **Transaction Management Demonstration (Section E):**
  - Live execution of `COMMIT` vs `ROLLBACK`.
  - Atomicity guarantee: When `trg_prevent_negative_stock` aborts an invalid update, `ROLLBACK` undoes the entire transaction cleanly.
  - Concurrency control: Row-level pessimistic locking (`SELECT ... FOR UPDATE`) resolves race conditions during high-volume rush hours.

---

### Slide 9: Testing Results & Limitations
- **Testing Results:**
  - 18 comprehensive test cases executed across DDL, constraints, triggers, routines, transactions, and UI CRUD.
  - 100% Pass Rate confirmed on MySQL 8.0 InnoDB engine.
- **System Limitations:**
  - Payment gateways (GCash/Cards) are simulated via status management rather than live banking APIs.
  - Local single-server MySQL instance (see Slide 10 for distributed scaling design).

---

### Slide 10: Conclusion & Future Improvements
- **Key Takeaways:**
  - Relational modeling and 3NF normalization prevent real-world data corruption.
  - Database-level triggers and stored procedures provide robust security that application code alone cannot guarantee.
  - Proper indexing and query rewriting deliver predictable, high-performance scalability.
- **Future Roadmap (Section G Concepts):**
  - Distributed database expansion across multiple Davao and Mindanao branches using sharding and asynchronous replication.
  - GS1 XML B2B supplier interchange for bulk meat and poultry purchasing.
  - ETL data warehouse pipeline supporting sales forecasting and basket analysis.
