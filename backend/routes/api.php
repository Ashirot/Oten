<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\DatabaseToolsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Categories
Route::apiResource('categories', CategoryController::class);

// Suppliers
Route::apiResource('suppliers', SupplierController::class);

// Products
Route::apiResource('products', ProductController::class);

// Orders
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

// Inventory
Route::get('/inventory/logs', [InventoryController::class, 'index']);
Route::get('/inventory/low-stock', [InventoryController::class, 'lowStockAlerts']);
Route::post('/inventory/restock', [InventoryController::class, 'restock']);

// Reports
Route::prefix('reports')->group(function () {
    Route::get('/sales', [ReportController::class, 'salesSummary']);
    Route::get('/low-stock', [ReportController::class, 'lowStockReport']);
    Route::get('/product-performance', [ReportController::class, 'productPerformanceReport']);
    Route::get('/customers', [ReportController::class, 'customerSpendingReport']);
});

// Reviews
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);

// Database Systems 1 Demonstration & Diagnostic Tools
Route::prefix('db')->group(function () {
    Route::get('/schema', [DatabaseToolsController::class, 'getSystemSchema']);
    Route::get('/optimization', [DatabaseToolsController::class, 'demonstrateQueryOptimization']);
    Route::post('/transaction-demo', [DatabaseToolsController::class, 'demonstrateTransaction']);
});
