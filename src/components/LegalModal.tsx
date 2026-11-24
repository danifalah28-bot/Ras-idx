import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
}

export function LegalModal({ open, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#060a0f]/75 p-4 backdrop-blur-xs sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-[#00e08a] shrink-0" />
            <div>
              <h2 id="legal-modal-title" className="text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
                Kebijakan Privasi &amp; Syarat Penggunaan
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                RAS Terminal · Akses Terbuka Tanpa Login
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal privasi"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-sm leading-relaxed text-slate-600 dark:text-[#cbd5e1]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
              1. Kebijakan Privasi &amp; Penyimpanan Lokal
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm">
              <li>
                <strong>Tanpa Login &amp; Tanpa Pelacak Iklan:</strong> RAS Terminal beroperasi tanpa mewajibkan pendaftaran akun serta tidak menyematkan skrip pelacakan iklan pihak ketiga.
              </li>
              <li>
                <strong>Penyimpanan Lokal Perangkat:</strong> Daftar Watchlist, preferensi tema gelap/terang, dan riwayat lokal tersimpan langsung di penyimpanan browser perangkat Anda (<code className="font-mono text-xs">localStorage</code>).
              </li>
              <li>
                <strong>Alert Target Harga:</strong> Aturan alert harga disimpan pada server aplikasi agar pemantauan real-time dapat memicu notifikasi instan ke sesi browser Anda.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
              2. Syarat Penggunaan &amp; Sanggahan Edukatif
            </h3>
            <p className="mt-2 text-xs sm:text-sm">
              Seluruh kuotasi pasar, grafik candlestick, level Support &amp; Resisten (Floor Pivot klasik), indikator teknikal (MA20, EMA50, RSI14, MACD, Stochastic), estimasi aliran dana, serta ringkasan riset AI bersifat <strong>edukatif dan informatif</strong>—bukan rekomendasi atau ajakan mutlak untuk membeli maupun menjual efek tertentu di Bursa Efek Indonesia (BEI).
            </p>
            <p className="mt-2 text-xs sm:text-sm">
              Keputusan investasi dan manajemen risiko sepenuhnya menjadi tanggung jawab masing-masing pengguna.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-[#1d2833]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110"
          >
            Tutup &amp; Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
