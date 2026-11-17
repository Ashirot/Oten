import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function QuantityModal({ product, onClose, onConfirmAdd }) {
    if (!product) return null;

    const [qty, setQty] = useState(1);
    const maxQty = Math.max(1, product.stock_quantity);

    const handleIncrement = () => {
        if (qty < maxQty) setQty((prev) => prev + 1);
    };

    const handleDecrement = () => {
        if (qty > 1) setQty((prev) => prev - 1);
    };

    const totalPrice = product.price * qty;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-stone-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-stone-100 shadow-xs"
                    />
                    <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                            {product.category?.name}
                        </span>
                        <h3 className="font-bold text-stone-900 text-base leading-tight">
                            {product.name}
                        </h3>
                        <p className="text-xs font-extrabold text-stone-600 mt-0.5">
                            ₱{Number(product.price).toFixed(2)} each
                        </p>
                    </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 my-4">
                    <div className="text-xs font-semibold text-stone-500 text-center mb-2">
                        Select Quantity (Available: {product.stock_quantity})
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={qty <= 1}
                            className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-800 hover:bg-stone-100 disabled:opacity-30 transition-all"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-2xl font-black text-stone-900 w-12 text-center">
                            {qty}
                        </span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={qty >= maxQty}
                            className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-stone-800 hover:bg-stone-100 disabled:opacity-30 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 mb-4">
                    <span className="text-xs font-semibold text-stone-500">Subtotal:</span>
                    <span className="text-xl font-black text-amber-600">₱{totalPrice.toFixed(2)}</span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        onConfirmAdd(product, qty);
                        onClose();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {qty} to Cart</span>
                </button>
            </div>
        </div>
    );
}
