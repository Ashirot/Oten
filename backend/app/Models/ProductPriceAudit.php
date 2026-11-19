<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductPriceAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'old_price',
        'new_price',
        'changed_at',
        'changed_by',
    ];

    protected $casts = [
        'old_price' => 'float',
        'new_price' => 'float',
        'changed_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(Employee::class, 'changed_by');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'changed_by');
    }
}
