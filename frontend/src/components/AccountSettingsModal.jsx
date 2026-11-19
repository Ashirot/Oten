import React, { useEffect, useState } from 'react';
import { X, LockKeyhole, Save, LogOut, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import { avatarIcons } from './Navbar';

const choices = [
    ['user', 'Default'], ['chef', 'Chef'], ['coffee', 'Coffee'],
    ['heart', 'Heart'], ['star', 'Star'], ['sun', 'Sun'],
];

export default function AccountSettingsModal({ isOpen, user, onClose, onUpdated, onLogout }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', avatar: 'user' });
    const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !isOpen) return;
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || 'user',
        });
        setPasswords({ current_password: '', password: '', password_confirmation: '' });
        setError('');
        setMessage('');
    }, [user?.id, isOpen]);

    if (!isOpen || !user) return null;

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            const result = await authApi.updateProfile(form);
            onUpdated(result.user);
            setMessage('Account details and avatar updated.');
        } catch (err) {
            setError(err.message || 'Could not save account details.');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async (event) => {
        event.preventDefault();
        if (passwords.password !== passwords.password_confirmation) {
            setError('The new passwords do not match.');
            return;
        }
        setChangingPassword(true);
        setError('');
        setMessage('');
        try {
            await authApi.changePassword(passwords);
            setPasswords({ current_password: '', password: '', password_confirmation: '' });
            setMessage('Password changed. Your other devices have been signed out.');
        } catch (err) {
            setError(err.message || 'Could not change password.');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto px-4 py-8">
            <div role="dialog" aria-modal="true" aria-label="Account settings" className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">My Account</div>
                        <h2 className="text-2xl font-black">Account Settings</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close account settings"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                    {error && <div role="alert" className="px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}
                    {message && <div role="status" className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">{message}</div>}
                    <form onSubmit={saveProfile} className="space-y-4">
                        <h3 className="font-extrabold text-stone-900">Profile details</h3>
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">Choose your account icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {choices.map(([value, label]) => {
                                    const Icon = avatarIcons[value];
                                    return (
                                        <button key={value} type="button" title={label} aria-label={label} aria-pressed={form.avatar === value} onClick={() => setForm((old) => ({ ...old, avatar: value }))}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors ${form.avatar === value ? 'bg-amber-50 border-amber-600 text-amber-700 ring-2 ring-amber-100' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                            <Icon className="w-6 h-6" /><span className="text-[10px] font-bold">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel'], ['address', 'Address', 'text']].map(([key, label, type]) => (
                                <label key={key} className="block text-xs font-bold text-stone-700">
                                    {label}
                                    <input type={type} required={key === 'name' || key === 'email'} value={form[key]} onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))}
                                        className="mt-1 w-full rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                                </label>
                            ))}
                        </div>
                        <button disabled={saving} type="submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm disabled:opacity-60 w-full">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save profile changes'}
                        </button>
                    </form>

                    <form onSubmit={changePassword} className="space-y-3 pt-5 border-t border-stone-200">
                        <h3 className="font-extrabold text-stone-900 flex items-center gap-2"><LockKeyhole className="w-5 h-5 text-amber-600" /> Change password</h3>
                        {[
                            ['current_password', 'Current password'], ['password', 'New password (8+ characters)'], ['password_confirmation', 'Confirm new password'],
                        ].map(([key, label]) => (
                            <label key={key} className="block text-xs font-bold text-stone-700">
                                {label}
                                <input type="password" required minLength={key === 'current_password' ? undefined : 8} autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
                                    value={passwords[key]} onChange={(e) => setPasswords((old) => ({ ...old, [key]: e.target.value }))}
                                    className="mt-1 w-full rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                            </label>
                        ))}
                        <button type="submit" disabled={changingPassword} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold disabled:opacity-60">
                            <ShieldCheck className="w-4 h-4" /> {changingPassword ? 'Updating...' : 'Update password'}
                        </button>
                    </form>
                    <button type="button" onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-700 hover:bg-red-50 rounded-xl py-2 text-sm font-bold">
                        <LogOut className="w-4 h-4" /> Sign out of this account
                    </button>
                </div>
            </div>
        </div>
    );
}
