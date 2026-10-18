import React, { useState } from 'react';
import { AppUser } from '../types';
import { Package, Shield, User, Lock, ArrowRight, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface LoginFormProps {
  onLoginSuccess: (user: AppUser) => void;
  onContinueAsGuest?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [selectedRoleType, setSelectedRoleType] = useState<'admin' | 'kurir'>('admin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<Array<{ id: number; username: string; nama: string; level: string }>>([]);

  React.useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDbUsers(data);
      })
      .catch(() => {});
  }, []);

  const handleQuickSelect = (role: 'admin' | 'kurir', user: string, pass: string) => {
    setSelectedRoleType(role);
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playNotificationSound('success');
        onLoginSuccess(data.user);
      } else {
        playNotificationSound('alert');
        setErrorMsg(data.error || 'Login gagal. Periksa username dan password.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Geometry */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-indigo-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            KirimKilat Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Pengiriman Paket Percetakan & Pelacakan Kurir Real-Time
          </p>
        </div>

        {/* Login Card Container */}
        <div className="mt-8 bg-slate-950/80 backdrop-blur-xl py-8 px-6 sm:px-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {/* Role Mode Segmented Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pilih Jenis Akun Pengguna:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect('admin', 'admin', 'admin123')}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedRoleType === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Percetakan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('kurir', 'jaja', 'jaja')}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedRoleType === 'kurir'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Kurir Pengantaran</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Pilihan Akun Cepat:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect('admin', 'admin', 'admin123')}
                className={`p-2 rounded-lg text-left flex items-center justify-between border transition-all ${
                  username === 'admin'
                    ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-white block">Administrator (Ahmad Sayuti)</span>
                  <span className="text-[11px] text-slate-400">Username: admin · Password: admin123</span>
                </div>
                <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                  Pilih
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('kurir', 'jaja', 'jaja')}
                className={`p-2 rounded-lg text-left flex items-center justify-between border transition-all ${
                  username === 'jaja'
                    ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-white block">Kurir Lapangan (Jaja)</span>
                  <span className="text-[11px] text-slate-400">Username: jaja · Password: jaja</span>
                </div>
                <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                  Pilih
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('admin', 'admin2', 'admin123')}
                className={`p-2 rounded-lg text-left flex items-center justify-between border transition-all ${
                  username === 'admin2'
                    ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-white block">Staf Administrasi 2</span>
                  <span className="text-[11px] text-slate-400">Username: admin2 · Password: admin123</span>
                </div>
                <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                  Pilih
                </span>
              </button>
            </div>
          </div>

          {/* Public Tracking Link Option */}
          {onContinueAsGuest && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Lacak Resi Sebagai Pelanggan / Tamu Tanpa Login &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
