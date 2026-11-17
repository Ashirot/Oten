import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Phone, User, CreditCard, Banknote, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { ordersApi } from '../../services/api';

export default function CheckoutModal({
    isOpen,
    onClose,
    cart = [],
    user,
    onOrderPlaced,
    showToast,
}) {
    if (!isOpen) return null;

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [landmark, setLandmark] = useState('');
    const [instructions, setInstructions] = useState('Ring gate bell on arrival');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const mapRef = useRef(null);
    const leafletMapInstance = useRef(null);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const hasDiscount = subtotal >= 500;
    const discountAmount = hasDiscount ? 50 : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (mapRef.current && window.L && !leafletMapInstance.current) {
                // Davao City coordinates
                const davaoCoords = [7.0707, 125.6087];
                const map = window.L.map(mapRef.current).setView(davaoCoords, 14);

                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map);

                // Restaurant Hub marker
                const hubIcon = window.L.divIcon({
                    className: 'custom-hub-icon',
                    html: '<div style="background-color: #ea580c; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🍚</div>',
                    iconSize: [30, 30],
                });

                window.L.marker([7.0735, 125.6128], { icon: hubIcon })
                    .addTo(map)
                    .bindPopup('<b>Pastil Rice Davao Hub</b><br>Poblacion Kitchen')
                    .openPopup();

                // Delivery Destination marker
                const userIcon = window.L.divIcon({
                    className: 'custom-user-icon',
                    html: '<div style="background-color: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">📍</div>',
                    iconSize: [30, 30],
                });

                window.L.marker(davaoCoords, { icon: userIcon, draggable: true })
                    .addTo(map)
                    .bindPopup('<b>Your Delivery Drop-off Point</b>');

                leafletMapInstance.current = map;
            }
        }, 200);

        return () => {
            clearTimeout(timer);
            if (leafletMapInstance.current) {
                leafletMapInstance.current.remove();
                leafletMapInstance.current = null;
            }
        };
    }, [isOpen]);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setSubmitting(true);
        setError(null);

        const orderData = {
            customer_name: name,
            customer_phone: phone,
            delivery_address: address,
            delivery_landmark: landmark,
            delivery_instructions: instructions,
            payment_method: paymentMethod,
            user_id: user?.id || null,
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
        };

        try {
            const res = await ordersApi.create(orderData);
            showToast?.('Order placed successfully! Database transaction committed.', 'success');
            onOrderPlaced(res.order);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-5 text-white flex items-center justify-between">
                    <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-amber-100">
                            Secure Checkout
                        </span>
                        <h2 className="text-2xl font-black">Complete Your Davao Pastil Order</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Delivery Details */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-600" />
                            <span>1. Delivery Information (Davao City)</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan dela Cruz"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="09171234567"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Address</label>
                            <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="House/Unit #, Street, Barangay (e.g. Matina, Lanang, Bajada, Toril)"
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Nearest Landmark</label>
                                <input
                                    type="text"
                                    value={landmark}
                                    onChange={(e) => setLandmark(e.target.value)}
                                    placeholder="e.g. Near Davao Doctors Hospital / SM Lanang"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Rider Instructions</label>
                                <input
                                    type="text"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Leave with guard / Ring door bell"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Interactive Davao City GPS Delivery Map */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-stone-700">Davao City Live Dispatch GPS Map</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    GPS Online
                                </span>
                            </div>
                            <div
                                ref={mapRef}
                                className="w-full h-44 rounded-2xl border border-stone-200 shadow-inner z-0"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                        <h3 className="font-bold text-stone-900 text-sm">2. Select Payment Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                                { id: 'gcash', label: 'GCash e-Wallet', icon: CreditCard },
                                { id: 'card', label: 'Credit / Debit Card', icon: ShieldCheck },
                            ].map((method) => {
                                const Icon = method.icon;
                                return (
                                    <label
                                        key={method.id}
                                        className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center text-center gap-1.5 transition-all ${
                                            paymentMethod === method.id
                                                ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                                                : 'border-stone-200 hover:bg-stone-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id)}
                                            className="sr-only"
                                        />
                                        <Icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-amber-600' : 'text-stone-400'}`} />
                                        <span className="text-xs font-bold text-stone-800">{method.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary Breakdown */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                        <div className="font-bold text-stone-800 flex justify-between">
                            <span>Total Items Ordered:</span>
                            <span>{cart.reduce((s, i) => s + i.quantity, 0)} units</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span className="font-bold">₱{subtotal.toFixed(2)}</span>
                        </div>
                        {hasDiscount && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Free Delivery Discount</span>
                                <span>-₱{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-stone-600">
                            <span>Service & Packaging Fee</span>
                            <span className="text-emerald-600 font-bold">FREE (₱0.00)</span>
                        </div>
                        <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-black text-stone-900">
                            <span>Grand Total</span>
                            <span className="text-amber-600">₱{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || cart.length === 0}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-black text-base shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{submitting ? 'Committing Database Transaction...' : `Confirm & Place Order (₱${finalTotal.toFixed(2)})`}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
