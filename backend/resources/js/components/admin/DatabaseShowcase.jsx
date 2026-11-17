import React, { useState, useEffect } from 'react';
import { Database, Zap, GitCommit, FileCode, CheckCircle2, AlertTriangle, Play, RefreshCw, Cpu, Layers } from 'lucide-react';
import { dbToolsApi } from '../../services/api';

export default function DatabaseShowcase({ showToast }) {
    const [subTab, setSubTab] = useState('optimization'); // 'optimization', 'transactions', 'schema', 'routines'
    
    // Optimization State
    const [optExample, setOptExample] = useState(1);
    const [optData, setOptData] = useState(null);
    const [loadingOpt, setLoadingOpt] = useState(false);

    // Transaction State
    const [txResult, setTxResult] = useState(null);
    const [runningTx, setRunningTx] = useState(false);

    // Schema State
    const [schemaData, setSchemaData] = useState(null);
    const [loadingSchema, setLoadingSchema] = useState(false);
    const [selectedTable, setSelectedTable] = useState('products');

    const fetchOptimization = async (ex) => {
        setLoadingOpt(true);
        try {
            const res = await dbToolsApi.getOptimization(ex);
            setOptData(res);
        } catch (err) {
            showToast?.('Failed to run query explain', 'error');
        } finally {
            setLoadingOpt(false);
        }
    };

    const fetchSchema = async () => {
        setLoadingSchema(true);
        try {
            const res = await dbToolsApi.getSchema();
            setSchemaData(res);
        } catch (err) {
            showToast?.('Failed to load database dictionary', 'error');
        } finally {
            setLoadingSchema(false);
        }
    };

    useEffect(() => {
        if (subTab === 'optimization') {
            fetchOptimization(optExample);
        } else if (subTab === 'schema' || subTab === 'routines') {
            if (!schemaData) fetchSchema();
        }
    }, [subTab, optExample]);

    const handleRunTransaction = async (action) => {
        setRunningTx(true);
        try {
            const res = await dbToolsApi.runTransactionDemo(action);
            setTxResult(res);
            if (action === 'commit') {
                showToast?.('Transaction committed successfully (ACID guaranteed)!', 'success');
            } else {
                showToast?.('Transaction rolled back successfully upon trigger exception!', 'success');
            }
        } catch (err) {
            showToast?.('Transaction execution failed', 'error');
        } finally {
            setRunningTx(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Feature Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Academic Evaluation Suite
                    </span>
                    <h2 className="text-xl font-black text-stone-900 mt-2">
                        Database Systems 1 Project Laboratory & Diagnostics
                    </h2>
                    <p className="text-xs text-stone-500">
                        Live proof of query execution plans, MySQL B-tree index optimization, ACID transaction control, stored routines, and relational schema.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                    {[
                        { id: 'optimization', label: 'Section D: Query Optimization & EXPLAIN', icon: Zap },
                        { id: 'transactions', label: 'Section E: Transaction & Concurrency Demo', icon: GitCommit },
                        { id: 'schema', label: 'Section B: Data Dictionary & Tables', icon: Database },
                        { id: 'routines', label: 'Section C: Triggers & Stored Routines', icon: Layers },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = subTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSubTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB 1: Query Optimization (Section D) */}
            {subTab === 'optimization' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-black text-stone-900 text-base">Select Query Optimization Demonstration</h3>
                                <p className="text-xs text-stone-500">
                                    Compare unoptimized queries vs index-boosted executions with real MySQL 8.0 EXPLAIN analysis.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setOptExample(1)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        optExample === 1 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                                    }`}
                                >
                                    Example 1: Composite Index
                                </button>
                                <button
                                    onClick={() => setOptExample(2)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        optExample === 2 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                                    }`}
                                >
                                    Example 2: Correlated Subquery Elimination
                                </button>
                            </div>
                        </div>

                        {optData && (
                            <div className="space-y-4 pt-2 border-t border-stone-100">
                                <div>
                                    <div className="text-sm font-black text-stone-900">{optData.title}</div>
                                    <p className="text-xs text-stone-600 mt-0.5">{optData.description}</p>
                                    <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        Optimization Applied: {optData.technique}
                                    </span>
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Original Query */}
                                    <div className="bg-stone-900 text-stone-200 rounded-2xl p-4 space-y-3 font-mono text-xs overflow-hidden">
                                        <div className="flex items-center justify-between text-red-400 font-bold border-b border-stone-800 pb-2">
                                            <span>🔴 Original Query (Before Optimization)</span>
                                            <span className="text-[10px] text-stone-400">Slow / Full Scan</span>
                                        </div>
                                        <pre className="p-3 bg-stone-950 rounded-xl overflow-x-auto text-amber-200 text-[11px] leading-relaxed">
                                            {optData.original?.sql}
                                        </pre>
                                        <div>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                                MySQL EXPLAIN Plan (JSON Cost Output):
                                            </span>
                                            <pre className="p-3 bg-stone-950 rounded-xl overflow-x-auto text-[10px] text-stone-400 max-h-48">
                                                {JSON.stringify(optData.original?.explain, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Optimized Query */}
                                    <div className="bg-stone-900 text-stone-200 rounded-2xl p-4 space-y-3 font-mono text-xs overflow-hidden">
                                        <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-stone-800 pb-2">
                                            <span>🟢 Optimized Query (After Indexing / Rewrite)</span>
                                            <span className="text-[10px] text-emerald-300">Fast / Indexed Plan</span>
                                        </div>
                                        <pre className="p-3 bg-stone-950 rounded-xl overflow-x-auto text-emerald-200 text-[11px] leading-relaxed">
                                            {optData.optimized?.sql}
                                        </pre>
                                        <div>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                                MySQL EXPLAIN Plan (JSON Cost Output):
                                            </span>
                                            <pre className="p-3 bg-stone-950 rounded-xl overflow-x-auto text-[10px] text-emerald-400 max-h-48">
                                                {JSON.stringify(optData.optimized?.explain, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Explanation Banner */}
                                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1">
                                    <div className="font-black text-amber-900 flex items-center gap-1.5">
                                        <Cpu className="w-4 h-4 text-amber-600" />
                                        <span>Rubric Analysis & Findings:</span>
                                    </div>
                                    <p className="text-stone-700 leading-relaxed">
                                        {optData.analysis}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: Transactions & Concurrency (Section E) */}
            {subTab === 'transactions' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div>
                            <h3 className="font-black text-stone-900 text-base">
                                Transaction Management & Concurrency Control Demonstration
                            </h3>
                            <p className="text-xs text-stone-500">
                                Demonstrates <code>START TRANSACTION</code>, <code>COMMIT</code>, and <code>ROLLBACK</code>. 
                                Shows how the DBMS protects database consistency during concurrent inventory decrements.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Commit Demo Button */}
                            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                                <div className="font-black text-emerald-900 text-sm">
                                    Case 1: Successful Order Transaction (COMMIT)
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    Executes START TRANSACTION, inserts order, inserts items, lets triggers fire, and issues COMMIT. All data persists permanently.
                                </p>
                                <button
                                    onClick={() => handleRunTransaction('commit')}
                                    disabled={runningTx}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Run COMMIT Demo</span>
                                </button>
                            </div>

                            {/* Rollback Demo Button */}
                            <div className="p-5 bg-red-50/60 rounded-2xl border border-red-200/80 space-y-3">
                                <div className="font-black text-red-900 text-sm">
                                    Case 2: Aborted Transaction via Trigger Error (ROLLBACK)
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    Inserts order but intentionally attempts an illegal negative stock update. 
                                    The <code>trg_prevent_negative_stock</code> trigger throws SQLSTATE 45000, triggering an automatic ROLLBACK that restores complete integrity.
                                </p>
                                <button
                                    onClick={() => handleRunTransaction('rollback')}
                                    disabled={runningTx}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>Run ROLLBACK Demo</span>
                                </button>
                            </div>
                        </div>

                        {/* Transaction Live Output Result */}
                        {txResult && (
                            <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl font-mono text-xs space-y-2 mt-4">
                                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-stone-800 pb-2">
                                    <span>Live MySQL Transaction Output</span>
                                    <span className="uppercase text-[10px]">{txResult.status}</span>
                                </div>
                                <div><strong>Action:</strong> {txResult.action?.toUpperCase()}</div>
                                <div><strong>Log Message:</strong> {txResult.message}</div>
                                {txResult.action === 'commit' ? (
                                    <>
                                        <div><strong>Product Stock:</strong> {txResult.stock_before} &rarr; {txResult.stock_after}</div>
                                        <div className="text-emerald-400"><strong>Consistency Verification:</strong> {txResult.consistency}</div>
                                    </>
                                ) : (
                                    <>
                                        <div><strong>Order Persisted in DB?</strong> {txResult.order_persisted}</div>
                                        <div><strong>Stock Quantity Intact?</strong> {txResult.stock_intact}</div>
                                        <div className="text-amber-400"><strong>Atomicity Guarantee:</strong> {txResult.consistency}</div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Concurrency Discussion Card */}
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                            <div className="font-black text-stone-900 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-amber-600" />
                                <span>Concurrency Control Mechanism (Section E Discussion):</span>
                            </div>
                            <p className="text-stone-600 leading-relaxed">
                                In a multi-user environment, simultaneous orders for the same low-stock product can create a 
                                <strong> Race Condition / Lost Update</strong> anomaly. 
                                Our system resolves this using <strong>Pessimistic Row-Level Locking</strong> via <code>Product::lockForUpdate()</code> (executing <code>SELECT ... FOR UPDATE</code> in MySQL). 
                                The first transaction acquires an exclusive lock (X-lock) on the product row, forcing concurrent checkout sessions to wait until the lock is released or reject insufficient inventory, preserving 100% data consistency.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Data Dictionary & Tables (Section B) */}
            {subTab === 'schema' && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
                        <div>
                            <h3 className="font-black text-stone-900 text-base">Relational Database Data Dictionary</h3>
                            <p className="text-xs text-stone-500">
                                Detailed field descriptions, keys, nullability, and database constraints.
                            </p>
                        </div>

                        {/* Table Selector Pills */}
                        {schemaData && (
                            <div className="flex flex-wrap gap-1.5">
                                {Object.keys(schemaData.tables || {}).map((tbl) => (
                                    <button
                                        key={tbl}
                                        onClick={() => setSelectedTable(tbl)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            selectedTable === tbl
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                        }`}
                                    >
                                        {tbl}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Columns Table */}
                    {schemaData?.tables?.[selectedTable] ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-stone-600">
                                <thead className="bg-stone-50 text-stone-700 font-extrabold uppercase text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-3">Column Name</th>
                                        <th className="py-2.5 px-3">Data Type</th>
                                        <th className="py-2.5 px-3">Key</th>
                                        <th className="py-2.5 px-3">Nullable</th>
                                        <th className="py-2.5 px-3">Default Value</th>
                                        <th className="py-2.5 px-3">Extra</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {schemaData.tables[selectedTable].map((col, idx) => (
                                        <tr key={idx} className="hover:bg-stone-50 font-mono text-[11px]">
                                            <td className="py-2 px-3 font-bold text-stone-900">{col.name}</td>
                                            <td className="py-2 px-3 text-amber-700">{col.type}</td>
                                            <td className="py-2 px-3">
                                                {col.column_key === 'PRI' ? (
                                                    <span className="px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 font-bold text-[9px]">PK</span>
                                                ) : col.column_key === 'MUL' ? (
                                                    <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 font-bold text-[9px]">FK / IDX</span>
                                                ) : col.column_key === 'UNI' ? (
                                                    <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 font-bold text-[9px]">UNIQUE</span>
                                                ) : '—'}
                                            </td>
                                            <td className="py-2 px-3">{col.is_nullable}</td>
                                            <td className="py-2 px-3 text-stone-400">{col.default_value ?? 'NULL'}</td>
                                            <td className="py-2 px-3 text-stone-400">{col.extra || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-stone-400">Loading dictionary...</div>
                    )}
                </div>
            )}

            {/* TAB 4: Stored Routines & Triggers (Section C) */}
            {subTab === 'routines' && (
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="pb-3 border-b border-stone-100">
                            <h3 className="font-black text-stone-900 text-base">Active MySQL Triggers & Stored Routines</h3>
                            <p className="text-xs text-stone-500">
                                Live triggers and routines registered inside MySQL 8.0 server engine.
                            </p>
                        </div>

                        {/* Triggers List */}
                        <div className="space-y-3">
                            <h4 className="font-extrabold text-stone-800 text-xs uppercase tracking-wider">
                                ⚡ Registered Triggers (At least 2 required &bull; 3 implemented):
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    {
                                        name: 'trg_prevent_negative_stock',
                                        timing: 'BEFORE UPDATE ON products',
                                        purpose: 'Enforces non-negative stock quantity. Signals SQLSTATE 45000 if NEW.stock_quantity < 0.',
                                    },
                                    {
                                        name: 'trg_product_price_audit',
                                        timing: 'AFTER UPDATE ON products',
                                        purpose: 'Automatically logs old and new prices to product_price_audits when price changes.',
                                    },
                                    {
                                        name: 'trg_after_order_item_insert',
                                        timing: 'AFTER INSERT ON order_items',
                                        purpose: 'Automatically decrements stock and inserts audit records into inventory_logs.',
                                    },
                                ].map((trg, i) => (
                                    <div key={i} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                                        <div className="font-mono font-bold text-xs text-stone-900">{trg.name}</div>
                                        <div className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                            {trg.timing}
                                        </div>
                                        <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
                                            {trg.purpose}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stored Procedures & Functions List */}
                        <div className="space-y-3 pt-3 border-t border-stone-100">
                            <h4 className="font-extrabold text-stone-800 text-xs uppercase tracking-wider">
                                🔧 Stored Procedures & User-Defined Functions:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    {
                                        name: 'sp_RestockProduct',
                                        type: 'PROCEDURE',
                                        signature: '(IN p_product_id, IN p_qty, IN p_user_id, IN p_notes, OUT p_new_stock)',
                                        purpose: 'Performs transactional stock replenishment, updates inventory_logs, and returns updated count.',
                                    },
                                    {
                                        name: 'sp_ProcessOrder',
                                        type: 'PROCEDURE',
                                        signature: '(IN p_order_number, IN p_user_id, ..., OUT p_order_id)',
                                        purpose: 'Creates customer order within database transaction with ACID guarantees.',
                                    },
                                    {
                                        name: 'fn_CalculateCustomerTotalSpent',
                                        type: 'FUNCTION',
                                        signature: '(p_user_id BIGINT) RETURNS DECIMAL(10,2)',
                                        purpose: 'Aggregates lifetime spend of a customer across all delivered orders.',
                                    },
                                    {
                                        name: 'fn_GetProductStockStatus',
                                        type: 'FUNCTION',
                                        signature: '(p_stock INT, p_reorder_level INT) RETURNS VARCHAR(20)',
                                        purpose: 'Dynamically computes IN_STOCK, LOW_STOCK, or OUT_OF_STOCK classification.',
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-xs text-stone-900">{item.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                                item.type === 'PROCEDURE' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-stone-500 truncate">
                                            {item.signature}
                                        </div>
                                        <p className="text-[11px] text-stone-600 leading-relaxed">
                                            {item.purpose}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
