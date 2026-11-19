import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Storefront from './components/customer/Storefront';
import ProductDetailModal from './components/customer/ProductDetailModal';
import QuantityModal from './components/customer/QuantityModal';
import CartDrawer from './components/customer/CartDrawer';
import CheckoutModal from './components/customer/CheckoutModal';
import OrderTrackerModal from './components/customer/OrderTrackerModal';
import Dashboard from './components/admin/Dashboard';
import AuthModal from './components/AuthModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { authApi, ordersApi, productsApi, categoriesApi, suppliersApi, reviewsApi, inventoryApi } from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
    const [activeView, setActiveView] = useState('storefront'); // Home, menu, or staff dashboard
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);

    // Filters for storefront
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Cart state
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('pastil_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // User authentication state
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('pastil_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Modals
    const [detailProduct, setDetailProduct] = useState(null);
    const [quantityProduct, setQuantityProduct] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    // Keep the latest receipt available when the tracker is closed or the tab reloads.
    const [trackedOrder, setTrackedOrder] = useState(() => {
        try {
            const saved = sessionStorage.getItem('pastil_recent_order');
            const receipt = saved ? JSON.parse(saved) : null;
            return receipt && receipt.id && receipt.order_number && Array.isArray(receipt.items)
                ? receipt : null;
        } catch {
            return null;
        }
    });
    const [isTrackerOpen, setIsTrackerOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Save cart
    useEffect(() => {
        localStorage.setItem('pastil_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        try {
            if (trackedOrder) sessionStorage.setItem('pastil_recent_order', JSON.stringify(trackedOrder));
            else sessionStorage.removeItem('pastil_recent_order');
        } catch {
            // Private browsing can block session storage; tracking still works in memory.
        }
    }, [trackedOrder]);

    // Signed-in customers can receive new order statuses without refreshing.
    useEffect(() => {
        if (!isTrackerOpen || !trackedOrder?.id || user?.role !== 'customer'
            || Number(trackedOrder.user_id) !== Number(user.id)) return;

        let cancelled = false;
        const refresh = async () => {
            try {
                const latest = await ordersApi.getOne(trackedOrder.id);
                if (!cancelled) setTrackedOrder(latest);
            } catch (error) {
                // Keep the saved receipt visible if the network is temporarily unavailable.
                console.warn('Could not refresh order status:', error.message);
            }
        };
        refresh();
        const timer = setInterval(refresh, 15000);
        return () => { cancelled = true; clearInterval(timer); };
    }, [isTrackerOpen, trackedOrder?.id, trackedOrder?.user_id, user?.id, user?.role]);

    // Initial data fetch
    const loadData = async () => {
        try {
            const [prods, cats, sups, revs, lowAlerts] = await Promise.all([
                productsApi.getAll(),
                categoriesApi.getAll(),
                ['admin', 'staff'].includes(user?.role) ? suppliersApi.getAll() : Promise.resolve([]),
                reviewsApi.getAll(),
                ['admin', 'staff'].includes(user?.role) ? inventoryApi.getLowStock().catch(() => []) : Promise.resolve([]),
            ]);

            setProducts(prods || []);
            setCategories(cats || []);
            setSuppliers(sups || []);
            setReviews(revs || []);
            setLowStockCount(Array.isArray(lowAlerts) ? lowAlerts.length : 0);
        } catch (err) {
            console.error('Failed to load initial data:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.role]);

    // Local storage is only a cache; the API determines the actual authenticated role.
    useEffect(() => {
        if (!localStorage.getItem('pastil_auth_token')) {
            localStorage.removeItem('pastil_user');
            setUser(null);
            if (trackedOrder?.user_id) setTrackedOrder(null);
            return;
        }
        let cancelled = false;
        authApi.me().then((account) => {
            if (cancelled) return;
            setUser(account);
            localStorage.setItem('pastil_user', JSON.stringify(account));
            setActiveView(['admin', 'staff'].includes(account.role) ? 'admin' : 'storefront');
        }).catch(() => {
            if (cancelled) return;
            localStorage.removeItem('pastil_auth_token');
            localStorage.removeItem('pastil_user');
            setUser(null);
            if (trackedOrder?.user_id) setTrackedOrder(null);
            setActiveView('storefront');
        });
        return () => { cancelled = true; };
    }, []);

    // Filtered products for storefront
    const filteredProducts = products.filter((p) => {
        const matchesCategory =
            selectedCategory === 'all' ||
            p.category?.slug === selectedCategory ||
            p.category?.name.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Cart actions
    const handleQuickAdd = (product) => {
        if (Number(product.stock_quantity) <= 0) {
            showToast('Sorry, this item is sold out.', 'error');
            return;
        }
        setQuantityProduct(product);
    };

    const handleConfirmAddToCart = (product, qty) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.product.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                const newQty = Math.min(product.stock_quantity, updated[existingIndex].quantity + qty);
                updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
                return updated;
            } else {
                return [...prev, { product, quantity: qty }];
            }
        });
        showToast(`Added ${qty}x ${product.name} to cart`, 'success');
    };

    const handleUpdateCartQty = (productId, newQty) => {
        if (newQty <= 0) {
            handleRemoveCartItem(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity: newQty } : item
            )
        );
    };

    const handleRemoveCartItem = (productId) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        showToast('Item removed from cart', 'info');
    };

    const handleOrderPlaced = (newOrder) => {
        setCart([]);
        setIsCheckoutOpen(false);
        setTrackedOrder(newOrder);
        setIsTrackerOpen(true);
        loadData(); // refresh stock numbers
    };

    const handleAuthSuccess = (loggedInUser) => {
        setUser(loggedInUser);
        if (loggedInUser.role === 'admin') {
            setActiveView('admin');
            showToast(`Directed to Admin & DB Control Center (${loggedInUser.name})`, 'success');
        } else if (loggedInUser.role === 'staff') {
            setActiveView('admin');
            showToast(`Directed to Staff Operations Station (${loggedInUser.name})`, 'success');
        } else {
            setActiveView('storefront');
            showToast(`Welcome ${loggedInUser.name}! Ready to order Davao Pastil.`, 'success');
        }
    };

    const handleLogout = () => {
        if (localStorage.getItem('pastil_auth_token')) authApi.logout().catch(() => {});
        localStorage.removeItem('pastil_auth_token');
        localStorage.removeItem('pastil_user');
        setUser(null);
        setIsTrackerOpen(false);
        setTrackedOrder(null);
        try { sessionStorage.removeItem('pastil_recent_order'); } catch {}
        setIsSettingsOpen(false);
        setActiveView('storefront');
        showToast('Logged out successfully', 'info');
    };

    const handleAccountUpdated = (updated) => {
        localStorage.setItem('pastil_user', JSON.stringify(updated));
        setUser(updated);
        showToast('Account settings saved', 'success');
    };

    const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            {/* Navbar */}
            <Navbar
                activeView={activeView}
                setActiveView={setActiveView}
                cartCount={totalCartCount}
                onOpenCart={() => setIsCartOpen(true)}
                lastOrder={trackedOrder}
                onOpenTracker={() => setIsTrackerOpen(true)}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onLogout={handleLogout}
                lowStockCount={lowStockCount}
            />

            {/* Main Content Area */}
            <main className="flex-1">
                {activeView !== 'admin' ? (
                    <Storefront
                        page={activeView === 'menu' ? 'menu' : 'home'}
                        onNavigate={setActiveView}
                        products={activeView === 'menu' ? filteredProducts : products}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onAddToCart={handleQuickAdd}
                        onViewProduct={setDetailProduct}
                        onOpenCheckout={() => setIsCheckoutOpen(true)}
                        reviews={reviews}
                        cartCount={totalCartCount}
                    />
                ) : (
                    <Dashboard
                        user={user}
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshAll={loadData}
                        showToast={showToast}
                        lowStockCount={lowStockCount}
                        onBackToStorefront={() => setActiveView('storefront')}
                    />
                )}
            </main>

            {/* Modals & Overlays */}
            <ProductDetailModal
                product={detailProduct}
                onClose={() => setDetailProduct(null)}
                onAddToCart={handleQuickAdd}
            />

            <QuantityModal
                product={quantityProduct}
                onClose={() => setQuantityProduct(null)}
                onConfirmAdd={handleConfirmAddToCart}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQuantity={handleUpdateCartQty}
                onRemoveItem={handleRemoveCartItem}
                onProceedCheckout={() => setIsCheckoutOpen(true)}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                user={user}
                onOrderPlaced={handleOrderPlaced}
                showToast={showToast}
            />

            <OrderTrackerModal
                isOpen={isTrackerOpen && !!trackedOrder}
                onClose={() => setIsTrackerOpen(false)}
                order={trackedOrder}
                user={user}
                showToast={showToast}
                onOrderReviewSubmitted={loadData}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
                showToast={showToast}
            />

            <AccountSettingsModal
                isOpen={isSettingsOpen}
                user={user}
                onClose={() => setIsSettingsOpen(false)}
                onUpdated={handleAccountUpdated}
                onLogout={handleLogout}
            />

            {/* Toast Banner */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
                        toast.type === 'success'
                            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                            : toast.type === 'error'
                            ? 'bg-red-900 text-red-100 border-red-700'
                            : 'bg-stone-900 text-stone-100 border-stone-800'
                    }`}>
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : toast.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
