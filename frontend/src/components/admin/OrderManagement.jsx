import React, { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle2, Truck, XCircle, Search, RefreshCw, MapPin, Phone } from 'lucide-react';
import { ordersApi } from '../../services/api';

export default function OrderManagement({ showToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;
            const res = await ordersApi.getAll(params);
            setOrders(res || []);
        } catch (err) {
            showToast?.('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            await ordersApi.updateStatus(orderId, { order_status: newStatus });
            showToast?.(`Order updated to ${newStatus.toUpperCase()}`, 'success');
            await fetchOrders();
        } catch (err) {
            showToast?.(err.message || 'Failed to update order status', 'error');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleUpdatePayment = async (order, nextPaymentStatus) => {
        const prompt = nextPaymentStatus === 'paid'
            ? `Have you actually received payment for order ${order.order_number}? This will mark it as PAID.`
            : `Has the refund for order ${order.order_number} actually been sent? This will mark it as REFUNDED.`;
        if (!window.confirm(prompt)) return;

        setUpdatingOrderId(order.id);
        try {
            await ordersApi.updateStatus(order.id, {
                order_status: order.order_status,
                payment_status: nextPaymentStatus,
            });
            showToast?.(`Payment recorded as ${nextPaymentStatus.toUpperCase()}`, 'success');
            await fetchOrders();
        } catch (err) {
            showToast?.(err.message || 'Failed to update payment status', 'error');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div>
                    <h2 className="text-xl font-black text-stone-900">Orders Management</h2>
                    <p className="text-xs text-stone-500">
                        Track customer orders, manage preparation stages, and dispatch riders across Davao City.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Cooking / Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                        onClick={fetchOrders}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                        title="Refresh Orders"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-stone-200">
                            <tr>
                                <th className="py-3.5 px-4">Order #</th>
                                <th className="py-3.5 px-4">Customer</th>
                                <th className="py-3.5 px-4">Date & Time</th>
                                <th className="py-3.5 px-4">Total Amount</th>
                                <th className="py-3.5 px-4">Payment</th>
                                <th className="py-3.5 px-4">Stage</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-stone-400">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-stone-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((ord) => {
                                    const isDelivered = ord.order_status === 'delivered';
                                    const isCancelled = ord.order_status === 'cancelled';

                                    return (
                                        <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                                                {ord.order_number}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-stone-900">{ord.customer_name}</div>
                                                <div className="text-[10px] text-stone-400">{ord.customer_phone}</div>
                                            </td>
                                            <td className="py-3 px-4 text-[11px] text-stone-500">
                                                {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-4 font-black text-stone-900">
                                                ₱{Number(ord.total_amount).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-stone-800 uppercase text-[11px]">
                                                    {ord.payment_method}
                                                </div>
                                                <span className={`inline-block text-[9px] font-extrabold uppercase px-1.5 rounded-sm ${
                                                    ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800'
                                                        : ord.payment_status === 'cancelled' ? 'bg-red-100 text-red-800'
                                                        : ord.payment_status === 'refunded' ? 'bg-violet-100 text-violet-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {ord.payment_status}
                                                </span>
                                                {ord.payment_status === 'pending' && !isCancelled && (
                                                    <button
                                                        type="button"
                                                        disabled={updatingOrderId === ord.id}
                                                        onClick={() => handleUpdatePayment(ord, 'paid')}
                                                        className="block mt-1.5 text-[10px] font-bold text-emerald-700 hover:underline disabled:opacity-50"
                                                        title="Confirm a payment that staff has actually received"
                                                    >
                                                        Confirm Paid
                                                    </button>
                                                )}
                                                {ord.payment_status === 'paid' && isCancelled && (
                                                    <button
                                                        type="button"
                                                        disabled={updatingOrderId === ord.id}
                                                        onClick={() => handleUpdatePayment(ord, 'refunded')}
                                                        className="block mt-1.5 text-[10px] font-bold text-violet-700 hover:underline disabled:opacity-50"
                                                        title="Record a refund that has already been issued"
                                                    >
                                                        Record Refund
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={ord.order_status}
                                                    onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                                    disabled={updatingOrderId === ord.id}
                                                    className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Cooking / Packing</option>
                                                    <option value="out_for_delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(ord)}
                                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                                    title="View Full Order Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-amber-600">
                                    Order Breakdown
                                </span>
                                <h3 className="text-lg font-black text-stone-900">
                                    #{selectedOrder.order_number}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-stone-400 hover:text-stone-700"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-stone-500">Customer:</span>
                                <span className="font-bold text-stone-900">{selectedOrder.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Mobile Phone:</span>
                                <span className="font-bold text-stone-900">{selectedOrder.customer_phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Address:</span>
                                <span className="font-semibold text-stone-900 text-right">{selectedOrder.delivery_address}</span>
                            </div>
                            {selectedOrder.delivery_landmark && (
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Landmark:</span>
                                    <span className="text-stone-700">{selectedOrder.delivery_landmark}</span>
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedOrder.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs py-1 border-b border-stone-100">
                                    <div>
                                        <span className="font-black text-amber-600 mr-2">{item.quantity}x</span>
                                        <span className="font-bold text-stone-900">{item.product?.name}</span>
                                    </div>
                                    <span className="font-bold text-stone-900">₱{Number(item.subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Financials */}
                        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₱{Number(selectedOrder.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-semibold">
                                <span>Discount</span>
                                <span>-₱{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-black text-sm text-stone-900 pt-1 border-t border-amber-200">
                                <span>Total Amount</span>
                                <span className="text-amber-600">₱{Number(selectedOrder.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
