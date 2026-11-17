-- ============================================================================
-- FINAL PROJECT - DATABASE SYSTEMS 1
-- Project Title: Pastil Rice Davao: Database-Driven Ordering, Inventory, and Sales Management System
-- File: 01_schema_and_seed.sql
-- Platform: MySQL 8.0+
-- Description: Complete Database Creation, DDL Schema with Constraints, and Realistic Seed Data
-- ============================================================================

CREATE DATABASE IF NOT EXISTS pastil_rice_davao_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE pastil_rice_davao_db;

-- ----------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
-- ----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS product_price_audits;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS inventory_logs;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 2. DDL: TABLE DEFINITIONS & CONSTRAINTS (3NF NORMALIZED)
-- ----------------------------------------------------------------------------

-- Table 1: users (Authentication and Roles)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
    phone VARCHAR(30) NULL,
    address TEXT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Table 2: categories (Product Grouping)
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 3: suppliers (Inventory Suppliers in Davao & Mindanao)
CREATE TABLE suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NULL,
    address TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 4: products (Pastil Rice Meals, Platters, and Sides)
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 15,
    rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    image_url TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_product_price CHECK (price >= 0.00),
    CONSTRAINT chk_product_cost CHECK (cost_price >= 0.00),
    CONSTRAINT chk_product_stock CHECK (stock_quantity >= 0),
    CONSTRAINT chk_product_reorder CHECK (reorder_level >= 0),
    
    -- Indexes
    INDEX idx_products_category_active (category_id, is_active),
    INDEX idx_products_stock (stock_quantity)
) ENGINE=InnoDB;

-- Table 5: orders (Sales and Customer Deliveries)
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_landmark VARCHAR(255) NULL,
    delivery_instructions TEXT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cod', 'gcash', 'card', 'cash') NOT NULL DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    order_status ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    
    -- Check Constraint
    CONSTRAINT chk_order_total CHECK (total_amount >= 0.00),
    
    -- Indexes
    INDEX idx_orders_status_created (order_status, created_at),
    INDEX idx_orders_user (user_id)
) ENGINE=InnoDB;

-- Table 6: order_items (Detailed Line Items for Orders)
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
    
    -- Check Constraints
    CONSTRAINT chk_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_item_price CHECK (unit_price >= 0.00),
    
    -- Index
    INDEX idx_order_items_composite (order_id, product_id)
) ENGINE=InnoDB;

-- Table 7: inventory_logs (Audit Trail for Inventory Movements)
CREATE TABLE inventory_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('initial', 'sale', 'restock', 'adjustment', 'return') NOT NULL,
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id BIGINT UNSIGNED NULL,
    notes VARCHAR(255) NULL,
    performed_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_inv_logs_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_logs_user FOREIGN KEY (performed_by) REFERENCES users (id) ON DELETE SET NULL,
    
    -- Index
    INDEX idx_inv_logs_product_date (product_id, created_at)
) ENGINE=InnoDB;

-- Table 8: reviews (Customer Ratings & Reviews)
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NULL,
    product_id BIGINT UNSIGNED NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    comment TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
    
    -- Check Constraint
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- Table 9: product_price_audits (Trigger-Generated Audit History)
CREATE TABLE product_price_audits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT UNSIGNED NULL,
    
    CONSTRAINT fk_price_audits_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_price_audits_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. DML: SAMPLE DATA SEEDING
-- ----------------------------------------------------------------------------

-- Seed Users (Bcrypt hashed password 'password123' / 'admin123' / 'staff123')
INSERT INTO users (id, name, email, password, role, phone, address) VALUES
(1, 'Admin Manager', 'admin@pastildavao.com', '$2y$12$K8j7mZ0R/j43z8iCq2mBf.G9fTq1zJ7P7g4yL2mN1q0k9.J1m2m2m', 'admin', '09171234567', 'Claveria St, Poblacion District, Davao City'),
(2, 'Staff Cashier', 'staff@pastildavao.com', '$2y$12$K8j7mZ0R/j43z8iCq2mBf.G9fTq1zJ7P7g4yL2mN1q0k9.J1m2m2m', 'staff', '09189876543', 'Bajada, Davao City'),
(3, 'Maria C.', 'maria@example.com', '$2y$12$K8j7mZ0R/j43z8iCq2mBf.G9fTq1zJ7P7g4yL2mN1q0k9.J1m2m2m', 'customer', '09201112233', 'Matina Aplaya, Davao City'),
(4, 'Rafael T.', 'rafael@example.com', '$2y$12$K8j7mZ0R/j43z8iCq2mBf.G9fTq1zJ7P7g4yL2mN1q0k9.J1m2m2m', 'customer', '09223334455', 'Lanang, Davao City'),
(5, 'Jessa P.', 'jessa@example.com', '$2y$12$K8j7mZ0R/j43z8iCq2mBf.G9fTq1zJ7P7g4yL2mN1q0k9.J1m2m2m', 'customer', '09195556677', 'Toril, Davao City');

-- Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Beef', 'beef', 'Premium slow-cooked shredded beef pastil meals'),
(2, 'Chicken', 'chicken', 'Savory spiced chicken pastil specialties'),
(3, 'Seafood', 'seafood', 'Fresh tuna and seafood-based pastil recipes'),
(4, 'Combo', 'combo', 'Value bundled pastil boxes and party platters'),
(5, 'Sides & Drinks', 'sides-drinks', 'Refreshing beverages and extra toppings');

-- Seed Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address) VALUES
(1, 'Davao Fresh Meats Corp.', 'Eduardo Santos', '0917-555-1001', 'orders@davaofreshmeats.ph', 'Maa, Davao City'),
(2, 'Bankerohan Poultry & Rice Supply', 'Alicia Tan', '0918-555-2002', 'alicia@bankerohanpoultry.com', 'Bankerohan Public Market, Davao City'),
(3, 'General Santos Fishery Direct', 'Danilo Ramos', '0920-555-3003', 'danilo@gensanfishery.ph', 'Fishport Complex, General Santos City'),
(4, 'Mindanao Spice & Condiments', 'Fatima Guiang', '0922-555-4004', 'fatima@mindanaospice.ph', 'Cotabato-Davao Highway, Digos City');

-- Seed Products
INSERT INTO products (id, category_id, supplier_id, name, slug, description, price, cost_price, stock_quantity, reorder_level, rating, image_url, is_active) VALUES
(1, 1, 1, 'Beef Pastil', 'beef-pastil', 'Seasoned ground beef with savory garlic, onion, and native spices wrapped in steaming fragrant rice.', 120.00, 65.00, 85, 25, 4.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', 1),
(2, 2, 2, 'Chicken Pastil', 'chicken-pastil', 'Tender chicken shreds slowly cooked in authentic Maguindanaon aromatics, resting on warm banana-leaf rice.', 110.00, 55.00, 120, 30, 4.80, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80', 1),
(3, 3, 3, 'Tuna Pastil', 'tuna-pastil', 'Premium yellowfin tuna flake kagikit sautéed with roasted chilies, garlic, and rich coconut vinegar note.', 130.00, 70.00, 14, 20, 4.90, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80', 1),
(4, 4, 1, 'Combo Box', 'combo-box', 'Best value trio set containing generous portions of Beef, Chicken, and Spicy Tuna pastil with hard-boiled egg.', 260.00, 140.00, 45, 15, 5.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80', 1),
(5, 4, 2, 'Family Pack', 'family-pack', 'Generous pastil platter good for 5-6 people. Perfect for office lunches, Barkada get-togethers, and meriendas.', 420.00, 230.00, 8, 10, 4.90, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80', 1),
(6, 3, 3, 'Spicy Tuna Rice', 'spicy-tuna-rice', 'Hot, bold, and smoky spicy tuna flakes atop garlic pandan rice, served with crispy native shallots.', 145.00, 75.00, 60, 15, 4.80, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80', 1),
(7, 5, 4, 'Davao Calamansi Cooler', 'davao-calamansi-cooler', 'Fresh Davao honey calamansi iced beverage brewed with wild mint leaves.', 50.00, 18.00, 95, 20, 4.95, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80', 1),
(8, 5, 4, 'Spiced Pastil Sambal Jar (200g)', 'spiced-pastil-sambal-jar', 'Artisanal jar of toasted garlic chili oil & native palapa paste made with Davao scallions.', 150.00, 70.00, 5, 12, 4.90, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80', 1);

-- Seed Initial Inventory Logs
INSERT INTO inventory_logs (product_id, movement_type, quantity, stock_before, stock_after, reference_type, notes, performed_by, created_at) VALUES
(1, 'initial', 85, 0, 85, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(2, 'initial', 120, 0, 120, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(3, 'initial', 14, 0, 14, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(4, 'initial', 45, 0, 45, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(5, 'initial', 8, 0, 8, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(6, 'initial', 60, 0, 60, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(7, 'initial', 95, 0, 95, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY),
(8, 'initial', 5, 0, 5, 'opening_inventory', 'Initial batch opening', 1, NOW() - INTERVAL 5 DAY);

-- Seed Orders
INSERT INTO orders (id, order_number, user_id, customer_name, customer_phone, delivery_address, delivery_landmark, delivery_instructions, subtotal, discount_amount, service_fee, total_amount, payment_method, payment_status, order_status, created_at) VALUES
(1, 'ORD-2026-0001', 3, 'Maria C.', '09201112233', 'Matina Aplaya, Davao City', 'Near GSIS Matina', 'Call on gate arrival', 240.00, 0.00, 0.00, 240.00, 'cod', 'paid', 'delivered', NOW() - INTERVAL 2 DAY),
(2, 'ORD-2026-0002', 4, 'Rafael T.', '09223334455', 'Lanang Premier Area, Davao City', 'Near SM Lanang Premier', 'Leave with building reception', 520.00, 50.00, 0.00, 470.00, 'gcash', 'paid', 'delivered', NOW() - INTERVAL 1 DAY),
(3, 'ORD-2026-0003', 5, 'Jessa P.', '09195556677', 'Toril Poblacion, Davao City', 'Beside Toril Public Market', 'Ring gate buzzer', 370.00, 0.00, 0.00, 370.00, 'cod', 'paid', 'delivered', NOW() - INTERVAL 6 HOUR);

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 2, 120.00, 240.00),
(2, 4, 2, 260.00, 520.00),
(3, 2, 2, 110.00, 220.00),
(3, 7, 3, 50.00, 150.00);

-- Seed Reviews
INSERT INTO reviews (order_id, user_id, product_id, rating, comment) VALUES
(1, 3, 1, 5, 'The beef pastil is so flavorful and filling. Delivery was fast and the packaging was neat.'),
(2, 4, 4, 5, 'Perfect for our office lunch. The combo pack saves us time and money.'),
(3, 5, 2, 5, 'Very affordable and consistent quality. This is our go-to pastil place in Davao.');
