import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeafletMap } from './components/LeafletMap';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { CourierPortal } from './components/CourierPortal';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { PushNotificationManager } from './components/PushNotificationManager';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { CourierAnalyticsDashboard } from './components/CourierAnalyticsDashboard';
import { LoginForm } from './components/LoginForm';
import { AppUser, Courier, Invoice, PushNotificationPayload, DatabaseStatus } from './types';
import { playNotificationSound } from './utils/audio';
import { Truck, Package, Clock, ShieldCheck, Database, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>({
    id: 1,
    username: 'admin',
    nama: 'Administrator Percetakan',
    level: 'admin',
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'invoices' | 'courier' | 'tracking' | 'analytics' | 'database'>('map');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeToast, setActiveToast] = useState<PushNotificationPayload | null>(null);
  const [notifications, setNotifications] = useState<PushNotificationPayload[]>([]);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const [isReconnectingDb, setIsReconnectingDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check Web Push Notification API support & initial permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPushPermission(window.Notification.permission === 'granted');
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
          setHasPushPermission(true);
          playNotificationSound('success');
          triggerNotification({
            id: `perm-${Date.now()}`,
            title: 'Notifikasi Web Push Aktif!',
            body: 'Anda akan menerima pembaruan langsung setiap kali paket diambil atau tiba di lokasi.',
            timestamp: new Date().toISOString(),
            type: 'info',
          });
        }
      } catch (e) {
        console.error('Error requesting push permission:', e);
      }
    }
  };

  // Helper to trigger audio and native Web Push Notification
  const triggerNotification = useCallback((notif: PushNotificationPayload) => {
    setActiveToast(notif);
    playNotificationSound(notif.type === 'delivered' ? 'success' : 'ding');

    // Trigger Native Browser Web Notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(notif.title, {
          body: notif.body,
          icon: '/src/assets/images/courier_rider_avatar_1792303374167.jpg',
        });
      } catch {
        // Notification failed or blocked in iframe
      }
    }

    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [invRes, courRes, dbRes, notifRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/couriers'),
        fetch('/api/db/status'),
        fetch('/api/notifications'),
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData);
      }

      if (courRes.ok) {
        const courData = await courRes.json();
        setCouriers(courData);
      }

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect to Real-Time SSE Stream for Courier GPS & Status updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('courier_update', (e) => {
      try {
        const updatedCourier: Courier = JSON.parse(e.data);
        setCouriers((prev) =>
          prev.map((c) => (c.id === updatedCourier.id ? { ...c, ...updatedCourier } : c))
        );
      } catch (err) {
        console.error('SSE courier update parse error:', err);
      }
    });

    eventSource.addEventListener('invoice_update', (e) => {
      try {
        const updatedInvoice: Invoice = JSON.parse(e.data);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === updatedInvoice.id ? { ...inv, ...updatedInvoice } : inv))
        );
        setSelectedInvoice((prev) => (prev?.id === updatedInvoice.id ? { ...prev, ...updatedInvoice } : prev));
      } catch (err) {
        console.error('SSE invoice update parse error:', err);
      }
    });

    eventSource.addEventListener('push_notification', (e) => {
      try {
        const notif: PushNotificationPayload = JSON.parse(e.data);
        triggerNotification(notif);
      } catch (err) {
        console.error('SSE push notification parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [triggerNotification]);

  // Auto-dismiss floating toast after 7 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Handlers
  const handleToggleDiambil = async (invoiceId: number, currentDiambil: number) => {
    const nextDiambil = currentDiambil === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/diambil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diambil: nextDiambil }),
      });
      if (res.ok) {
        const result = await res.json();
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...result.invoice } : inv))
        );
      }
    } catch (e) {
      console.error('Error toggling diambil status:', e);
    }
  };

  const handleUpdateStatus = async (
    invoiceId: number,
    status: Invoice['status_pengiriman'],
    meta?: { catatan_kurir?: string; nama_penerima?: string }
  ) => {
    try {
      const isDelivered = status === 'terkirim';
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          status_kirim: isDelivered ? 'diterima' : 'dikirim',
          ...meta,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  ...result.invoice,
                  status_pengiriman: status,
                  status_kirim: isDelivered ? 'diterima' : inv.status_kirim,
                  nama_penerima: meta?.nama_penerima || result.invoice?.nama_penerima || inv.nama_penerima,
                }
              : inv
          )
        );
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleAdvanceStep = async (courierId: number) => {
    try {
      await fetch(`/api/couriers/${courierId}/step`, { method: 'POST' });
    } catch (e) {
      console.error('Error advancing courier step:', e);
    }
  };

  const handleResetRoute = async (courierId: number) => {
    try {
      await fetch(`/api/couriers/${courierId}/reset-route`, { method: 'POST' });
    } catch (e) {
      console.error('Error resetting courier route:', e);
    }
  };

  const handleScanSubInvoice = async (id_sub_invoice: string, courierId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/invoices/scan-sub-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_sub_invoice, id_kurir: courierId }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === data.invoice.id ? { ...inv, ...data.invoice } : inv))
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error scanning sub-invoice:', e);
      return false;
    }
  };

  const handleSendTestPush = async () => {
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Uji Coba Push Notification Real-Time',
          body: 'Notifikasi status pengiriman paket berhasil diterima dengan audio chime!',
          type: 'status_update',
        }),
      });
    } catch (e) {
      console.error('Error sending test push:', e);
    }
  };

  const handleReconnectDb = async (config: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  }) => {
    setIsReconnectingDb(true);
    try {
      const res = await fetch('/api/db/reconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const status = await fetch('/api/db/status');
        const dbJson = await status.json();
        setDbStatus(dbJson);
      }
    } catch (e) {
      console.error('Failed to reconnect database:', e);
    } finally {
      setIsReconnectingDb(false);
    }
  };

  // Find active courier and invoice for map display
  const primaryCourier = couriers[0] || null;
  const activeInvoiceForCourier =
    invoices.find((i) => i.id === primaryCourier?.id_invoice_aktif) || invoices[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'database') {
            setIsDbModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        unreadCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        hasPushPermission={hasPushPermission}
        onRequestPushPermission={requestPushPermission}
        isDbConnected={!!dbStatus?.connected}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setIsLoginModalOpen(true);
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Summary Strip (Full width row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Invoice Aktif</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="font-mono tabular-nums text-xl font-bold text-slate-900 mt-1">
              {invoices.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{invoices.filter((i) => i.diambil === 1).length} Diambil</span>
              <span className="mx-1">·</span>
              <span>{invoices.filter((i) => i.diambil === 0).length} Menunggu</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Kurir Dalam Perjalanan</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-mono tabular-nums text-xl font-bold text-slate-900 mt-1">
              {couriers.filter((c) => c.status_aktif === 'mengantar').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{couriers.length} Kurir terdaftar di sistem</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Paket Terkirim Hari Ini</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="font-mono tabular-nums text-xl font-bold text-slate-900 mt-1">
              {invoices.filter((i) => i.status_pengiriman === 'terkirim').length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              <span>Verifikasi bukti & tanda tangan</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Sistem Database POS</span>
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-sm font-bold text-slate-900">
                {dbStatus?.connected ? 'Server Terhubung (Online)' : 'Mode Intranet Lokal'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              Sinkronisasi data transaksi kasir & logistik real-time
            </div>
          </div>
        </div>

        {/* Tab 1: Live Interactive Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Pelacakan Kurir Real-Time & Rute Pengantaran
                </h1>
                <p className="text-xs text-slate-500">
                  Pergerakan GPS kurir dari Hub Pusat Percetakan ke alamat tujuan pemesan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdvanceStep(primaryCourier?.id || 1)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Posisi Kurir</span>
                </button>
              </div>
            </div>

            <LeafletMap
              courier={primaryCourier}
              activeInvoice={activeInvoiceForCourier}
              onAdvanceStep={handleAdvanceStep}
              onResetRoute={handleResetRoute}
              onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            />
          </div>
        )}

        {/* Tab 2: Invoices Data Grid */}
        {activeTab === 'invoices' && (
          <InvoiceTable
            invoices={invoices}
            onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            onToggleDiambil={handleToggleDiambil}
            onTrackOnMap={(inv) => {
              setActiveTab('map');
            }}
          />
        )}

        {/* Tab 3: Courier Operational App */}
        {activeTab === 'courier' && (
          <CourierPortal
            couriers={couriers}
            invoices={invoices}
            onToggleDiambil={handleToggleDiambil}
            onUpdateStatus={handleUpdateStatus}
            onSendCourierGps={(cId, lat, lng) => {
              // handled via advance step or coordinates
            }}
            onAdvanceStep={handleAdvanceStep}
            onScanSubInvoice={handleScanSubInvoice}
            currentUser={currentUser}
          />
        )}

        {/* Tab 4: Customer Tracking Resi */}
        {activeTab === 'tracking' && (
          <CustomerTrackingView
            invoices={invoices}
            onSelectTrackInvoice={(inv) => setSelectedInvoice(inv)}
            onOpenMap={() => setActiveTab('map')}
          />
        )}

        {/* Tab 5: Courier Performance Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <CourierAnalyticsDashboard
            couriers={couriers}
            invoices={invoices}
          />
        )}
      </main>

      {/* Floating Push Notification Toast & History Drawer */}
      <PushNotificationManager
        notifications={notifications}
        activeToast={activeToast}
        onDismissToast={() => setActiveToast(null)}
        isOpenDrawer={isNotifDrawerOpen}
        onCloseDrawer={() => setIsNotifDrawerOpen(false)}
        onSendTestPush={handleSendTestPush}
        hasPushPermission={hasPushPermission}
        onRequestPermission={requestPushPermission}
      />

      {/* Invoice Multi-Table Relations Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onToggleDiambil={handleToggleDiambil}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* MySQL Database Configuration Modal */}
      {isDbModalOpen && (
        <DatabaseStatusModal
          dbStatus={dbStatus}
          onClose={() => setIsDbModalOpen(false)}
          onReconnect={handleReconnectDb}
          isReconnecting={isReconnectingDb}
        />
      )}

      {/* Login Form Modal (Admin & Kurir level='kurir') */}
      {(isLoginModalOpen || !currentUser) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <LoginForm
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsLoginModalOpen(false);
              if (user.level === 'kurir') {
                setActiveTab('courier');
              } else {
                setActiveTab('map');
              }
            }}
            onContinueAsGuest={() => {
              setIsLoginModalOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
