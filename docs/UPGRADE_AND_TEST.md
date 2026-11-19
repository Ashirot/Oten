# Oten Upgrade Notes — November 2026

This folder upgrades the existing **Pastil Rice Davao** project and the
`pastil_rice_davao` database exported from phpMyAdmin. It does **not** replace
the database with a recreated schema.

## Database decision

The original application has separate tables for categories, suppliers,
products, orders, order_items, inventory_logs, reviews and price audits.
Merging these is **not recommended**: orders need multiple line items; inventory
and price audits need immutable history; categories and suppliers have reusable
relationships. Support tables (migrations, queue, cache, sessions and Sanctum
tokens) belong to Laravel. Fewer tables would duplicate data and weaken
foreign-key checks. Instead, we:

- Added `employees` for admin and cashier identities.
- Moved existing admin/staff accounts (including password hashes and relevant
  token records) out of `users`. Customer `users` keep their IDs.
- Linked stock restocking and price change authors to employees.
  New price edits carry the employee ID into the price-audit database trigger.
- Added avatar preferences to both account tables.
- Added indexes for customer order history and recent product reviews.
- Fixed revenue views that previously double-counted multi-item sales or
  included cancelled-order line items.
- Removed a redundant SQL function call per product when fetching the menu.

## Exact upgrade procedure — Windows / Herd / XAMPP MySQL

1. In phpMyAdmin, **Export your existing database with both structure and data**.
   Keep that backup outside this project folder.
2. Make sure XAMPP MySQL is running. Herd may provide PHP; don't run XAMPP
   Apache simultaneously if it conflicts on port 80.
3. Copy this updated project beside the old project, **not over your only
   copy**. Bring the old `backend/.env` over to the new `backend` if needed.
4. Confirm `DB_CONNECTION=mysql` and `DB_DATABASE=pastil_rice_davao` in
   `backend/.env`.
5. From PowerShell, in the updated project's `backend` folder, run:

   ```powershell
   php artisan config:clear
   php artisan migrate:status
   php artisan migrate
   php artisan serve --host=127.0.0.1 --port=8000
   ```

6. In another PowerShell window, from the `frontend` folder:

   ```powershell
   npm install
   npm run dev
   ```

7. Open http://localhost:5173 and test the account types.

**Do not use** `migrate:fresh`, `db:wipe`, or re-import
`backend/database/sql/01_schema_and_seed.sql` on a database containing real
records. Do not rerun the seeders after importing the existing data. To reverse
the employee data move, restore your full pre-upgrade SQL backup. The migration
does not implement a destructive rollback.

## Verify the upgrade in phpMyAdmin

In the `pastil_rice_davao` database, open the SQL tab:

```sql
SHOW COLUMNS FROM employees;
SHOW COLUMNS FROM users;
SELECT id, name, email, role FROM employees;
SELECT id, name, email FROM users;
SELECT COUNT(*) AS orders_kept FROM orders;
SELECT COUNT(*) AS reviews_kept FROM reviews;
SELECT COUNT(*) AS inventory_logs_kept FROM inventory_logs;
SELECT * FROM vw_sales_summary LIMIT 10;
```

The `users` table should no longer have `role`; employees should contain the
admin and cashier accounts. Compare the three counts with your pre-upgrade
database. Staff password hashes are copied as-is so existing demo credentials
still work until you change them.

## Manual acceptance checklist

- [ ] Guest homepage has **Home**, **Menu**, cart, and a top-right account icon,
      but no public Staff/Admin Portal button.
- [ ] The **Order Now** button navigates to the separate menu page.
- [ ] Add a meal, start checkout, close checkout, open the cart, and choose
      **Proceed to Checkout** again. The items and entered details remain.
- [ ] Test the customer, cashier/staff and admin login options.
- [ ] Admin/staff accounts are in `employees`; customer accounts are in `users`.
- [ ] Account Settings saves edited name, email, phone, address and icon.
- [ ] Password change rejects an incorrect current password and accepts a valid
      new password; logout revokes the current session token.
- [ ] Customer account cannot open employee inventory/report APIs (403).
- [ ] Cashier cannot access admin-only category/supplier mutation APIs (403).
- [ ] A customer cannot fetch another customer's order by ID.
- [ ] A two-item sale is counted as **one order** in sales revenue totals.
- [ ] Cancel an eligible order and verify stock and `inventory_logs` both update
      exactly once; repeated cancellation cannot add stock twice.
- [ ] Selecting GCash/card records pending payment, not a fabricated paid result.

## Technical testing status

JavaScript/JSX sources were parsed and bundled successfully using the available
esbuild compiler. PHP/Composer, a running MySQL instance, and a complete
frontend package install were **not available in the editing environment**,
so Laravel migrations, live API requests, and browser end-to-end flows must be
verified on your Windows machine after the upgrade. Do not assume they were
executed here.
