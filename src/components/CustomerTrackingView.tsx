import React, { useState } from 'react';
import { Invoice } from '../types';
import { Search, CheckCircle2, Clock, Truck, MapPin, Package, Phone, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

interface CustomerTrackingViewProps {
  invoices: Invoice[];
  onSelectTrackInvoice: (invoice: Invoice) => void;
  onOpenMap: () => void;
}

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  invoices,
  onSelectTrackInvoice,
  onOpenMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('SUB-INV-0089-A');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    invoices.find((i) => i.id_sub_invoice === 'SUB-INV-0089-A') || invoices[0] || null
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = invoices.find(
      (inv) =>
        inv.id_sub_invoice.toLowerCase() === query ||
        inv.no_invoice.toLowerCase() === query ||
        inv.no_telepon.includes(query)
    );
    if (found) {
      setSelectedInvoice(found);
      onSelectTrackInvoice(found);
    } else {
      alert('Nomor Invoice atau ID Sub Invoice tidak ditemukan. Silakan cek kembali nomor resi cetakan Anda.');
    }
  };

  const getStepActiveState = (stepNumber: number) => {
    if (!selectedInvoice) return false;
    const statusKirim =
      selectedInvoice.status_kirim ||
      (selectedInvoice.status_pengiriman === 'terkirim' ? 'diterima' : selectedInvoice.diambil === 1 ? 'dikirim' : 'belum');

    switch (stepNumber) {
      case 1:
        return true; // Always printed
      case 2:
        return selectedInvoice.diambil === 1; // Diambil kurir
      case 3:
        return statusKirim === 'dikirim' || statusKirim === 'diterima';
      case 4:
        return (
          selectedInvoice.status_pengiriman === 'mendekati_lokasi' ||
          statusKirim === 'diterima'
        );
      case 5:
        return statusKirim === 'diterima';
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Portal Pelacakan Pengiriman Percetakan
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            Lacak Posisi Kurir & Paket Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Gunakan <b>Nomor Resi Pengiriman</b> atau <b>Nomor Invoice</b> pesanan Anda untuk memantau pergerakan kurir di peta dan status penjemputan barang.
          </p>

          <form onSubmit={handleSearch} className="mt-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Contoh: B001692 atau INV/2026/04/PRN-0089"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white/20"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              Lacak Paket
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            <span>Contoh Resi Cepat:</span>
            {invoices.slice(0, 3).map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  setSearchQuery(inv.id_sub_invoice);
                  setSelectedInvoice(inv);
                  onSelectTrackInvoice(inv);
                }}
                className="font-mono bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded text-white transition-colors"
              >
                {inv.id_sub_invoice}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedInvoice ? (
        <div className="space-y-6">
          {/* Status Live Tracker Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Nomor Resi Pengiriman</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-xl font-bold font-mono text-indigo-700">{selectedInvoice.id_sub_invoice}</h2>
                  <span className="text-xs text-slate-500">({selectedInvoice.no_invoice})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenMap}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Lihat Kurir di Peta Live</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {/* Step 1 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(1)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Selesai Cetak</h4>
                    <p className="text-[11px] text-slate-500">Workshop Percetakan</p>
                  </div>
                </div>

                {/* Step 2: Kolom diambil */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(2)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Diambil Kurir</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedInvoice.diambil === 1 ? 'Sudah Diambil' : 'Menunggu Penjemputan'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(3)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Dalam Perjalanan</h4>
                    <p className="text-[11px] text-slate-500">Menuju Alamat Anda</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(4)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Mendekati Tujuan</h4>
                    <p className="text-[11px] text-slate-500">Radius ~500 Meter</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex md:flex-col items-center gap-3 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepActiveState(5)
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    5
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Paket Diterima</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedInvoice.nama_penerima || 'Serah Terima'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier Info & Live ETA Box */}
            {selectedInvoice.kurir && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedInvoice.kurir.foto}
                    alt={selectedInvoice.kurir.nama}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{selectedInvoice.kurir.nama}</h4>
                    <p className="text-xs text-slate-500">
                      Kurir Pengantar · Plat: <span className="font-mono font-medium text-slate-800">{selectedInvoice.kurir.plat_nomor}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/62${selectedInvoice.kurir.no_hp.replace(/[^0-9]/g, '').substring(1)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi Kurir via WA</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Items & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Barang Cetakan */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Rincian Barang Pesanan</span>
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {selectedInvoice.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.nama_barang}</span>
                      <span className="text-slate-500 text-[11px] block">{item.spesifikasi}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded">
                      {item.qty} {item.satuan}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Pembayaran */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Status & Riwayat Pembayaran</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Tagihan:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rp {selectedInvoice.total_tagihan.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {selectedInvoice.status_pembayaran}
                  </span>
                </div>
                {selectedInvoice.sisa_tagihan > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                    <span className="font-bold block">Tagihan COD: Rp {selectedInvoice.sisa_tagihan.toLocaleString('id-ID')}</span>
                    <span className="text-[11px] text-amber-700 mt-0.5 block">
                      Silakan siapkan uang pas saat kurir tiba di alamat Anda.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
