import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({
    isOpen,
    onClose,
    cart = [],
    onUpdateQuantity,
    onRemoveItem,
    onProceedCheckout,
}) {
    if (!isOpen) return null;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const hasDiscount = subtotal >= 500;
    const discountAmount = hasDiscount ? 50 : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-amber-500" />
                            <h2 className="font-extrabold text-lg text-white">Your Cart</h2>
                            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Promo notice */}
                    <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between">
                        {hasDiscount ? (
                            <span className="text-emerald-700 font-bold">🎉 Promo Unlocked: ₱50 OFF (Orders ₱500+)</span>
                        ) : (
                            <span>Add ₱{(500 - subtotal).toFixed(2)} more for ₱50 discount!</span>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-3">
                                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                                <div className="font-bold text-stone-600">Your cart is empty</div>
                                <p className="text-xs text-stone-400 max-w-xs">
                                    Looks like you haven't added any delicious pastil rice meals yet.
                                </p>
                            </div>
                        ) : (
                            cart.map(({ product, quantity }) => (
                                <div
                                    key={product.id}
                                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3"
                                >
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-16 h-16 rounded-xl object-cover bg-stone-200 shadow-xs shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-stone-900 text-sm truncate">
                                            {product.name}
                                        </h4>
                                        <div className="text-xs text-amber-600 font-extrabold mt-0.5">
                                            ₱{Number(product.price).toFixed(2)}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                                className="w-6 h-6 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-black text-stone-900 w-5 text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                                disabled={quantity >= product.stock_quantity}
                                                className="w-6 h-6 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-black text-stone-900">
                                            ₱{(product.price * quantity).toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(product.id)}
                                            className="text-stone-400 hover:text-red-600 p-1 mt-2 inline-block transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary & Checkout Button */}
                    {cart.length > 0 && (
                        <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-3">
                            <div className="space-y-1.5 text-xs text-stone-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-stone-900">₱{subtotal.toFixed(2)}</span>
                                </div>
                                {hasDiscount && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Discount</span>
                                        <span>-₱{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Delivery Fee (Davao City)</span>
                                    <span className="text-emerald-600 font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                                    <span>Total Amount</span>
                                    <span className="text-amber-600">₱{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onProceedCheckout();
                                }}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
