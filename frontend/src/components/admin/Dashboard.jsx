import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Truck, BarChart3, Database, AlertTriangle, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import SupplierCategoryManagement from './SupplierCategoryManagement';
import ReportsView from './ReportsView';
import DatabaseShowcase from './DatabaseShowcase';

export default function Dashboard({
    user,
    products = [],
    categories = [],
    suppliers = [],
    onRefreshAll,
    showToast,
    lowStockCount = 0,
    onBackToStorefront
}) {
    // If staff, default tab is 'orders' (Order Fulfillment)
    const [adminTab, setAdminTab] = useState(() => (user?.role === 'staff' ? 'orders' : 'products'));

    useEffect(() => {
        if (user?.role === 'staff' && (adminTab === 'reports' || adminTab === 'db_lab' || adminTab === 'suppliers_categories')) {
            setAdminTab('orders');
        }
    }, [user, adminTab]);

    // Check if user is unauthorized
    if (!user || user.role === 'customer') {
        return (
            <div className="max-w-2xl mx-auto my-16 px-4">
                <div className="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xl space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900">Access Restricted</h2>
                    <p className="text-stone-600 text-sm">
                        {user ? (
                            <>Ikaw karon naka-login isip <strong>Customer ({user.name})</strong>. Ang Management Dashboard kay para lamang sa Admin ug Staff.</>
                        ) : (
                            <>Kinahanglan kang mag-login isip <strong>Admin</strong> o <strong>Staff</strong> aron maka-access sa Management Dashboard.</>
                        )}
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={onBackToStorefront}
                            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                        >
                            Balik sa Customer Storefront
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isStaff = user?.role === 'staff';

    // Staff only gets Orders and Products/Stock
    const allTabs = [
        { id: 'orders', label: 'Order Processing', icon: ShoppingBag, staffAllowed: true },
        { id: 'products', label: 'Products & Inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} alerts` : null, staffAllowed: true },
        { id: 'suppliers_categories', label: 'Suppliers & Categories', icon: Truck, staffAllowed: false },
        { id: 'reports', label: 'Business Reports', icon: BarChart3, staffAllowed: false },
        { id: 'db_lab', label: 'Database Laboratory (DB 1)', icon: Database, isSpecial: true, staffAllowed: false },
    ];

    const visibleTabs = isStaff ? allTabs.filter(t => t.staffAllowed) : allTabs;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
            {/* Role Header Banner */}
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isStaff 
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-stone-900 border-stone-800 text-white shadow-xl'
            }`}>
                <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isStaff ? 'bg-blue-600 text-white shadow-md' : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg'
                    }`}>
                        {isStaff ? <UserCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight">
                                {isStaff ? 'Staff Operational Station' : 'Administrator Control Center'}
                            </h1>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md tracking-wider ${
                                isStaff ? 'bg-blue-200 text-blue-900' : 'bg-amber-500 text-stone-950'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isStaff ? 'text-blue-700 font-medium' : 'text-stone-400'}`}>
                            {isStaff
                                ? `Welcome ${user.name}! Naka-focus ka sa Order Fulfillment, Delivery Stages, ug Inventory checks.`
                                : `Welcome Admin ${user.name}! Full access to Products, Orders, Suppliers, Analytics, and Database Systems 1 Diagnostics.`}
                        </p>
                    </div>
                </div>

                {isStaff && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-semibold">
                        <span>Staff Mode: Kitchen & Dispatch</span>
                    </div>
                )}
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
                {visibleTabs.map((tab) => {
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
                {adminTab === 'orders' && (
                    <OrderManagement showToast={showToast} isStaff={isStaff} />
                )}

                {adminTab === 'products' && (
                    <ProductManagement
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshProducts={onRefreshAll}
                        showToast={showToast}
                        isStaff={isStaff}
                    />
                )}

                {!isStaff && adminTab === 'suppliers_categories' && (
                    <SupplierCategoryManagement
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshAll={onRefreshAll}
                        showToast={showToast}
                    />
                )}

                {!isStaff && adminTab === 'reports' && (
                    <ReportsView showToast={showToast} />
                )}

                {!isStaff && adminTab === 'db_lab' && (
                    <DatabaseShowcase showToast={showToast} />
                )}
            </div>
        </div>
    );
}
