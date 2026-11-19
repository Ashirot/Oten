import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, Eye, Search, Filter, ArrowRight, ShieldCheck, Clock, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Storefront({
    page = 'home',
    onNavigate,
    products = [],
    categories = [],
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    onAddToCart,
    onViewProduct,
    onOpenCheckout,
    reviews = [],
    cartCount = 0,
}) {
    // Hero slideshow state
    const [showcaseIndex, setShowcaseIndex] = useState(0);
    const heroShowcaseItems = products.slice(0, 4);

    useEffect(() => {
        if (heroShowcaseItems.length === 0) return;
        const interval = setInterval(() => {
            setShowcaseIndex((prev) => (prev + 1) % heroShowcaseItems.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [heroShowcaseItems.length]);

    const activeHeroItem = heroShowcaseItems[showcaseIndex] || products[0];

    return (
        <div className={`space-y-16 pb-20 ${page === 'menu' ? 'pt-12' : ''}`}>
            {page === 'home' && (
                <>
            {/* 1. Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pt-10 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Copy */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                                Freshly Cooked Daily in Davao City
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
                                Pastil rice that feels like home in{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                                    Davao City.
                                </span>
                            </h1>
                            <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
                                Crispy, savory, and generously packed native kagikit on steaming fragrant rice.
                                Order your favorite Davao pastil in just a few taps, with freshly made meals and hassle-free delivery.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => onNavigate('menu')}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
                                >
                                    <span>Order Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <a
                                    href="#about"
                                    className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-base border border-stone-200 shadow-xs transition-colors"
                                >
                                    Our Davao Story
                                </a>
                            </div>

                            {/* Trust Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200/80">
                                <div>
                                    <div className="text-2xl font-extrabold text-stone-900">{products.length}+</div>
                                    <div className="text-xs font-medium text-stone-500">Pastil Menu Picks</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-stone-900">Davao</div>
                                    <div className="text-xs font-medium text-stone-500">Local Delivery</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-extrabold text-amber-600 flex items-center gap-1">
                                        4.9 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    </div>
                                    <div className="text-xs font-medium text-stone-500">Customer Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Showcase Card */}
                        <div className="lg:col-span-5">
                            {activeHeroItem && (
                                <div className="relative mx-auto max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-100 transition-all">
                                    <div className="relative h-72 rounded-2xl overflow-hidden bg-stone-100 mb-4">
                                        <img
                                            src={activeHeroItem.image_url}
                                            alt={activeHeroItem.name}
                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-amber-900 shadow-xs uppercase tracking-wider">
                                            {activeHeroItem.category?.name || 'Best Seller'}
                                        </div>
                                        <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            {Number(activeHeroItem.rating).toFixed(1)}
                                        </div>

                                        {/* Prev / Next controls */}
                                        {heroShowcaseItems.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setShowcaseIndex((prev) => (prev - 1 + heroShowcaseItems.length) % heroShowcaseItems.length)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition-all"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setShowcaseIndex((prev) => (prev + 1) % heroShowcaseItems.length)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-stone-900">{activeHeroItem.name}</h3>
                                            <span className="text-2xl font-black text-amber-600">
                                                ₱{Number(activeHeroItem.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-600 line-clamp-2">
                                            {activeHeroItem.description}
                                        </p>

                                        <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                In Stock: {activeHeroItem.stock_quantity} units
                                            </span>
                                            <button
                                                onClick={() => onAddToCart(activeHeroItem)}
                                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                Quick Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Promo Strip */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-extrabold text-base">Free Delivery</div>
                            <div className="text-xs text-amber-100">Free delivery + ₱50 off orders ₱500 and above</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-extrabold text-base">Cash on Delivery & GCash</div>
                            <div className="text-xs text-amber-100">Convenient, secure payment upon meal arrival</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <ThumbsUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-extrabold text-base">Barkada & Party Platters</div>
                            <div className="text-xs text-amber-100">Catering packs designed for office & celebrations</div>
                        </div>
                    </div>
                </div>
            </section>

                </>
            )}

            {page === 'menu' && (
                <>
            {/* 3. Menu Section */}
            <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Popular Davao Picks
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                        Choose your favorite pastil
                    </h2>
                    <p className="text-sm text-stone-600">
                        Prepared with authentic regional herbs, roasted aromatics, and rich savory kagikit.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                            }`}
                        >
                            All Flavors
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedCategory === cat.slug
                                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search pastil..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isOutOfStock = product.stock_quantity <= 0;
                        const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.reorder_level;

                        return (
                            <div
                                key={product.id}
                                className="group bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden bg-stone-100">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Category Pill */}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold text-stone-800 shadow-2xs">
                                        {product.category?.name}
                                    </div>

                                    {/* Stock Badge */}
                                    <div className="absolute top-3 right-3">
                                        {isOutOfStock ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                                                Sold Out
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                                                Low Stock: {product.stock_quantity}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                                {product.stock_quantity} Left
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Preview Button */}
                                    <button
                                        onClick={() => onViewProduct(product)}
                                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-stone-900 group-hover:text-amber-600 transition-colors text-base line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                {Number(product.rating).toFixed(1)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Price</div>
                                            <div className="text-xl font-extrabold text-stone-900">
                                                ₱{Number(product.price).toFixed(2)}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => onAddToCart(product)}
                                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                                isOutOfStock
                                                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 active:scale-95'
                                            }`}
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Floating proceed to checkout bar if cart has items */}
                {cartCount > 0 && (
                    <div className="sticky bottom-6 mt-10 z-30 flex justify-center">
                        <button
                            type="button"
                            onClick={onOpenCheckout}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-2xl transition-all hover:scale-105 border border-stone-700"
                        >
                            <ShoppingBag className="w-5 h-5 text-amber-400" />
                            <span>Proceed to Checkout ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                        </button>
                    </div>
                )}
            </section>
                </>
            )}

            {page === 'home' && (
                <>
            {/* 4. Why Choose Us Section */}
            <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-lg h-80">
                        <img
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                            alt="Davao Kitchen"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="lg:col-span-7 space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                            Why Pastil Rice Davao
                        </span>
                        <h2 className="text-3xl font-black text-stone-900">
                            Made with authentic Davao flavor, heart, and care.
                        </h2>
                        <p className="text-sm text-stone-600 leading-relaxed">
                            Pastil is a cherished Mindanao comfort food made of shredded savory beef, chicken, or tuna flakes 
                            sautéed with aromatic herbs and wrapped in fresh banana leaves with piping hot rice. 
                            Our system connects real-time inventory management with customer ordering so every meal is served fresh.
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="text-xs font-bold text-stone-900">🌿 Freshly Cooked Daily</div>
                                <div className="text-[11px] text-stone-500">Prepared fresh every single morning</div>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="text-xs font-bold text-stone-900">🌶️ Authentic Spices</div>
                                <div className="text-[11px] text-stone-500">Traditional toasted palapa aromatics</div>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="text-xs font-bold text-stone-900">🛵 Fast Davao Dispatch</div>
                                <div className="text-[11px] text-stone-500">Hot meals delivered right on time</div>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                <div className="text-xs font-bold text-stone-900">📊 Database Backed</div>
                                <div className="text-[11px] text-stone-500">Transactions & triggers prevent stock errors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Customer Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                        Customer Feedback
                    </span>
                    <h2 className="text-3xl font-black text-stone-900">
                        What Davao food lovers say
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.slice(0, 3).map((rev, idx) => (
                        <div
                            key={rev.id || idx}
                            className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex gap-1">
                                    {[...Array(rev.rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-stone-600 italic leading-relaxed">
                                    "{rev.comment}"
                                </p>
                            </div>
                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                                <span className="font-bold text-xs text-stone-900">
                                    {rev.user?.name || 'Verified Customer'}
                                </span>
                                <span className="text-[10px] text-stone-400">Davao City</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Footer */}
            <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 mt-20 border-t border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xl">
                                P
                            </div>
                            <span className="font-black text-xl text-white">Pastil Rice Davao</span>
                        </div>
                        <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                            Serving authentic, freshly cooked pastil meals across Davao City with warm hospitality.
                            Developed for Database Systems 1 Final Project demonstration using Laravel, ReactJS, Tailwind CSS, and MySQL 8.0.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-bold text-white uppercase tracking-wider">Contact & Location</div>
                        <ul className="text-xs text-stone-400 space-y-1.5">
                            <li>📍 Davao City, Philippines</li>
                            <li>📞 +63 912 345 6789</li>
                            <li>✉️ hello@pastildavao.ph</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-bold text-white uppercase tracking-wider">Business Hours</div>
                        <ul className="text-xs text-stone-400 space-y-1.5">
                            <li>Mon - Sat: 8:00 AM - 9:00 PM</li>
                            <li>Sun: 9:00 AM - 7:00 PM</li>
                            <li>Fast delivery across Davao</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>© 2026 Pastil Rice Davao. Database Systems 1 Final Project.</div>
                    <div className="font-medium">Laravel 13 • ReactJS • Tailwind CSS • MySQL 8.0</div>
                </div>
            </footer>
                </>
            )}
        </div>
    );
}
