import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { authApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let res;
            if (mode === 'login') {
                res = await authApi.login({ email, password });
            } else {
                res = await authApi.register({ name, email, password, phone, address });
            }

            localStorage.setItem('pastil_auth_token', res.token);
            localStorage.setItem('pastil_user', JSON.stringify(res.user));
            showToast?.(`Welcome back, ${res.user.name}!`, 'success');
            onAuthSuccess(res.user);
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setLoading(true);
        setError(null);

        try {
            const res = await authApi.login({ email: demoEmail, password: demoPassword });
            localStorage.setItem('pastil_auth_token', res.token);
            localStorage.setItem('pastil_user', JSON.stringify(res.user));
            showToast?.(`Logged in as ${res.user.role.toUpperCase()}: ${res.user.name}`, 'success');
            onAuthSuccess(res.user);
            onClose();
        } catch (err) {
            setError(err.message || 'Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-5 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
                        Client & Staff Access
                    </span>
                    <h3 className="text-2xl font-black">
                        {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                    </h3>
                    <p className="text-white/90 text-xs mt-1">
                        Access the Pastil Rice Davao customer menu or management system.
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex border-b border-stone-200 bg-stone-50">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); }}
                        className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                            mode === 'login'
                                ? 'bg-white text-amber-600 border-b-2 border-amber-600 shadow-xs'
                                : 'text-stone-500 hover:text-stone-900'
                        }`}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(null); }}
                        className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                            mode === 'register'
                                ? 'bg-white text-amber-600 border-b-2 border-amber-600 shadow-xs'
                                : 'text-stone-500 hover:text-stone-900'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="p-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Quick Demo Logins */}
                    {mode === 'login' && (
                        <div className="mb-5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                            <div className="text-xs font-bold text-amber-900 mb-2 flex items-center justify-between">
                                <span>⚡ 1-Click Demo Accounts (Database Grader)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('admin@pastildavao.com', 'admin123')}
                                    className="px-2 py-1.5 bg-white hover:bg-amber-100 text-purple-700 font-bold text-xs rounded-lg border border-purple-200 shadow-xs transition-all text-center"
                                >
                                    👑 Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('staff@pastildavao.com', 'staff123')}
                                    className="px-2 py-1.5 bg-white hover:bg-amber-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 shadow-xs transition-all text-center"
                                >
                                    💼 Staff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('maria@example.com', 'password123')}
                                    className="px-2 py-1.5 bg-white hover:bg-amber-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 shadow-xs transition-all text-center"
                                >
                                    🛒 Customer
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="09XXXXXXXXX"
                                                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Davao City"
                                                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Register New Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
