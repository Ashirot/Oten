<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Upgrade an already seeded/used installation without throwing away orders,
     * reviews, stock movements, password hashes or Sanctum sessions.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'staff'])->default('staff');
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('avatar', 30)->default('user');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar', 30)->default('user');
        });

        // These audit columns now point at an employee, never a customer.
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropForeign(['performed_by']);
        });
        Schema::table('product_price_audits', function (Blueprint $table) {
            $table->dropForeign(['changed_by']);
        });

        $legacyEmployees = DB::table('users')->whereIn('role', ['admin', 'staff'])->get();
        $employeeIds = $legacyEmployees->pluck('id')->all();

        foreach ($legacyEmployees as $legacy) {
            // Preserve IDs so historical inventory and price audits retain authors.
            DB::table('employees')->insert([
                'id' => $legacy->id,
                'name' => $legacy->name,
                'email' => $legacy->email,
                'email_verified_at' => $legacy->email_verified_at,
                'password' => $legacy->password,
                'role' => $legacy->role,
                'phone' => $legacy->phone,
                'address' => $legacy->address,
                'remember_token' => $legacy->remember_token,
                'created_at' => $legacy->created_at,
                'updated_at' => $legacy->updated_at,
            ]);

            // Sanctum polymorphic tokens can remain valid after the model move.
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\User')
                ->where('tokenable_id', $legacy->id)
                ->update(['tokenable_type' => 'App\\Models\\Employee']);
        }

        // Old entries erroneously attributed to a customer cannot reference an employee.
        if ($employeeIds) {
            DB::table('inventory_logs')->whereNotNull('performed_by')
                ->whereNotIn('performed_by', $employeeIds)->update(['performed_by' => null]);
            DB::table('product_price_audits')->whereNotNull('changed_by')
                ->whereNotIn('changed_by', $employeeIds)->update(['changed_by' => null]);
            DB::table('orders')->whereIn('user_id', $employeeIds)->update(['user_id' => null]);
            DB::table('reviews')->whereIn('user_id', $employeeIds)->update(['user_id' => null]);
            DB::table('sessions')->whereIn('user_id', $employeeIds)->delete();
            DB::table('users')->whereIn('id', $employeeIds)->delete();
        } else {
            DB::table('inventory_logs')->whereNotNull('performed_by')->update(['performed_by' => null]);
            DB::table('product_price_audits')->whereNotNull('changed_by')->update(['changed_by' => null]);
        }

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->foreign('performed_by')->references('id')->on('employees')->nullOnDelete();
        });
        Schema::table('product_price_audits', function (Blueprint $table) {
            $table->foreign('changed_by')->references('id')->on('employees')->nullOnDelete();
        });

        // A customer table should not retain admin/staff as possible roles.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        // A reverse data migration would need to merge two independent ID spaces
        // and could destroy accounts. Intentionally disallow destructive rollback.
        throw new \RuntimeException('Employee separation is a data migration; restore a pre-upgrade SQL backup to roll back.');
    }
};
