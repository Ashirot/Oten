import React, { useState, useEffect } from 'react';
import { BarChart3, AlertOctagon, TrendingUp, Users, RefreshCw, FileText, Download } from 'lucide-react';
import { reportsApi } from '../../services/api';

export default function ReportsView({ showToast }) {
    const [activeReport, setActiveReport] = useState('sales'); // 'sales', 'low_stock', 'products', 'customers'
    const [salesData, setSalesData] = useState(null);
    const [lowStockData, setLowStockData] = useState(null);
    const [productPerfData, setProductPerfData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async (type) => {
        setLoading(true);
        try {
            if (type === 'sales') {
                const res = await reportsApi.getSales();
                setSalesData(res);
            } else if (type === 'low_stock') {
                const res = await reportsApi.getLowStock();
                setLowStockData(res);
            } else if (type === 'products') {
                const res = await reportsApi.getProductPerformance();
                setProductPerfData(res);
            } else if (type === 'customers') {
                const res = await reportsApi.getCustomers();
                setCustomerData(res);
            }
        } catch (err) {
            showToast?.('Failed to load report data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(activeReport);
    }, [activeReport]);

    return (
        <div className="space-y-6">
            {/* Header & Report Selection Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-stone-900">Database Systems 1 Reports & Business Intelligence</h2>
                        <p className="text-xs text-stone-500">
                            SQL aggregation queries, multi-table joins, subqueries, database views, and stored functions in action.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchReport(activeReport)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Data</span>
                    </button>
                </div>

                {/* Report Tabs */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                    {[
                        { id: 'sales', label: 'Report 1: Sales & Revenue Analytics', icon: TrendingUp },
                        { id: 'low_stock', label: 'Report 2: Low Stock & Reorder Alerts', icon: AlertOctagon },
                        { id: 'products', label: 'Report 3: Product & Category Rankings', icon: BarChart3 },
                        { id: 'customers', label: 'Report 4: Customer Lifetime Value (UDF)', icon: Users },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeReport === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveReport(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-stone-900 text-white shadow-xs'
                                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-sm">
                    Querying MySQL 8.0 views and aggregate tables...
                </div>
            ) : (
                <>
                    {/* REPORT 1: Sales Summary */}
                    {activeReport === 'sales' && salesData && (
                        <div className="space-y-6">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Gross Sales Revenue</span>
                                    <div className="text-2xl font-black text-stone-900 mt-1">
                                        ₱{Number(salesData.overall_metrics?.gross_revenue || 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-emerald-600 font-semibold mt-1">From completed orders</div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Completed Orders</span>
                                    <div className="text-2xl font-black text-amber-600 mt-1">
                                        {salesData.overall_metrics?.total_completed_orders || 0}
                                    </div>
                                    <div className="text-xs text-stone-500 font-semibold mt-1">Active customer transactions</div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Average Order Value (AOV)</span>
                                    <div className="text-2xl font-black text-stone-900 mt-1">
                                        ₱{Number(salesData.overall_metrics?.overall_aov || 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-stone-500 font-semibold mt-1">Average cart ticket</div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Discounts Granted</span>
                                    <div className="text-2xl font-black text-purple-700 mt-1">
                                        ₱{Number(salesData.overall_metrics?.total_discounts_granted || 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-stone-500 font-semibold mt-1">Free delivery savings</div>
                                </div>
                            </div>

                            {/* Daily Breakdown Table (vw_sales_summary) */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                    <h3 className="font-black text-stone-900 text-sm">
                                        Daily Revenue Breakdown (View: <code>vw_sales_summary</code>)
                                    </h3>
                                    <span className="text-[10px] text-stone-400">Grouped by DATE(created_at)</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-stone-600">
                                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Date</th>
                                                <th className="py-2.5 px-3">Orders Count</th>
                                                <th className="py-2.5 px-3">Units Sold</th>
                                                <th className="py-2.5 px-3">Average Order</th>
                                                <th className="py-2.5 px-3 text-right">Daily Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {salesData.daily_summary?.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-stone-50">
                                                    <td className="py-2.5 px-3 font-bold text-stone-900">{row.sale_date}</td>
                                                    <td className="py-2.5 px-3 font-semibold">{row.total_orders}</td>
                                                    <td className="py-2.5 px-3">{row.total_items_sold}</td>
                                                    <td className="py-2.5 px-3">₱{Number(row.average_order_value).toFixed(2)}</td>
                                                    <td className="py-2.5 px-3 text-right font-black text-stone-900">
                                                        ₱{Number(row.total_revenue).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                                <h3 className="font-black text-stone-900 text-sm">Payment Method Distribution</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {salesData.payment_breakdown?.map((pay, i) => (
                                        <div key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                            <div className="text-xs uppercase font-extrabold text-stone-500">{pay.payment_method}</div>
                                            <div className="text-xl font-black text-stone-900 mt-1">
                                                ₱{Number(pay.total_volume).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-stone-500 mt-0.5">{pay.transaction_count} orders</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORT 2: Low Stock Alerts */}
                    {activeReport === 'low_stock' && lowStockData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Items Needing Restock</span>
                                    <div className="text-2xl font-black text-amber-600 mt-1">
                                        {lowStockData.summary?.total_alerts || 0}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1">At or below reorder threshold</div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Out of Stock Items</span>
                                    <div className="text-2xl font-black text-red-600 mt-1">
                                        {lowStockData.summary?.out_of_stock_count || 0}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1">Immediate action needed</div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Units to Order</span>
                                    <div className="text-2xl font-black text-stone-900 mt-1">
                                        {lowStockData.summary?.total_units_to_order || 0}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-1">Combined deficit count</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                    <h3 className="font-black text-stone-900 text-sm">
                                        Reorder Recommendations (View: <code>vw_low_stock_alerts</code>)
                                    </h3>
                                    <span className="text-[10px] text-stone-400">Computed via MySQL view & UDF</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-stone-600">
                                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Product Name</th>
                                                <th className="py-2.5 px-3">Category</th>
                                                <th className="py-2.5 px-3">Supplier & Contact</th>
                                                <th className="py-2.5 px-3">Current Stock</th>
                                                <th className="py-2.5 px-3">Reorder Point</th>
                                                <th className="py-2.5 px-3">Deficit (Units Needed)</th>
                                                <th className="py-2.5 px-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {lowStockData.items?.map((item) => (
                                                <tr key={item.id} className="hover:bg-stone-50">
                                                    <td className="py-2.5 px-3 font-bold text-stone-900">{item.product_name}</td>
                                                    <td className="py-2.5 px-3 font-semibold">{item.category_name}</td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-medium text-stone-800">{item.supplier_name || 'In-House'}</div>
                                                        <div className="text-[10px] text-stone-400">{item.supplier_phone}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-black text-stone-900">{item.stock_quantity}</td>
                                                    <td className="py-2.5 px-3">{item.reorder_level}</td>
                                                    <td className="py-2.5 px-3 font-bold text-amber-700">+{item.units_needed} units</td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                            item.stock_status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {item.stock_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORT 3: Product Performance */}
                    {activeReport === 'products' && productPerfData && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                    <h3 className="font-black text-stone-900 text-sm">
                                        Top Selling Pastil Flavors (View: <code>vw_product_performance</code>)
                                    </h3>
                                    <span className="text-[10px] text-stone-400">Ranked by Total Revenue Generated</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-stone-600">
                                        <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Rank & Product</th>
                                                <th className="py-2.5 px-3">Category</th>
                                                <th className="py-2.5 px-3">Price</th>
                                                <th className="py-2.5 px-3">Units Sold</th>
                                                <th className="py-2.5 px-3">Orders</th>
                                                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {productPerfData.product_rankings?.map((prod, index) => (
                                                <tr key={prod.product_id} className="hover:bg-stone-50">
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 font-black text-[10px] flex items-center justify-center">
                                                                #{index + 1}
                                                            </span>
                                                            <span className="font-bold text-stone-900">{prod.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 font-semibold">{prod.category_name}</td>
                                                    <td className="py-2.5 px-3">₱{Number(prod.current_price).toFixed(2)}</td>
                                                    <td className="py-2.5 px-3 font-black text-amber-700">{prod.total_quantity_sold} units</td>
                                                    <td className="py-2.5 px-3">{prod.number_of_orders}</td>
                                                    <td className="py-2.5 px-3 text-right font-black text-stone-900">
                                                        ₱{Number(prod.total_revenue_generated).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Category Share Breakdown */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                                <h3 className="font-black text-stone-900 text-sm">Category Revenue Contribution</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {productPerfData.category_breakdown?.map((cat) => (
                                        <div key={cat.category_id} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                            <div className="text-xs uppercase font-extrabold text-stone-500">{cat.category_name}</div>
                                            <div className="text-xl font-black text-stone-900 mt-1">
                                                ₱{Number(cat.category_revenue).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-stone-500 mt-0.5">{cat.total_units_sold} units sold</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORT 4: Customer Spending (UDF Demonstration) */}
                    {activeReport === 'customers' && customerData && (
                        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                <div>
                                    <h3 className="font-black text-stone-900 text-sm">
                                        Customer Spending & Lifetime Value
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        Demonstrates User-Defined Function: <code>fn_CalculateCustomerTotalSpent(u.id)</code>.
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded-md font-bold">
                                    MySQL UDF Activated
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-stone-600">
                                    <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2.5 px-3">Customer Name</th>
                                            <th className="py-2.5 px-3">Email</th>
                                            <th className="py-2.5 px-3">Phone</th>
                                            <th className="py-2.5 px-3 text-center">Lifetime Orders</th>
                                            <th className="py-2.5 px-3 text-right">Computed Total Spent (UDF)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {customerData.customers?.map((cust) => (
                                            <tr key={cust.id} className="hover:bg-stone-50">
                                                <td className="py-2.5 px-3 font-bold text-stone-900">{cust.name}</td>
                                                <td className="py-2.5 px-3 font-mono text-[11px]">{cust.email}</td>
                                                <td className="py-2.5 px-3 font-mono text-[11px]">{cust.phone || '—'}</td>
                                                <td className="py-2.5 px-3 text-center font-bold">{cust.total_orders}</td>
                                                <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                                                    ₱{Number(cust.total_spent).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
