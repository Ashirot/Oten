<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Employee;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed employees separately from customer accounts.
        $admin = Employee::create([
            'name' => 'Admin Manager',
            'email' => 'admin@pastildavao.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '09171234567',
            'address' => 'Claveria St, Poblacion District, Davao City',
        ]);

        $staff = Employee::create([
            'name' => 'Staff Cashier',
            'email' => 'staff@pastildavao.com',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
            'phone' => '09189876543',
            'address' => 'Bajada, Davao City',
        ]);

        $customer1 = User::create([
            'name' => 'Maria C.',
            'email' => 'maria@example.com',
            'password' => Hash::make('password123'),
            'phone' => '09201112233',
            'address' => 'Matina Aplaya, Davao City',
        ]);

        $customer2 = User::create([
            'name' => 'Rafael T.',
            'email' => 'rafael@example.com',
            'password' => Hash::make('password123'),
            'phone' => '09223334455',
            'address' => 'Lanang, Davao City',
        ]);

        $customer3 = User::create([
            'name' => 'Jessa P.',
            'email' => 'jessa@example.com',
            'password' => Hash::make('password123'),
            'phone' => '09195556677',
            'address' => 'Toril, Davao City',
        ]);

        // 2. Seed Categories
        $categories = [
            ['id' => 1, 'name' => 'Beef', 'slug' => 'beef', 'description' => 'Premium slow-cooked shredded beef pastil meals', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Chicken', 'slug' => 'chicken', 'description' => 'Savory spiced chicken pastil specialties', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Seafood', 'slug' => 'seafood', 'description' => 'Fresh tuna and seafood-based pastil recipes', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Combo', 'slug' => 'combo', 'description' => 'Value bundled pastil boxes and party platters', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Sides & Drinks', 'slug' => 'sides-drinks', 'description' => 'Refreshing beverages and extra toppings', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('categories')->insert($categories);

        // 3. Seed Suppliers
        $suppliers = [
            ['id' => 1, 'name' => 'Davao Fresh Meats Corp.', 'contact_person' => 'Eduardo Santos', 'phone' => '0917-555-1001', 'email' => 'orders@davaofreshmeats.ph', 'address' => 'Maa, Davao City', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Bankerohan Poultry & Rice Supply', 'contact_person' => 'Alicia Tan', 'phone' => '0918-555-2002', 'email' => 'alicia@bankerohanpoultry.com', 'address' => 'Bankerohan Public Market, Davao City', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'General Santos Fishery Direct', 'contact_person' => 'Danilo Ramos', 'phone' => '0920-555-3003', 'email' => 'danilo@gensanfishery.ph', 'address' => 'Fishport Complex, General Santos City', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Mindanao Spice & Condiments', 'contact_person' => 'Fatima Guiang', 'phone' => '0922-555-4004', 'email' => 'fatima@mindanaospice.ph', 'address' => 'Cotabato-Davao Highway, Digos City', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('suppliers')->insert($suppliers);

        // 4. Seed Products
        $products = [
            [
                'id' => 1,
                'category_id' => 1,
                'supplier_id' => 1,
                'name' => 'Beef Pastil',
                'slug' => 'beef-pastil',
                'description' => 'Seasoned ground beef with savory garlic, onion, and native spices wrapped in steaming fragrant rice.',
                'price' => 120.00,
                'cost_price' => 65.00,
                'stock_quantity' => 85,
                'reorder_level' => 25,
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'category_id' => 2,
                'supplier_id' => 2,
                'name' => 'Chicken Pastil',
                'slug' => 'chicken-pastil',
                'description' => 'Tender chicken shreds slowly cooked in authentic Maguindanaon aromatics, resting on warm banana-leaf rice.',
                'price' => 110.00,
                'cost_price' => 55.00,
                'stock_quantity' => 120,
                'reorder_level' => 30,
                'rating' => 4.80,
                'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'category_id' => 3,
                'supplier_id' => 3,
                'name' => 'Tuna Pastil',
                'slug' => 'tuna-pastil',
                'description' => 'Premium yellowfin tuna flake kagikit sautéed with roasted chilies, garlic, and rich coconut vinegar note.',
                'price' => 130.00,
                'cost_price' => 70.00,
                'stock_quantity' => 14, // below reorder level for demonstration
                'reorder_level' => 20,
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'category_id' => 4,
                'supplier_id' => 1,
                'name' => 'Combo Box',
                'slug' => 'combo-box',
                'description' => 'Best value trio set containing generous portions of Beef, Chicken, and Spicy Tuna pastil with hard-boiled egg.',
                'price' => 260.00,
                'cost_price' => 140.00,
                'stock_quantity' => 45,
                'reorder_level' => 15,
                'rating' => 5.00,
                'image_url' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'category_id' => 4,
                'supplier_id' => 2,
                'name' => 'Family Pack',
                'slug' => 'family-pack',
                'description' => 'Generous pastil platter good for 5-6 people. Perfect for office lunches, Barkada get-togethers, and meriendas.',
                'price' => 420.00,
                'cost_price' => 230.00,
                'stock_quantity' => 8, // low stock for alert demo
                'reorder_level' => 10,
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'category_id' => 3,
                'supplier_id' => 3,
                'name' => 'Spicy Tuna Rice',
                'slug' => 'spicy-tuna-rice',
                'description' => 'Hot, bold, and smoky spicy tuna flakes atop garlic pandan rice, served with crispy native shallots.',
                'price' => 145.00,
                'cost_price' => 75.00,
                'stock_quantity' => 60,
                'reorder_level' => 15,
                'rating' => 4.80,
                'image_url' => 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'category_id' => 5,
                'supplier_id' => 4,
                'name' => 'Davao Calamansi Cooler',
                'slug' => 'davao-calamansi-cooler',
                'description' => 'Fresh Davao honey calamansi iced beverage brewed with wild mint leaves.',
                'price' => 50.00,
                'cost_price' => 18.00,
                'stock_quantity' => 95,
                'reorder_level' => 20,
                'rating' => 4.95,
                'image_url' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'category_id' => 5,
                'supplier_id' => 4,
                'name' => 'Spiced Pastil Sambal Jar (200g)',
                'slug' => 'spiced-pastil-sambal-jar',
                'description' => 'Artisanal jar of toasted garlic chili oil & native palapa paste made with Davao scallions.',
                'price' => 150.00,
                'cost_price' => 70.00,
                'stock_quantity' => 5, // low stock alert demo
                'reorder_level' => 12,
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];
        DB::table('products')->insert($products);

        // Initial inventory logs
        foreach ($products as $p) {
            DB::table('inventory_logs')->insert([
                'product_id' => $p['id'],
                'movement_type' => 'initial',
                'quantity' => $p['stock_quantity'],
                'stock_before' => 0,
                'stock_after' => $p['stock_quantity'],
                'reference_type' => 'opening_stock',
                'reference_id' => null,
                'notes' => 'Initial inventory setup',
                'performed_by' => $admin->id,
                'created_at' => now()->subDays(5),
            ]);
        }

        // 5. Seed Orders (Note: trigger trg_after_order_item_insert will auto decrement stock and write inventory_logs on order_items insert!)
        // So let's insert orders and order items
        $order1 = DB::table('orders')->insertGetId([
            'order_number' => 'ORD-2026-0001',
            'user_id' => $customer1->id,
            'customer_name' => 'Maria C.',
            'customer_phone' => '09201112233',
            'delivery_address' => 'Matina Aplaya, Davao City',
            'delivery_landmark' => 'Near GSIS Matina',
            'delivery_instructions' => 'Call mobile on gate arrival',
            'subtotal' => 240.00,
            'discount_amount' => 0.00,
            'service_fee' => 0.00,
            'total_amount' => 240.00,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'order_status' => 'delivered',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        DB::table('order_items')->insert([
            ['order_id' => $order1, 'product_id' => 1, 'quantity' => 2, 'unit_price' => 120.00, 'subtotal' => 240.00, 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)]
        ]);

        $order2 = DB::table('orders')->insertGetId([
            'order_number' => 'ORD-2026-0002',
            'user_id' => $customer2->id,
            'customer_name' => 'Rafael T.',
            'customer_phone' => '09223334455',
            'delivery_address' => 'Lanang Premier Area, Davao City',
            'delivery_landmark' => 'Near SM Lanang Premier',
            'delivery_instructions' => 'Leave at lobby reception',
            'subtotal' => 520.00,
            'discount_amount' => 50.00,
            'service_fee' => 0.00,
            'total_amount' => 470.00,
            'payment_method' => 'gcash',
            'payment_status' => 'paid',
            'order_status' => 'delivered',
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subDays(1),
        ]);

        DB::table('order_items')->insert([
            ['order_id' => $order2, 'product_id' => 4, 'quantity' => 2, 'unit_price' => 260.00, 'subtotal' => 520.00, 'created_at' => now()->subDays(1), 'updated_at' => now()->subDays(1)]
        ]);

        $order3 = DB::table('orders')->insertGetId([
            'order_number' => 'ORD-2026-0003',
            'user_id' => $customer3->id,
            'customer_name' => 'Jessa P.',
            'customer_phone' => '09195556677',
            'delivery_address' => 'Toril Poblacion, Davao City',
            'delivery_landmark' => 'Beside Toril Public Market',
            'delivery_instructions' => 'Ring door buzzer',
            'subtotal' => 370.00,
            'discount_amount' => 0.00,
            'service_fee' => 0.00,
            'total_amount' => 370.00,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'order_status' => 'delivered',
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHours(5),
        ]);

        DB::table('order_items')->insert([
            ['order_id' => $order3, 'product_id' => 2, 'quantity' => 2, 'unit_price' => 110.00, 'subtotal' => 220.00, 'created_at' => now()->subHours(6), 'updated_at' => now()->subHours(6)],
            ['order_id' => $order3, 'product_id' => 7, 'quantity' => 3, 'unit_price' => 50.00, 'subtotal' => 150.00, 'created_at' => now()->subHours(6), 'updated_at' => now()->subHours(6)],
        ]);

        // 6. Seed Reviews
        DB::table('reviews')->insert([
            ['order_id' => $order1, 'user_id' => $customer1->id, 'product_id' => 1, 'rating' => 5, 'comment' => 'The beef pastil is so flavorful and filling. Delivery was fast and the packaging was neat.', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['order_id' => $order2, 'user_id' => $customer2->id, 'product_id' => 4, 'rating' => 5, 'comment' => 'Perfect for our office lunch. The combo pack saves us time and money.', 'created_at' => now()->subDays(1), 'updated_at' => now()->subDays(1)],
            ['order_id' => $order3, 'user_id' => $customer3->id, 'product_id' => 2, 'rating' => 5, 'comment' => 'Very affordable and consistent quality. This is our go-to pastil place in Davao.', 'created_at' => now()->subHours(4), 'updated_at' => now()->subHours(4)],
        ]);
    }
}
