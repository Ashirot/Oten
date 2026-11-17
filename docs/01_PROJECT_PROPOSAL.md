# FINAL PROJECT PROPOSAL
## Database Systems 1 — Milestone 1

**Course:** Database Systems 1  
**Project Title:** Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System  
**Selected Topic:** Topic 2 — Inventory and Sales Management System  
**Target Organization / Process:** Pastil Rice Davao (Local Fast-Casual Mindanao Food Service & Delivery Operation)  
**Technology Stack:** Laravel 11/12 (PHP 8.4 REST API Backend), ReactJS 19 (Frontend SPA), Tailwind CSS 4, MySQL 8.0 Engine  

---

### 1. Problem Statement
Local quick-service food enterprises in Davao City—specifically specialized pastil vendors—traditionally manage sales, kitchen preparation, and ingredient restocking through manual paper logbooks, unlinked messaging apps, and static spreadsheets. This leads to critical operational issues:
1. **Overselling & Stockouts:** Lack of atomic inventory deduction during high-demand lunch and dinner rushes causes kitchen staff to accept orders for flavors whose kagikit (shredded meat topping) or rice is already exhausted.
2. **Untracked Costing & Shrinkage:** Without audit logging for ingredient restocks and pricing history, owners struggle to compute actual profit margins or detect raw material wastage.
3. **Data Inconsistency & Manual Duplication:** Order details, delivery addresses, and customer profiles are repeatedly re-entered without normalization, causing update and deletion anomalies.
4. **Slow Decision-Making:** Generating daily, weekly, or monthly sales summaries and low-stock reorder forecasts requires tedious manual calculation rather than instant relational querying.

### 2. Project Objectives
The objective of this project is to design, implement, test, and deploy a robust, relational database system that automates and protects the order fulfillment and inventory cycle:
1. **Relational Database Design:** Model entities (Users, Categories, Suppliers, Products, Orders, Order Items, Inventory Logs, Reviews, Audits) normalized up to Third Normal Form (3NF) to eliminate data redundancy.
2. **Database Integrity Enforcement:** Enforce domain and referential integrity using Primary Keys, Foreign Keys (`ON DELETE RESTRICT` / `CASCADE`), `UNIQUE` indexes, and MySQL `CHECK` constraints (e.g. non-negative pricing and inventory levels).
3. **Database Programming:** Implement MySQL Stored Procedures (for atomic checkout and stock replenishment), User-Defined Functions (for customer lifetime value calculation and inventory health classification), and Database Triggers (for automated stock decrements, negative stock prevention, and price modification auditing).
4. **Query Performance & Optimization:** Document at least two query optimization examples using MySQL `EXPLAIN`, composite B-tree indexing, and correlated subquery elimination.
5. **ACID Transaction Management:** Demonstrate `START TRANSACTION`, `COMMIT`, `ROLLBACK`, and row-level pessimistic locking (`SELECT ... FOR UPDATE`) to prevent concurrency anomalies (race conditions and lost updates).
6. **Full-Stack Application Development:** Deliver an intuitive, responsive web application combining a Laravel REST API backend, ReactJS components, and Tailwind CSS styling supporting both customer ordering and administrative management.

### 3. Intended Users & Role-Based Access
1. **Administrator (Manager / Owner):**
   - Full CRUD over products, categories, and raw material suppliers.
   - Access to stored procedure restocking (`sp_RestockProduct`).
   - Access to real-time sales reports, reorder alerts, and customer lifetime value metrics.
   - Access to Database Diagnostic & Optimization Laboratory.
2. **Staff / Cashier / Kitchen Dispatcher:**
   - View live customer orders.
   - Update order preparation stages (`preparing` &rarr; `out_for_delivery` &rarr; `delivered`).
   - Inspect stock alerts and product catalog availability.
3. **Customer / Client:**
   - Browse Davao pastil flavors, platters, and beverage sides with live stock status badges.
   - Add items to cart with quantity selection.
   - Place delivery orders with Davao City address and landmark routing.
   - Track order fulfillment stages in real time with GPS dispatch mapping.
   - Submit customer star ratings and reviews persisted directly to the database.

### 4. Scope and Limitations
- **In Scope:**
  - Complete relational database schema with 9 tables in MySQL 8.0.
  - Full CRUD operations with server-side validation and database constraint checks.
  - Stored Procedures, Functions, Triggers, Views, and Transactions.
  - Multi-table joins, subqueries, and set operations (`UNION ALL`).
  - Web application built with Laravel REST backend, ReactJS frontend, and Tailwind CSS.
- **Out of Scope:**
  - Real-world monetary card charging gateways (simulated via COD, GCash, and Card toggles with transaction status management).
  - External courier API integration (simulated via interactive OpenStreetMap/Leaflet GPS maps of Davao City).

### 5. Proposed Minimum Features Matrix
| Feature Category | Deliverable Feature | Database Mechanism |
| :--- | :--- | :--- |
| **Authentication** | Multi-role Auth (Admin, Staff, Customer) | `users` table, Sanctum Bearer tokens, role checks |
| **Catalog Management** | Products, Categories, Suppliers CRUD | `products`, `categories`, `suppliers` with FKs & CHECKs |
| **Inventory Control** | Real-time Stock Deduction on Sale | Database Trigger `trg_after_order_item_insert` |
| **Integrity Guard** | Prevent Negative Inventory | Database Trigger `trg_prevent_negative_stock` |
| **Stock Replenishment** | Batch Restocking with Audit Log | Stored Procedure `sp_RestockProduct` |
| **Price Auditing** | Historic Price Change Tracking | Database Trigger `trg_product_price_audit` |
| **Order Processing** | Atomic Multi-Table Order Creation | Stored Procedure `sp_ProcessOrder` & ACID Transactions |
| **Business Analytics** | Sales Summary & Daily Grouping | Database View `vw_sales_summary` |
| **Reorder System** | Low Stock Alert Notifications | Database View `vw_low_stock_alerts` |
| **Performance Ranking** | Product Volume & Revenue Rankings | Database View `vw_product_performance` |
| **Customer LTV** | Customer Lifetime Spending | MySQL UDF `fn_CalculateCustomerTotalSpent` |
| **Stock Classification** | Dynamic Status (In Stock, Low, Out) | MySQL UDF `fn_GetProductStockStatus` |
