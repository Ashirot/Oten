# USER GUIDE & OPERATING MANUAL
## Pastil Rice Davao — Database-Driven Ordering, Inventory, and Sales Management System

---

### 1. System Requirements & Prerequisites
- **Operating System:** Windows 10/11, macOS, or Linux
- **Backend Runtime:** PHP 8.2 or higher (PHP 8.4 recommended with `pdo_mysql` and `intl` enabled)
- **Dependency Manager:** Composer 2.x
- **Frontend Runtime:** Node.js 18+ (Node 20+ recommended) & npm
- **Database Engine:** MySQL 8.0+ or MariaDB 10.5+

---

### 2. Fast-Start Installation Guide

#### Step 1: Configure MySQL Database
Make sure your local MySQL service is running. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS pastil_rice_davao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 2: Configure Environment Variables (`.env`)
Check that your `.env` file matches your local MySQL credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pastil_rice_davao_db
DB_USERNAME=root
DB_PASSWORD=1234
```

#### Step 3: Run Migrations and Seeders
Run the automated schema migrations and seed initial master data:
```bash
php artisan migrate:fresh --seed
```
This automatically sets up all 9 tables, check constraints, stored procedures, functions, triggers, views, and initial data.

#### Step 4: Build Frontend Assets
Compile the ReactJS and Tailwind CSS assets:
```bash
npm run build
```

#### Step 5: Launch Application
Start the local Laravel development server:
```bash
php artisan serve
```
Open your web browser and navigate to:
```text
http://127.0.0.1:8000
```

---

### 3. Pre-configured Demo Accounts

For instructor evaluation and testing, quick 1-click login buttons are integrated into the **Sign In** modal:

| Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@pastildavao.com` | `admin123` | Full access to Product CRUD, Restock Stored Procedure, Category/Supplier management, Reports, and Database Diagnostic Lab |
| **💼 Staff** | `staff@pastildavao.com` | `staff123` | Order status progression (`preparing` &rarr; `out_for_delivery` &rarr; `delivered`), catalog inspection, stock alert monitoring |
| **🛒 Customer** | `maria@example.com` | `password123` | Ordering menu items, checkout with Davao delivery address, live order tracker, rating and reviews submission |

---

### 4. Customer Storefront Operations

#### 4.1 Browsing Menu & Flavor Filtering
1. On the homepage, navigate to the **Popular Davao Picks** menu section.
2. Filter pastil dishes by clicking category pills:
   - **All Flavors**
   - **Beef** (e.g. Beef Pastil)
   - **Chicken** (e.g. Chicken Pastil)
   - **Seafood** (e.g. Tuna Pastil, Spicy Tuna Rice)
   - **Combo** (e.g. Combo Box, Family Pack Platter)
   - **Sides & Drinks** (e.g. Davao Calamansi Cooler, Spiced Sambal Jar)
3. Use the search bar to find dishes by name or description.
4. Each card displays real-time stock levels using the MySQL User-Defined Function `fn_GetProductStockStatus` (`In Stock`, `Low Stock`, or `Sold Out`).

#### 4.2 Adding Items to Cart
1. Click the **Add** button or preview icon on any item card.
2. Select your desired quantity in the **Quantity Picker Modal**.
3. Click **Add to Cart**.
4. The cart badge updates in the top navigation bar. Orders of ₱500 or more automatically receive a **₱50.00 Free Delivery Discount**.

#### 4.3 Checkout & Delivery Routing
1. Open the Cart Drawer and click **Proceed to Checkout**.
2. Complete your delivery information:
   - Full Name
   - Mobile Number
   - Detailed Davao Address (e.g., Matina, Lanang, Bajada, Toril, Poblacion)
   - Nearest Landmark
   - Rider Instructions
3. Review the live interactive **Davao City GPS Delivery Map** showing the Poblacion Hub and delivery drop-off pin.
4. Choose your payment method: **Cash on Delivery (COD)**, **GCash**, or **Card**.
5. Click **Confirm & Place Order**. The backend executes an ACID transaction with pessimistic row-locking and triggers!

#### 4.4 Live Order Tracking & Reviews
1. Once placed, the **Live Order Tracker Modal** automatically opens.
2. View current preparation stage:
   - `Order Placed` &rarr; `Cooking & Packing` &rarr; `Out for Delivery` &rarr; `Delivered`
3. Rate your food quality using the 5-star rating picker and post feedback directly to the MySQL `reviews` table.

---

### 5. Administrative & Management Operations

Switch to the management view by clicking the **Management & DB Dashboard** tab in the top navigation bar.

#### 5.1 Products & Inventory Catalog
- **Add Product:** Click **Add New Product**, fill in pricing, cost, stock, reorder levels, and select the category and supplier.
- **Edit Product:** Click the edit icon to modify prices or descriptions. Modifying the price immediately executes the `trg_product_price_audit` trigger.
- **Execute Restock Procedure:** Click the green **Package Restock** icon on any product. Enter the replenishment quantity and notes. This directly executes MySQL stored procedure `sp_RestockProduct`.
- **Audit Logs:** Click **Audit Logs** to view historical inventory movements automatically generated by the database trigger `trg_after_order_item_insert` and restocking procedure.

#### 5.2 Order Processing
- Filter orders by status: `Pending`, `Cooking/Preparing`, `Out for Delivery`, `Delivered`, or `Cancelled`.
- Change order status via the quick dropdown to simulate dispatch and delivery handover.
- Click the eye icon to view customer notes, delivery instructions, and itemized receipts.

#### 5.3 Suppliers & Categories Management
- Add, update, or remove categories. Note: Deleting a category with active products is safely rejected by the foreign key constraint.
- Register and maintain supplier contact persons, phone numbers, and warehouse addresses.

#### 5.4 Business Reports & Analytics
- **Report 1 (Sales & Revenue):** Analyzes daily revenue trends from `vw_sales_summary`, average order value, and payment method distribution.
- **Report 2 (Low Stock Reorder Alerts):** Evaluates `vw_low_stock_alerts` to list products at or below threshold, supplier phone numbers, and calculated units needed.
- **Report 3 (Product Performance):** Ranks top-selling pastil variants by units sold and gross revenue from `vw_product_performance`.
- **Report 4 (Customer Lifetime Value):** Demonstrates the MySQL UDF `fn_CalculateCustomerTotalSpent(user_id)`.

#### 5.5 Database Laboratory (Academic Evaluation Suite)
- **Section D (Query Optimization):** Run interactive comparisons of queries before and after composite indexing and subquery elimination, displaying real MySQL `EXPLAIN` JSON execution plans.
- **Section E (Transaction Control):** Run live `COMMIT` and `ROLLBACK` demonstrations. Watch the transaction rollback when the `trg_prevent_negative_stock` trigger rejects illegal values.
- **Section B (Data Dictionary):** Inspect real-time table schemas, columns, data types, keys, and nullability flags directly from MySQL `INFORMATION_SCHEMA`.
- **Section C (Routines & Triggers):** Review live active triggers, stored procedures, and functions registered on the MySQL server.
