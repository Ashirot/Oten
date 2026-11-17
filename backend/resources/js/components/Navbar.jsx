import React from 'react';
import { ShoppingBag, Shield, Store, User, LogOut, Database, AlertCircle } from 'lucide-react';

export default function Navbar({
    activeView,
    setActiveView,
    cartCount,
    onOpenCart,
    user,
    onOpenAuth,
    onLogout,
    lowStockCount = 0
}) {
    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setActiveView('storefront')}
                    >
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                            P
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                                Pastil Rice
                            </span>
                            <span className="block text-xs font-semibold text-amber-600 tracking-wider uppercase">
                                Davao City • DB Systems 1
                            </span>
                        </div>
                    </div>

                    {/* View Switcher Pills */}
                    <div className="hidden md:flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
                        <button
                            onClick={() => setActiveView('storefront')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                activeView === 'storefront'
                                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            <Store className="w-4 h-4 text-amber-600" />
                            Storefront
                        </button>
                        <button
                            onClick={() => setActiveView('admin')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all relative ${
                                activeView === 'admin'
                                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            <Shield className="w-4 h-4 text-orange-600" />
                            Management & DB Dashboard
                            {lowStockCount > 0 && (
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {lowStockCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button (Always visible on storefront) */}
                        <button
                            type="button"
                            onClick={onOpenCart}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-sm transition-colors border border-amber-200/60"
                            aria-label="View shopping cart"
                        >
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                            <span className="hidden sm:inline">Cart</span>
                            <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold">
                                {cartCount}
                            </span>
                        </button>

                        {/* User Account / Auth */}
                        {user ? (
                            <div className="flex items-center gap-2 bg-stone-100 pl-3 pr-2 py-1.5 rounded-xl border border-stone-200">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-bold text-stone-900 leading-tight">{user.name}</div>
                                    <span className={`inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    title="Log out"
                                    className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-all shadow-xs"
                            >
                                <User className="w-4 h-4" />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile View Switcher */}
                <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-200">
                    <button
                        onClick={() => setActiveView('storefront')}
                        className={`flex items-center gap-1.5 py-1 px-3 text-xs font-semibold rounded-md ${
                            activeView === 'storefront' ? 'bg-amber-500 text-white' : 'text-stone-600'
                        }`}
                    >
                        <Store className="w-3.5 h-3.5" />
                        Storefront
                    </button>
                    <button
                        onClick={() => setActiveView('admin')}
                        className={`flex items-center gap-1.5 py-1 px-3 text-xs font-semibold rounded-md ${
                            activeView === 'admin' ? 'bg-amber-500 text-white' : 'text-stone-600'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Management & DB
                    </button>
                </div>
            </div>
        </header>
    );
}
