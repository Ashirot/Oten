<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'system' => 'Pastil Rice Davao REST API Backend',
        'course' => 'Database Systems 1 Final Project',
        'status' => 'online',
        'database' => 'MySQL 8.0 (InnoDB Engine)',
        'endpoints' => [
            'products' => '/api/products',
            'categories' => '/api/categories',
            'suppliers' => '/api/suppliers',
            'orders' => '/api/orders',
            'inventory' => '/api/inventory/logs',
            'reports_sales' => '/api/reports/sales',
            'reports_low_stock' => '/api/reports/low-stock',
            'database_schema' => '/api/db/schema',
            'database_optimization' => '/api/db/optimization',
            'transaction_demo' => '/api/db/transaction-demo',
        ],
        'frontend_development_url' => 'http://localhost:5173',
    ]);
});
