<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Existing databases already applied the original orders migration.
        // Extend its ENUM in place without dropping orders or payment history.
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending'");

        // Repair legacy records that changed stage without changing payment.
        DB::table('orders')
            ->where('order_status', 'cancelled')
            ->where('payment_status', 'pending')
            ->update(['payment_status' => 'cancelled']);

        DB::table('orders')
            ->where('order_status', 'delivered')
            ->whereIn('payment_method', ['cod', 'cash'])
            ->where('payment_status', 'pending')
            ->update(['payment_status' => 'paid']);
    }

    public function down(): void
    {
        throw new \RuntimeException('Restore the SQL backup to reverse the payment-status data correction.');
    }
};
