import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Barcode, CheckCircle2, AlertCircle, Scan, ArrowRight } from 'lucide-react';
import { Invoice } from '../types';
import { playNotificationSound } from '../utils/audio';

interface CourierScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (id_sub_invoice: string) => Promise<boolean>;
  unscannedInvoices: Invoice[];
  courierName: string;
}

export const CourierScannerModal: React.FC<CourierScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  unscannedInvoices,
  courierName,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // stop camera if modal is closed
      if (scannerRef.current && isScanningCamera) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
        setIsScanningCamera(false);
      }
      setScanMessage(null);
    }
  }, [isOpen, isScanningCamera]);

  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;
      setIsScanningCamera(true);
      setScanMessage(null);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 180 },
        },
        async (decodedText) => {
          // Barcode or QR code scanned
          playNotificationSound('beep');
          await handleProcessScan(decodedText);
          // Briefly pause then stop
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
            setIsScanningCamera(false);
          }
        },
        () => {
          // frame not detected - ignore
        }
      );
    } catch (err) {
      console.warn('Camera scan could not start:', err);
      setIsScanningCamera(false);
      setScanMessage({
        text: 'Kamera tidak dapat diakses atau diblokir. Silakan gunakan scan simulasi / input kode.',
        type: 'error',
      });
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
      setIsScanningCamera(false);
    }
  };

  const handleProcessScan = async (code: string) => {
    if (!code.trim()) return;
    setIsProcessing(true);
    playNotificationSound('beep');

    const clean = code.trim().toUpperCase();
    const success = await onScanSuccess(clean);

    if (success) {
      setScanMessage({
        text: `Sukses! Paket "${clean}" terverifikasi dan masuk manifes pengantaran.`,
        type: 'success',
      });
      setManualCode('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setScanMessage({
        text: `Paket dengan kode "${clean}" tidak cocok dengan daftar penjemputan percetakan!`,
        type: 'error',
      });
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scan Paket Berdasarkan ID Sub-Invoice</h3>
              <p className="text-xs text-slate-500">Kurir: <span className="font-semibold text-slate-800">{courierName}</span></p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Status Message Feedback */}
          {scanMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{scanMessage.text}</span>
            </div>
          )}

          {/* Camera Scanner Viewfinder Box */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-4 border border-slate-800 shadow-inner">
            <div id="qr-reader-container" className="w-full max-w-[280px]" />

            {!isScanningCamera && (
              <div className="text-center space-y-3 z-10">
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">
                  <Barcode className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Pemindai Barcode / QR Kamera</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Arahkan kamera ke label cetakan untuk membaca barcode nomor resi paket
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>Aktifkan Kamera Pemindai</span>
                </button>
              </div>
            )}

            {isScanningCamera && (
              <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-300 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Kamera Aktif · Posisikan barcode di kotak</span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium underline"
                >
                  Matikan Kamera
                </button>
              </div>
            )}
          </div>

          {/* Manual Input or Quick Barcode Gun Simulation */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Atau Ketik / Gunakan Barcode Scanner Gun:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Contoh: SUB-INV-0089-A"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleProcessScan(manualCode);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || isProcessing}
                onClick={() => handleProcessScan(manualCode)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Verifikasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Click Simulators for Ready-to-Deliver Packages */}
          {unscannedInvoices.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Paket Percetakan Belum Di-Scan ({unscannedInvoices.length}):
                </span>
                <span className="text-[10px] text-indigo-600">Klik untuk Scan Cepat</span>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                {unscannedInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => handleProcessScan(inv.id_sub_invoice)}
                    className="p-2.5 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 group-hover:text-indigo-900">
                          {inv.id_sub_invoice}
                        </span>
                        <span className="text-[10px] text-slate-500">({inv.no_invoice})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 truncate max-w-[260px]">
                        Tujuan: <span className="font-medium text-slate-900">{inv.nama_pelanggan}</span> ({inv.alamat_tujuan})
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-white group-hover:bg-indigo-600 group-hover:text-white px-2 py-1 rounded border border-indigo-200 transition-colors shrink-0">
                      Scan Ini
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Setiap scan berhasil otomatis mengubah kolom <b className="font-mono">diambil = 1</b></span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
