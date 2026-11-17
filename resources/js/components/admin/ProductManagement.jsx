import React, { useState } from 'react';
import { Plus, Edit3, Trash2, PackagePlus, AlertTriangle, CheckCircle, RefreshCw, History, ShieldAlert } from 'lucide-react';
import { productsApi, inventoryApi } from '../../services/api';

export default function ProductManagement({
    products = [],
    categories = [],
    suppliers = [],
    onRefreshProducts,
    showToast,
}) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [restockingProduct, setRestockingProduct] = useState(null);
    const [restockQty, setRestockQty] = useState(25);
    const [restockNotes, setRestockNotes] = useState('');
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [inventoryLogs, setInventoryLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Form state for Add/Edit
    const [formData, setFormData] = useState({
        name: '',
        category_id: categories[0]?.id || 1,
        supplier_id: suppliers[0]?.id || 1,
        price: '',
        cost_price: '',
        stock_quantity: 50,
        reorder_level: 15,
        description: '',
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
        is_active: true,
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleOpenAdd = () => {
        setFormData({
            name: '',
            category_id: categories[0]?.id || 1,
            supplier_id: suppliers[0]?.id || 1,
            price: '',
            cost_price: '',
            stock_quantity: 50,
            reorder_level: 15,
            description: '',
            image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
            is_active: true,
        });
        setFormError(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (prod) => {
        setEditingProduct(prod);
        setFormData({
            name: prod.name,
            category_id: prod.category_id,
            supplier_id: prod.supplier_id || '',
            price: prod.price,
            cost_price: prod.cost_price,
            stock_quantity: prod.stock_quantity,
            reorder_level: prod.reorder_level,
            description: prod.description || '',
            image_url: prod.image_url || '',
            is_active: prod.is_active,
        });
        setFormError(null);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, formData);
                showToast?.('Product updated! Price audit trigger executed if price changed.', 'success');
                setEditingProduct(null);
            } else {
                await productsApi.create(formData);
                showToast?.('Product added! Initial inventory log recorded.', 'success');
                setIsAddModalOpen(false);
            }
            onRefreshProducts();
        } catch (err) {
            setFormError(err.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleExecuteRestock = async (e) => {
        e.preventDefault();
        if (!restockingProduct) return;

        try {
            const res = await inventoryApi.restock({
                product_id: restockingProduct.id,
                quantity: Number(restockQty),
                notes: restockNotes || 'Restock replenishment',
            });
            showToast?.(`Restocked via Stored Procedure (sp_RestockProduct). New stock: ${res.new_stock}`, 'success');
            setRestockingProduct(null);
            setRestockQty(25);
            setRestockNotes('');
            onRefreshProducts();
        } catch (err) {
            showToast?.(err.message || 'Restock failed', 'error');
        }
    };

    const handleViewLogs = async (productId = null) => {
        setLoadingLogs(true);
        setShowLogsModal(true);
        try {
            const params = productId ? { product_id: productId } : {};
            const res = await inventoryApi.getLogs(params);
            setInventoryLogs(res.data || []);
        } catch (err) {
            showToast?.('Failed to fetch inventory audit logs', 'error');
        } finally {
            setLoadingLogs(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div>
                    <h2 className="text-xl font-black text-stone-900">Product & Inventory Catalog</h2>
                    <p className="text-xs text-stone-500">
                        Manage pastil products, execute stored procedure restocking, and inspect trigger audit logs.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewLogs()}
                        className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                        <History className="w-4 h-4 text-stone-600" />
                        <span>Audit Logs</span>
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Product</span>
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-stone-200">
                            <tr>
                                <th className="py-3.5 px-4">Item</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Supplier</th>
                                <th className="py-3.5 px-4">Price / Cost</th>
                                <th className="py-3.5 px-4">Stock Level</th>
                                <th className="py-3.5 px-4">Status (UDF)</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {products.map((prod) => {
                                const isLow = prod.stock_quantity <= prod.reorder_level;
                                const isOut = prod.stock_quantity <= 0;

                                return (
                                    <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={prod.image_url}
                                                    alt={prod.name}
                                                    className="w-10 h-10 rounded-xl object-cover bg-stone-100"
                                                />
                                                <div>
                                                    <div className="font-bold text-stone-900">{prod.name}</div>
                                                    <div className="text-[10px] text-stone-400">ID: #{prod.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-stone-800">
                                            {prod.category?.name || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-stone-600">
                                            {prod.supplier?.name || 'In-House'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-stone-900">₱{Number(prod.price).toFixed(2)}</div>
                                            <div className="text-[10px] text-stone-400">Cost: ₱{Number(prod.cost_price).toFixed(2)}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-black text-stone-900 text-sm">
                                                {prod.stock_quantity}
                                            </div>
                                            <div className="text-[10px] text-stone-400">Reorder at: {prod.reorder_level}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                isOut ? 'bg-red-100 text-red-700' :
                                                isLow ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {prod.stock_status || (isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'IN_STOCK')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setRestockingProduct(prod)}
                                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors"
                                                    title="Restock Product (sp_RestockProduct)"
                                                >
                                                    <PackagePlus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(prod)}
                                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                                    title="Edit Product Details"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewLogs(prod.id)}
                                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                                    title="View Item History"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Restock Modal (Executing sp_RestockProduct) */}
            {restockingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Stored Procedure Execution
                                </span>
                                <h3 className="text-lg font-black text-stone-900 mt-1">
                                    Restock: {restockingProduct.name}
                                </h3>
                                <p className="text-xs text-stone-500">
                                    Calls <code>CALL sp_RestockProduct(id, qty, user, notes, @out)</code> in MySQL.
                                </p>
                            </div>
                            <button
                                onClick={() => setRestockingProduct(null)}
                                className="text-stone-400 hover:text-stone-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteRestock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Current Stock: <strong className="text-stone-900">{restockingProduct.stock_quantity}</strong>
                                </label>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Quantity to Add
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Restock Notes / Batch Reference
                                </label>
                                <input
                                    type="text"
                                    value={restockNotes}
                                    onChange={(e) => setRestockNotes(e.target.value)}
                                    placeholder="Supplier batch delivery reference"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                                💡 Stock after procedure execution: <strong>{restockingProduct.stock_quantity + Number(restockQty || 0)} units</strong>.
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                            >
                                Execute sp_RestockProduct
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(isAddModalOpen || editingProduct) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
                    <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 my-8">
                        <div className="flex justify-between items-center pb-3 border-b border-stone-200 mb-4">
                            <h3 className="text-lg font-black text-stone-900">
                                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Pastil Product'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingProduct(null);
                                }}
                                className="text-stone-400 hover:text-stone-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Spicy Chicken Pastil Kagikit"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Supplier</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">In-House Kitchen</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Selling Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="120.00"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    />
                                    <span className="text-[10px] text-stone-400">Check constraint chk_product_price</span>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Cost Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                        placeholder="65.00"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Initial Stock Level</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Reorder Level Alert</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.reorder_level}
                                        onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                                <textarea
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingProduct(null);
                                    }}
                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                                >
                                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inventory Logs Viewer Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
                    <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 my-8">
                        <div className="flex justify-between items-center pb-3 border-b border-stone-200 mb-4">
                            <div>
                                <h3 className="text-lg font-black text-stone-900">
                                    Inventory Audit Trail (Trigger & Procedure Logs)
                                </h3>
                                <p className="text-xs text-stone-500">
                                    Automatically populated by <code>trg_after_order_item_insert</code> and <code>sp_RestockProduct</code>.
                                </p>
                            </div>
                            <button onClick={() => setShowLogsModal(false)} className="text-stone-400 hover:text-stone-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingLogs ? (
                            <div className="py-12 text-center text-xs text-stone-400">Loading audit trail...</div>
                        ) : inventoryLogs.length === 0 ? (
                            <div className="py-12 text-center text-xs text-stone-400">No logs found.</div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left text-xs text-stone-600">
                                    <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px] sticky top-0">
                                        <tr>
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3">Product</th>
                                            <th className="py-2.5 px-3">Type</th>
                                            <th className="py-2.5 px-3">Movement</th>
                                            <th className="py-2.5 px-3">Stock (Before &rarr; After)</th>
                                            <th className="py-2.5 px-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {inventoryLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-stone-50">
                                                <td className="py-2 px-3 text-[11px] text-stone-400">
                                                    {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-2 px-3 font-bold text-stone-800">
                                                    {log.product?.name || `Product #${log.product_id}`}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                        log.movement_type === 'sale' ? 'bg-orange-100 text-orange-800' :
                                                        log.movement_type === 'restock' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-stone-100 text-stone-700'
                                                    }`}>
                                                        {log.movement_type}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 font-bold">
                                                    {log.movement_type === 'sale' ? `-${log.quantity}` : `+${log.quantity}`}
                                                </td>
                                                <td className="py-2 px-3 font-semibold text-stone-700">
                                                    {log.stock_before} &rarr; <strong>{log.stock_after}</strong>
                                                </td>
                                                <td className="py-2 px-3 text-[11px] text-stone-500">
                                                    {log.notes}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function X({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
