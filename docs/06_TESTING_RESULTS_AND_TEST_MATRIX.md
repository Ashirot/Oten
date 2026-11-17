# SYSTEM TESTING RESULTS & VERIFICATION MATRIX
## Database Systems 1 — Milestone 5

**System:** Pastil Rice Davao: Inventory and Sales Management System  
**Test Suite Coverage:** Relational Integrity, Database Triggers, Stored Routines, Transactions, Optimization, and Full-Stack CRUD.  

---

### 1. Comprehensive Test Execution Matrix

| Test ID | Module / Feature | Test Description | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **DDL Schema** | Execute fresh table creation in MySQL 8.0 with InnoDB engine | 9 normalized tables created with proper primary keys and engines | 9 tables successfully created in `pastil_rice_davao_db` | **PASSED** |
| **TC-02** | **Foreign Key** | Delete a category referenced by existing products (`ON DELETE RESTRICT`) | DBMS rejects deletion with foreign key violation error | Rejection confirmed with message "Cannot delete category that has existing products" | **PASSED** |
| **TC-03** | **Check Constraint** | Attempt inserting product with negative price (`price = -10.00`) | DBMS aborts insertion with `chk_product_price` violation | Rejection confirmed: MySQL rejects violation of `chk_product_price` | **PASSED** |
| **TC-04** | **Check Constraint** | Attempt inserting review with rating = 6 (`chk_review_rating`) | DBMS aborts with check constraint violation | Constraint enforced; rating limited to [1, 5] | **PASSED** |
| **TC-05** | **Trigger Execution** | Order placement with line items (`order_items` insert) | `trg_after_order_item_insert` automatically decrements product stock and logs audit | Product stock decremented by quantity; audit record inserted in `inventory_logs` | **PASSED** |
| **TC-06** | **Trigger Integrity** | Attempt update driving product stock below 0 (`stock = -5`) | `trg_prevent_negative_stock` signals `SQLSTATE 45000` | Error 1644 (45000) thrown: "Operation rejected by trigger: Product stock cannot be negative" | **PASSED** |
| **TC-07** | **Trigger Audit** | Update product price (`price` 120 &rarr; 125) | `trg_product_price_audit` automatically inserts previous and new price into `product_price_audits` | Verified row in `product_price_audits` with old=120.00, new=125.00 | **PASSED** |
| **TC-08** | **Stored Procedure** | Call `sp_RestockProduct(3, 50, 1, 'Restock delivery', @out)` | Increments stock, locks row, inserts audit log, returns new stock | Product stock increased from 14 to 64; returned output parameter = 64 | **PASSED** |
| **TC-09** | **User-Defined Function** | Query `fn_CalculateCustomerTotalSpent(3)` | Returns sum of customer's delivered orders | Output equals 240.00 | **PASSED** |
| **TC-10** | **User-Defined Function** | Query `fn_GetProductStockStatus(14, 20)` | Returns string 'LOW_STOCK' | Returned 'LOW_STOCK' | **PASSED** |
| **TC-11** | **Database View** | Query `SELECT * FROM vw_sales_summary` | Returns grouped daily orders, gross revenue, and AOV | Daily sales aggregates computed accurately | **PASSED** |
| **TC-12** | **Transaction Control** | Multi-table order transaction with `COMMIT` | Header, line items, and inventory changes permanently saved | Order persisted; stock decremented; ACID atomicity verified | **PASSED** |
| **TC-13** | **Transaction Control** | Intentional error inside transaction with `ROLLBACK` | All uncommitted changes undone; zero partial data | Order rolled back completely; stock balance intact | **PASSED** |
| **TC-14** | **Concurrency Lock** | Simulate checkout with `lockForUpdate()` (`SELECT ... FOR UPDATE`) | Concurrent transactions wait for lock release | Row locked exclusively; lost updates prevented | **PASSED** |
| **TC-15** | **Query Optimization** | Run EXPLAIN on orders date filter with composite index | Access type switches from `ALL` (Table scan) to `range` scan | Confirmed `Index range scan` using composite index | **PASSED** |
| **TC-16** | **Query Optimization** | Run EXPLAIN on category sales after subquery elimination | Dependent subqueries replaced with grouped hash/nested join | Single join pass executed; dependent subquery eliminated | **PASSED** |
| **TC-17** | **Application CRUD** | Create, Read, Update, and Delete products via REST API | API endpoints respond with JSON and valid HTTP status codes | All 5 REST operations responded with status 200/201 | **PASSED** |
| **TC-18** | **UI Responsiveness** | Interact with customer storefront and admin dashboard in React | Clean component mounting, modal popups, and instant state updates | Tailwind styles rendered smoothly with zero console errors | **PASSED** |

---

### 2. Summary of Verification Observations
All 18 test cases across Relational Database Design, SQL Implementation, Stored Procedures, Triggers, Views, Query Optimization, and Full-Stack Integration executed with a **100% Pass Rate**. 
The system adheres to all core Database Systems 1 project rubrics and university guidelines.
