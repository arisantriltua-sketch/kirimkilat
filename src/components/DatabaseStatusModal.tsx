import React, { useState } from 'react';
import { DatabaseStatus } from '../types';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  FileText,
  CreditCard,
  Truck,
  ShieldCheck,
  X,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  dbStatus: DatabaseStatus | null;
  onClose: () => void;
  onReconnect: (config: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  }) => void;
  isReconnecting: boolean;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  dbStatus,
  onClose,
  onReconnect,
  isReconnecting,
}) => {
  const [hostInput, setHostInput] = useState(dbStatus?.host || 'posapp.hostr.my.id');
  const [portInput, setPortInput] = useState(dbStatus?.port?.toString() || '3306');
  const [databaseInput, setDatabaseInput] = useState(dbStatus?.database || '');
  const [userInput, setUserInput] = useState(dbStatus?.user || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showConfigForm, setShowConfigForm] = useState(false);

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    onReconnect({
      host: hostInput,
      port: parseInt(portInput),
      database: databaseInput,
      user: userInput,
      password: passwordInput,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Status Integrasi Server Operasional
              </h2>
              <p className="text-xs text-slate-500">
                Sinkronisasi sistem manajemen pesanan, kasir percetakan, dan pengantaran kurir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            dbStatus?.connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          {dbStatus?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">
              {dbStatus?.connected
                ? 'Server Database Terhubung & Berjalan Normal'
                : 'Server Database Menggunakan Mode Cadangan'}
            </div>
            <p className="text-slate-700 leading-relaxed">
              Koneksi terhubung langsung dengan server operasional di{' '}
              <span className="font-semibold text-slate-900">{dbStatus?.host || 'posapp.hostr.my.id'}</span>.
              Seluruh transaksi pemesanan, data pelanggan, detail barang cetakan, dan armada kurir
              tersinkronisasi secara otomatis tanpa jeda.
            </p>
          </div>
        </div>

        {/* System Integration Highlights */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Layanan Sistem Terintegrasi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <FileText className="w-4 h-4" />
                <span>Pesanan & Pelanggan</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Sinkronisasi data invoice, nomor resi pengiriman, alamat penerima, dan kontak pemesan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Kasir & Keuangan</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Pencatatan status lunas, penagihan uang tunai (COD kurir), dan riwayat setoran kasir.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Truck className="w-4 h-4" />
                <span>Armada & Logistik Kurir</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Alokasi penugasan kurir, pemindaian manifest paket cetak, serta koordinat pelacakan rute.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Keamanan & Hak Akses</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Otentikasi aman untuk akun staf administrator dan akun kurir lapangan.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Configuration Form */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Host: <b className="text-slate-700 font-mono">{dbStatus?.host}</b> · Port: <b className="text-slate-700 font-mono">{dbStatus?.port}</b>
            </span>
            <button
              type="button"
              onClick={() => setShowConfigForm(!showConfigForm)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showConfigForm ? 'Sembunyikan Pengaturan Server' : 'Ubah Pengaturan Koneksi Server'}
            </button>
          </div>

          {showConfigForm && (
            <form onSubmit={handleTestConnection} className="mt-4 space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Host Server:</label>
                  <input
                    type="text"
                    value={hostInput}
                    onChange={(e) => setHostInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Port:</label>
                  <input
                    type="text"
                    value={portInput}
                    onChange={(e) => setPortInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nama Basis Data:</label>
                  <input
                    type="text"
                    value={databaseInput}
                    onChange={(e) => setDatabaseInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Username Pengguna:</label>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isReconnecting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
                  <span>{isReconnecting ? 'Menguji Koneksi...' : 'Uji & Simpan Koneksi'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
