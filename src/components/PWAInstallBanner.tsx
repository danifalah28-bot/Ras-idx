import React, { useState } from 'react';
import { Check, Download, Link2, Share2, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const websiteUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/` : '/';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowGuide(true);
    }
  };

  const handleShareLink = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'RAS Terminal — Saham BEI & OJK Real-Time',
          url: websiteUrl,
        });
        return;
      } catch {
        // Fallback to copy if share dialog dismissed
      }
    }
    await handleCopyLink();
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopyLink}
        title="Salin link langsung website RAS Terminal"
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-[#00e08a] shrink-0" />
        ) : (
          <Link2 className="h-3.5 w-3.5 text-slate-500 dark:text-[#8d9aa8] shrink-0" />
        )}
        <span>{copied ? 'Link Disalin' : 'Salin Link'}</span>
      </button>

      {!isInstalled && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-emerald-600/35 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 whitespace-nowrap shrink-0 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/15 dark:text-[#00e08a] dark:hover:bg-[#00e08a]/25"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>{isAndroid || isInstallable ? 'Instal App Android' : 'Instal Aplikasi'}</span>
        </button>
      )}

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#060a0f]/75 p-4 backdrop-blur-xs sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-5 w-5 text-amber-700 dark:text-[#f5a524] shrink-0" />
                <h3 id="pwa-guide-title" className="text-base font-semibold text-slate-900 dark:text-[#eaf1f7]">
                  {isIOS ? 'Instal RAS Terminal di iPhone / iPad' : 'Buka & Instal RAS Terminal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Tutup panduan instalasi"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Copy / Share Website Link */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <div className="text-xs font-medium text-slate-600 dark:text-[#cbd5e1]">Tautan Masuk Langsung</div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs text-slate-800 dark:text-[#eaf1f7]">{websiteUrl}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-700 dark:text-[#00e08a]" /> : <Link2 className="h-3 w-3" />}
                    <span>{copied ? 'Disalin' : 'Salin'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-2 text-sm text-slate-700 dark:text-[#cbd5e1]">
                <li>1. Buka tautan di atas pada <strong>Safari</strong>.</li>
                <li>2. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.</li>
                <li>3. Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
              </ol>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-[#cbd5e1]">
                <p>
                  Simpan ke layar utama Android atau desktop agar masuk ke RAS Terminal cukup 1 ketukan tanpa mengetik URL lagi.
                </p>
                <ol className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed dark:border-[#1d2833] dark:bg-[#0b1219]">
                  <li>1. Buka tautan di <strong>Google Chrome</strong> Android / Desktop.</li>
                  <li>2. Ketuk menu <strong>⋮ (Tiga Titik)</strong> di pojok kanan atas browser.</li>
                  <li>3. Pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.</li>
                </ol>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-[#00e08a]/25 dark:bg-[#00e08a]/8">
              <div className="text-xs font-semibold text-emerald-900 dark:text-[#00e08a]">
                Konversi ke File .APK Android (PWABuilder / Capacitor)
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
                Unduh paket lengkap berisi <code className="font-mono">capacitor.config.ts</code>,{' '}
                <code className="font-mono">twa-manifest.json</code>,{' '}
                <code className="font-mono">assetlinks.json</code>, ikon PNG, workflow GitHub Actions, dan panduan build APK.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <a
                  href="/android-apk-kit.zip"
                  download="ras-idx-android-apk-kit.zip"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-[#00e08a] dark:text-[#03130b]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Kit APK Android (.zip)</span>
                </a>
                <a
                  href="/manifest.webmanifest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7]"
                >
                  manifest.webmanifest
                </a>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-md md:bottom-4 dark:border-[#f5a524]/45 dark:bg-[#0e141c] dark:text-[#f5a524]">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Mode Offline — Menampilkan data cache tersimpan</span>
    </div>
  );
}
