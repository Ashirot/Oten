<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'supplier_id',
        'name',
        'slug',
        'description',
        'price',
        'cost_price',
        'stock_quantity',
        'reorder_level',
        'rating',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'cost_price' => 'float',
        'stock_quantity' => 'integer',
        'reorder_level' => 'integer',
        'rating' => 'float',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function priceAudits()
    {
        return $this->hasMany(ProductPriceAudit::class);
    }
}
