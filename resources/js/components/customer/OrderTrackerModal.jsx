import React, { useState } from 'react';
import { X, CheckCircle, Clock, Truck, UtensilsCrossed, Star, MapPin, Send } from 'lucide-react';
import { reviewsApi } from '../../services/api';

export default function OrderTrackerModal({
    isOpen,
    onClose,
    order,
    user,
    showToast,
    onOrderReviewSubmitted,
}) {
    if (!isOpen || !order) return null;

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const stages = [
        { key: 'pending', label: 'Order Placed', icon: Clock },
        { key: 'preparing', label: 'Cooking & Packing', icon: UtensilsCrossed },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const getStageIndex = (status) => {
        switch (status) {
            case 'pending': return 0;
            case 'preparing': return 1;
            case 'out_for_delivery': return 2;
            case 'delivered': return 3;
            default: return 1;
        }
    };

    const currentStageIdx = getStageIndex(order.order_status);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await reviewsApi.create({
                order_id: order.id,
                rating,
                comment,
                user_id: user?.id || order.user_id,
            });
            setReviewSubmitted(true);
            showToast?.('Thank you for rating your pastil meal!', 'success');
            onOrderReviewSubmitted?.();
        } catch (err) {
            showToast?.('Failed to submit review', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
                {/* Header */}
                <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                                Live Order Tracker
                            </span>
                        </div>
                        <h2 className="text-xl font-black mt-1">Order #{order.order_number}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold text-stone-600">
                            <span>Status: <strong className="text-amber-600 uppercase">{order.order_status?.replace('_', ' ')}</strong></span>
                            <span>Estimated arrival: <strong>25 - 30 mins</strong></span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {stages.map((stage, idx) => {
                                const Icon = stage.icon;
                                const isPassed = idx <= currentStageIdx;
                                const isCurrent = idx === currentStageIdx;

                                return (
                                    <div key={stage.key} className="text-center space-y-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                isPassed ? 'bg-amber-500' : 'bg-stone-200'
                                            }`}
                                        />
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 ${
                                                    isCurrent
                                                        ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                                                        : isPassed
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-stone-100 text-stone-400'
                                                }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-stone-700 leading-tight">
                                                {stage.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Details & Items */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                        <div className="text-xs font-bold text-stone-800 flex justify-between items-center border-b border-stone-200 pb-2">
                            <span>Order Summary</span>
                            <span className="text-[11px] font-semibold text-stone-500">
                                Payment: <strong className="text-stone-900 uppercase">{order.payment_method}</strong> ({order.payment_status})
                            </span>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs">
                                    <div className="text-stone-800 font-semibold">
                                        <span className="font-extrabold text-amber-700 mr-2">{item.quantity}x</span>
                                        {item.product?.name || `Product #${item.product_id}`}
                                    </div>
                                    <div className="font-bold text-stone-900">
                                        ₱{Number(item.subtotal).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
                            <span>Total Paid</span>
                            <span className="text-amber-600">₱{Number(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Delivery Destination */}
                    <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>Destination Address</span>
                        </div>
                        <p className="text-stone-700 pl-5">{order.delivery_address}</p>
                        {order.delivery_landmark && (
                            <p className="text-stone-500 pl-5 text-[11px]">Landmark: {order.delivery_landmark}</p>
                        )}
                    </div>

                    {/* Review Submission Section */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800">
                                Rate Your Pastil Experience
                            </span>
                            <span className="text-[10px] text-stone-400">Stores directly to MySQL</span>
                        </div>

                        {reviewSubmitted ? (
                            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center">
                                ✨ Review submitted! Thank you for supporting Pastil Rice Davao.
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit} className="space-y-3">
                                {/* Stars */}
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${
                                                    (hoverRating || rating) >= star
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-stone-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-stone-600 ml-2">
                                        {rating} of 5 Stars
                                    </span>
                                </div>

                                <textarea
                                    rows="2"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write a quick comment about the food quality, packaging, and rider speed..."
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />

                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{submittingReview ? 'Submitting...' : 'Post Customer Review'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
