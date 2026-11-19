import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Shield, Store, UserRound, LogOut, UserCheck, ShieldCheck, Utensils, Settings, ChevronDown, ChefHat, Coffee, Heart, Star, Sun, Truck } from 'lucide-react';

export const avatarIcons = { user: UserRound, chef: ChefHat, coffee: Coffee, heart: Heart, star: Star, sun: Sun };

export default function Navbar({
    activeView,
    setActiveView,
    cartCount,
    onOpenCart,
    lastOrder,
    onOpenTracker,
    user,
    onOpenAuth,
    onOpenSettings,
    onLogout,
    lowStockCount = 0
}) {
    const isStaff = user?.role === 'staff';
    const isAdmin = user?.role === 'admin';
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef(null);
    const AvatarIcon = avatarIcons[user?.avatar] || UserRound;

    useEffect(() => {
        const closeOnOutside = (event) => {
            if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
        };
        const closeOnEscape = (event) => { if (event.key === 'Escape') setAccountOpen(false); };
        document.addEventListener('pointerdown', closeOnOutside);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutside);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

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

                    {/* View Switcher Pills (Role-Aware) */}
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
                            onClick={() => setActiveView('menu')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeView === 'menu' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
                        >
                            <Utensils className="w-4 h-4 text-amber-600" /> Menu
                        </button>

                        {/* If Admin: show Admin & DB Dashboard button */}
                        {isAdmin && (
                            <button
                                onClick={() => setActiveView('admin')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all relative ${
                                    activeView === 'admin'
                                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                                        : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Admin & DB Control
                                {lowStockCount > 0 && (
                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                        {lowStockCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* If Staff: show Staff Operations button */}
                        {isStaff && (
                            <button
                                onClick={() => setActiveView('admin')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all relative ${
                                    activeView === 'admin'
                                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                                        : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                <UserCheck className="w-4 h-4" />
                                Staff Operations
                                {lowStockCount > 0 && (
                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                        {lowStockCount}
                                    </span>
                                )}
                            </button>
                        )}

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

                        {lastOrder && (
                            <button
                                type="button"
                                onClick={onOpenTracker}
                                title={`Track order ${lastOrder.order_number}`}
                                aria-label={`Track order ${lastOrder.order_number}`}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-sm border border-emerald-200/70 transition-colors"
                            >
                                <Truck className="w-5 h-5 text-emerald-700" />
                                <span className="hidden sm:inline">Track Order</span>
                            </button>
                        )}

                        {/* User Account / Auth */}
                        <div ref={accountRef} className="relative">
                            <button
                                type="button"
                                onClick={() => user ? setAccountOpen(!accountOpen) : onOpenAuth()}
                                aria-expanded={accountOpen}
                                aria-label={user ? 'Open account menu' : 'Sign in'}
                                title={user ? 'Account' : 'Sign In'}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold shadow-sm"
                            >
                                <AvatarIcon className="w-5 h-5" />
                                <span className="hidden lg:inline max-w-28 truncate">{user?.name || 'Sign In'}</span>
                                {user && <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            {user && accountOpen && (
                                <div className="absolute right-0 top-full mt-2 w-60 p-2 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50">
                                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                                        <div className="font-extrabold text-stone-900 text-sm truncate">{user.name}</div>
                                        <div className="text-xs text-stone-500 truncate">{user.email}</div>
                                        <div className="text-[10px] uppercase tracking-wide text-amber-700 font-bold">{user.role === 'staff' ? 'Cashier' : user.role}</div>
                                    </div>
                                    <button type="button" onClick={() => { setAccountOpen(false); onOpenSettings(); }} className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-amber-50">
                                        <Settings className="w-4 h-4 text-amber-600" /> Account settings
                                    </button>
                                    <button type="button" onClick={() => { setAccountOpen(false); onLogout(); }} className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50">
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
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
                        onClick={() => setActiveView('menu')}
                        className={`flex items-center gap-1.5 py-1 px-3 text-xs font-semibold rounded-md ${activeView === 'menu' ? 'bg-amber-500 text-white' : 'text-stone-600'}`}
                    >
                        <Utensils className="w-3.5 h-3.5" /> Menu
                    </button>
                    {(isAdmin || isStaff) && (
                        <button
                            onClick={() => setActiveView('admin')}
                            className={`flex items-center gap-1.5 py-1 px-3 text-xs font-semibold rounded-md ${
                                activeView === 'admin'
                                    ? isAdmin ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                                    : 'text-stone-600'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            {isAdmin ? 'Admin & DB' : 'Staff Operations'}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
