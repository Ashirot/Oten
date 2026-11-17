import React from 'react';
import { X, Star, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
    if (!product) return null;

    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="h-64 sm:h-72 bg-stone-100 overflow-hidden relative">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-amber-900 shadow-xs">
                        {product.category?.name}
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-stone-900">{product.name}</h2>
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-700 font-bold text-xs">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            {Number(product.rating).toFixed(1)}
                        </div>
                    </div>

                    <p className="text-sm text-stone-600 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-stone-700">Stock Availability:</span>
                        </div>
                        <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isOutOfStock ? 'Out of stock' : `${product.stock_quantity} units available`}
                        </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                        <div>
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Unit Price</span>
                            <div className="text-2xl font-black text-stone-900">
                                ₱{Number(product.price).toFixed(2)}
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => {
                                onAddToCart(product);
                                onClose();
                            }}
                            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                                isOutOfStock
                                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white shadow-orange-500/25 active:scale-95'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
