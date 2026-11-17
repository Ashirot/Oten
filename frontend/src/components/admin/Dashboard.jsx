import React, { useState } from 'react';
import { Package, ShoppingBag, Truck, BarChart3, Database, AlertTriangle, Layers, TrendingUp, DollarSign } from 'lucide-react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import SupplierCategoryManagement from './SupplierCategoryManagement';
import ReportsView from './ReportsView';
import DatabaseShowcase from './DatabaseShowcase';

export default function Dashboard({
    products = [],
    categories = [],
    suppliers = [],
    onRefreshAll,
    showToast,
    lowStockCount = 0,
}) {
    const [adminTab, setAdminTab] = useState('products'); // 'products', 'orders', 'suppliers_categories', 'reports', 'db_lab'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
                {[
                    { id: 'products', label: 'Products & Inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alerts` : null },
                    { id: 'orders', label: 'Order Processing', icon: ShoppingBag },
                    { id: 'suppliers_categories', label: 'Suppliers & Categories', icon: Truck },
                    { id: 'reports', label: 'Business Reports', icon: BarChart3 },
                    { id: 'db_lab', label: 'Database Laboratory (DB 1)', icon: Database, isSpecial: true },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = adminTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setAdminTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                isActive
                                    ? tab.isSpecial
                                        ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/20'
                                        : 'bg-stone-900 text-white shadow-xs'
                                    : tab.isSpecial
                                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isSpecial ? 'text-amber-600' : 'text-stone-500'}`} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-600 text-white">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div>
                {adminTab === 'products' && (
                    <ProductManagement
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshProducts={onRefreshAll}
                        showToast={showToast}
                    />
                )}

                {adminTab === 'orders' && (
                    <OrderManagement showToast={showToast} />
                )}

                {adminTab === 'suppliers_categories' && (
                    <SupplierCategoryManagement
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshAll={onRefreshAll}
                        showToast={showToast}
                    />
                )}

                {adminTab === 'reports' && (
                    <ReportsView showToast={showToast} />
                )}

                {adminTab === 'db_lab' && (
                    <DatabaseShowcase showToast={showToast} />
                )}
            </div>
        </div>
    );
}
