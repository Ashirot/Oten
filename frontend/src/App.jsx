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
import { productsApi, categoriesApi, suppliersApi, reviewsApi, inventoryApi } from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
    const [activeView, setActiveView] = useState('storefront'); // 'storefront' or 'admin'
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
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    // Initial data fetch
    const loadData = async () => {
        try {
            const [prods, cats, sups, revs, lowAlerts] = await Promise.all([
                productsApi.getAll(),
                categoriesApi.getAll(),
                suppliersApi.getAll(),
                reviewsApi.getAll(),
                inventoryApi.getLowStock().catch(() => []),
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
        setTrackedOrder(newOrder);
        loadData(); // refresh stock numbers
    };

    const handleLogout = () => {
        localStorage.removeItem('pastil_auth_token');
        localStorage.removeItem('pastil_user');
        setUser(null);
        showToast('Logged out successfully', 'info');
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
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                lowStockCount={lowStockCount}
            />

            {/* Main Content Area */}
            <main className="flex-1">
                {activeView === 'storefront' ? (
                    <Storefront
                        products={filteredProducts}
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
                        products={products}
                        categories={categories}
                        suppliers={suppliers}
                        onRefreshAll={loadData}
                        showToast={showToast}
                        lowStockCount={lowStockCount}
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
                isOpen={!!trackedOrder}
                onClose={() => setTrackedOrder(null)}
                order={trackedOrder}
                user={user}
                showToast={showToast}
                onOrderReviewSubmitted={loadData}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={(u) => setUser(u)}
                showToast={showToast}
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
