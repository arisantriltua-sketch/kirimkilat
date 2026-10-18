import React from 'react';
import { PushNotificationPayload } from '../types';
import { Bell, CheckCircle2, Truck, Package, AlertTriangle, X, Volume2, Sparkles } from 'lucide-react';

interface PushNotificationManagerProps {
  notifications: PushNotificationPayload[];
  activeToast: PushNotificationPayload | null;
  onDismissToast: () => void;
  isOpenDrawer: boolean;
  onCloseDrawer: () => void;
  onSendTestPush: () => void;
  hasPushPermission: boolean;
  onRequestPermission: () => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  notifications,
  activeToast,
  onDismissToast,
  isOpenDrawer,
  onCloseDrawer,
  onSendTestPush,
  hasPushPermission,
  onRequestPermission,
}) => {
  const getIconForType = (type: PushNotificationPayload['type']) => {
    switch (type) {
      case 'diambil':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'approaching':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <>
      {/* Floating Real-time Push Toast (Top Center / Top Right) */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-800 shrink-0">
              {getIconForType(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Notifikasi Pengiriman Langsung
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Baru Saja</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeToast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeToast.body}</p>
              {activeToast.id_sub_invoice && (
                <div className="mt-2 text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50 inline-block">
                  No. Resi: {activeToast.id_sub_invoice}
                </div>
              )}
            </div>
            <button
              onClick={onDismissToast}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Riwayat Notifikasi Push</h3>
                  <p className="text-[11px] text-slate-500">Pembaruan status pengiriman real-time</p>
                </div>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permission & Testing Box */}
            <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-950">Status Web Push Browser:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    hasPushPermission
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {hasPushPermission ? 'Diizinkan (Aktif)' : 'Belum Diizinkan'}
                </span>
              </div>
              {!hasPushPermission && (
                <button
                  onClick={onRequestPermission}
                  className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Beri Izin Notifikasi Browser
                </button>
              )}
              <button
                onClick={onSendTestPush}
                className="w-full py-1.5 px-3 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Kirim Uji Coba Push Notification & Audio</span>
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Belum ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.body}</p>
                        {notif.id_sub_invoice && (
                          <div className="mt-2 text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block">
                            Resi: {notif.id_sub_invoice}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
              Notifikasi tersinkronisasi via Server-Sent Events (SSE)
            </div>
          </div>
        </div>
      )}
    </>
  );
};
