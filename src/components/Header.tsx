import React from 'react';
import {
  Package,
  MapPin,
  FileText,
  Smartphone,
  Search,
  Database,
  Bell,
  CheckCircle2,
  BarChart3,
  LogOut,
  User,
  Shield,
  Truck,
  LogIn,
} from 'lucide-react';
import { AppUser } from '../types';

interface HeaderProps {
  activeTab: 'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database';
  setActiveTab: (tab: 'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  hasPushPermission: boolean;
  onRequestPushPermission: () => void;
  isDbConnected: boolean;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  hasPushPermission,
  onRequestPushPermission,
  isDbConnected,
  currentUser,
  onLogout,
  onOpenLogin,
}) => {
  const isKurir = currentUser?.level === 'kurir';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 h-16">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab(isKurir ? 'courier' : 'map')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                KirimKilat
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                · Percetakan & Logistik
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, Role-based) */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          {!isKurir && (
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta Live</span>
            </button>
          )}

          {!isKurir && (
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'invoices'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Data Invoice</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('courier')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'courier'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Portal Kurir</span>
            {isKurir && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Tugas Anda
              </span>
            )}
          </button>

          {isKurir && (
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Rute Peta</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tracking'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Lacak Resi</span>
          </button>

          {!isKurir && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analitik Kurir</span>
            </button>
          )}

          {!isKurir && (
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'database'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Status Sistem</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isDbConnected ? 'Online' : 'Lokal'}
              </span>
            </button>
          )}
        </nav>

        {/* Zone 3: User Authentication & Push Alerts */}
        <div className="flex items-center gap-3 shrink-0">
          {!hasPushPermission ? (
            <button
              onClick={onRequestPushPermission}
              title="Aktifkan Notifikasi Push Browser"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Notifikasi Push</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Push Aktif</span>
            </div>
          )}

          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Pemberitahuan Status"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Account / Role Profile Chip */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                {currentUser.foto ? (
                  <img
                    src={currentUser.foto}
                    alt={currentUser.nama}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-indigo-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.level === 'admin' ? <Shield className="w-4 h-4 text-indigo-400" /> : <Truck className="w-4 h-4 text-emerald-400" />}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-xs text-slate-900 truncate max-w-[120px]">
                    {currentUser.nama}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className={`font-mono font-bold uppercase px-1 rounded ${
                        currentUser.level === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.level}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Akun</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab(isKurir ? 'courier' : 'map')}
          className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === (isKurir ? 'courier' : 'map') ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
          }`}
        >
          {isKurir ? 'Portal Kurir' : 'Peta Live'}
        </button>

        {!isKurir && (
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'invoices' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
            }`}
          >
            Invoice
          </button>
        )}

        {!isKurir && (
          <button
            onClick={() => setActiveTab('courier')}
            className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'courier' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
            }`}
          >
            Kurir
          </button>
        )}

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'tracking' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
          }`}
        >
          Lacak Resi
        </button>

        {!isKurir && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
            }`}
          >
            Analitik
          </button>
        )}

        {!isKurir && (
          <button
            onClick={() => setActiveTab('database')}
            className={`px-2 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'database' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
            }`}
          >
            MySQL
          </button>
        )}
      </div>
    </header>
  );
};
