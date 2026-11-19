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

// Public browsing, sign-in and guest checkout.
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Customers can only read their orders; staff may read all.
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::middleware('employee')->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('suppliers', SupplierController::class)->only(['index', 'show']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::get('/inventory/logs', [InventoryController::class, 'index']);
        Route::get('/inventory/low-stock', [InventoryController::class, 'lowStockAlerts']);
        Route::post('/inventory/restock', [InventoryController::class, 'restock']);
    });

    Route::middleware('admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('suppliers', SupplierController::class)->except(['index', 'show']);

        Route::prefix('reports')->group(function () {
            Route::get('/sales', [ReportController::class, 'salesSummary']);
            Route::get('/low-stock', [ReportController::class, 'lowStockReport']);
            Route::get('/product-performance', [ReportController::class, 'productPerformanceReport']);
            Route::get('/customers', [ReportController::class, 'customerSpendingReport']);
        });

        Route::prefix('db')->group(function () {
            Route::get('/schema', [DatabaseToolsController::class, 'getSystemSchema']);
            Route::get('/optimization', [DatabaseToolsController::class, 'demonstrateQueryOptimization']);
            Route::post('/transaction-demo', [DatabaseToolsController::class, 'demonstrateTransaction']);
        });
    });
});
