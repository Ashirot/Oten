import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Truck, ShieldAlert } from 'lucide-react';
import { categoriesApi, suppliersApi } from '../../services/api';

export default function SupplierCategoryManagement({
    categories = [],
    suppliers = [],
    onRefreshAll,
    showToast,
}) {
    // Categories modal state
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');

    // Suppliers modal state
    const [supModalOpen, setSupModalOpen] = useState(false);
    const [editingSup, setEditingSup] = useState(null);
    const [supForm, setSupForm] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    // Categories handlers
    const handleOpenCatModal = (cat = null) => {
        if (cat) {
            setEditingCat(cat);
            setCatName(cat.name);
            setCatDesc(cat.description || '');
        } else {
            setEditingCat(null);
            setCatName('');
            setCatDesc('');
        }
        setCatModalOpen(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCat) {
                await categoriesApi.update(editingCat.id, { name: catName, description: catDesc });
                showToast?.('Category updated', 'success');
            } else {
                await categoriesApi.create({ name: catName, description: catDesc });
                showToast?.('Category created', 'success');
            }
            setCatModalOpen(false);
            onRefreshAll();
        } catch (err) {
            showToast?.(err.message || 'Failed to save category', 'error');
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
        try {
            await categoriesApi.delete(cat.id);
            showToast?.('Category deleted', 'success');
            onRefreshAll();
        } catch (err) {
            showToast?.(err.message || 'Cannot delete category (violates foreign key constraint)', 'error');
        }
    };

    // Suppliers handlers
    const handleOpenSupModal = (sup = null) => {
        if (sup) {
            setEditingSup(sup);
            setSupForm({
                name: sup.name,
                contact_person: sup.contact_person,
                phone: sup.phone,
                email: sup.email || '',
                address: sup.address || '',
            });
        } else {
            setEditingSup(null);
            setSupForm({
                name: '',
                contact_person: '',
                phone: '',
                email: '',
                address: '',
            });
        }
        setSupModalOpen(true);
    };

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        try {
            if (editingSup) {
                await suppliersApi.update(editingSup.id, supForm);
                showToast?.('Supplier updated', 'success');
            } else {
                await suppliersApi.create(supForm);
                showToast?.('Supplier registered', 'success');
            }
            setSupModalOpen(false);
            onRefreshAll();
        } catch (err) {
            showToast?.(err.message || 'Failed to save supplier', 'error');
        }
    };

    const handleDeleteSupplier = async (sup) => {
        if (!confirm(`Delete supplier "${sup.name}"?`)) return;
        try {
            await suppliersApi.delete(sup.id);
            showToast?.('Supplier deleted', 'success');
            onRefreshAll();
        } catch (err) {
            showToast?.(err.message || 'Failed to delete supplier', 'error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Categories Management */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                        <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                            <Tag className="w-4 h-4 text-amber-600" />
                            <span>Product Categories</span>
                        </h3>
                        <p className="text-[11px] text-stone-400">Classify menu and kagikit items</p>
                    </div>
                    <button
                        onClick={() => handleOpenCatModal()}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Category</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                            <tr>
                                <th className="py-2.5 px-3">Name</th>
                                <th className="py-2.5 px-3">Slug</th>
                                <th className="py-2.5 px-3 text-center">Items</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-stone-50">
                                    <td className="py-2.5 px-3 font-bold text-stone-900">{cat.name}</td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{cat.slug}</td>
                                    <td className="py-2.5 px-3 text-center">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                                            {cat.products_count ?? '—'}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleOpenCatModal(cat)}
                                                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="p-1 text-stone-400 hover:text-red-600 rounded-md"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Suppliers Management */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                        <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                            <Truck className="w-4 h-4 text-orange-600" />
                            <span>Raw Material Suppliers</span>
                        </h3>
                        <p className="text-[11px] text-stone-400">Meat, poultry, seafood, and packaging suppliers</p>
                    </div>
                    <button
                        onClick={() => handleOpenSupModal()}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Supplier</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                            <tr>
                                <th className="py-2.5 px-3">Supplier Name</th>
                                <th className="py-2.5 px-3">Contact</th>
                                <th className="py-2.5 px-3">Phone</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {suppliers.map((sup) => (
                                <tr key={sup.id} className="hover:bg-stone-50">
                                    <td className="py-2.5 px-3">
                                        <div className="font-bold text-stone-900">{sup.name}</div>
                                        <div className="text-[10px] text-stone-400">{sup.address}</div>
                                    </td>
                                    <td className="py-2.5 px-3 text-stone-700 font-medium">{sup.contact_person}</td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{sup.phone}</td>
                                    <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleOpenSupModal(sup)}
                                                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSupplier(sup)}
                                                className="p-1 text-stone-400 hover:text-red-600 rounded-md"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Modal */}
            {catModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
                        <h3 className="text-base font-black text-stone-900 mb-3">
                            {editingCat ? 'Edit Category' : 'New Category'}
                        </h3>
                        <form onSubmit={handleSaveCategory} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="e.g. Desserts"
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                                <textarea
                                    rows="2"
                                    value={catDesc}
                                    onChange={(e) => setCatDesc(e.target.value)}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCatModalOpen(false)}
                                    className="px-3 py-1.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier Modal */}
            {supModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
                        <h3 className="text-base font-black text-stone-900 mb-3">
                            {editingSup ? 'Edit Supplier' : 'Register New Supplier'}
                        </h3>
                        <form onSubmit={handleSaveSupplier} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Company / Supplier Name</label>
                                <input
                                    type="text"
                                    required
                                    value={supForm.name}
                                    onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        required
                                        value={supForm.contact_person}
                                        onChange={(e) => setSupForm({ ...supForm, contact_person: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        required
                                        value={supForm.phone}
                                        onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={supForm.email}
                                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={supForm.address}
                                    onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSupModalOpen(false)}
                                    className="px-3 py-1.5 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs"
                                >
                                    Save Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
