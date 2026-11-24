import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck, ExternalLink, Plus, Trash2 } from 'lucide-react';
import type {
  MarketNotificationItem,
  PriceAlertRule,
  StockRecord,
} from '../types/market';

interface NotificationCenterProps {
  stocks: StockRecord[];
  notifications: MarketNotificationItem[];
  alerts: PriceAlertRule[];
  onAlertsChanged: (nextAlerts: PriceAlertRule[]) => void;
  onMarkAllRead: () => void;
  onSelectStock: (ticker: string) => void;
  onNotify?: (msg: string) => void;
}

type NotifFilter = 'ALL' | MarketNotificationItem['kind'];

function formatWibTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Baru saja';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
}

export function NotificationCenter({
  stocks,
  notifications,
  alerts,
  onAlertsChanged,
  onMarkAllRead,
  onSelectStock,
  onNotify,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotifFilter>('ALL');
  const [ticker, setTicker] = useState<string>('BBCA');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('10250');
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const selectedStock = useMemo(
    () => stocks.find((s) => s.ticker === ticker) ?? stocks[0],
    [stocks, ticker]
  );

  const filteredNotifs = useMemo(() => {
    if (filter === 'ALL') return notifications;
    return notifications.filter((n) => n.kind === filter);
  }, [notifications, filter]);

  const handleRequestBrowserPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setPushStatus(perm);
    if (perm === 'granted') {
      onNotify?.('Notifikasi push browser diaktifkan.');
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const numPrice = Number(targetPrice);
    if (!Number.isFinite(numPrice) || numPrice < 50) {
      setFormError('Target harga harus berupa angka valid minimal Rp 50.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          condition,
          targetPrice: numPrice,
          note: note.trim(),
        }),
      });
      const json = (await res.json()) as { alert?: PriceAlertRule; error?: string };
      if (!res.ok || !json.alert) {
        setFormError(json.error || 'Gagal menyimpan alert harga.');
        return;
      }
      onAlertsChanged([json.alert, ...alerts]);
      setNote('');
      onNotify?.(
        `Alert harga ${ticker} (${condition === 'ABOVE' ? '≥' : '≤'} Rp ${numPrice.toLocaleString('id-ID')}) aktif.`
      );
    } catch {
      setFormError('Koneksi gagal saat menyimpan alert harga.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const target = alerts.find((a) => a.id === id);
    try {
      const res = await fetch(`/api/alerts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onAlertsChanged(alerts.filter((a) => a.id !== id));
        onNotify?.(target ? `Alert harga ${target.ticker} dihapus.` : 'Aturan alert dihapus.');
      } else {
        setFormError('Gagal menghapus aturan alert.');
      }
    } catch {
      setFormError('Koneksi terganggu saat menghapus aturan alert.');
    }
  };

  const kindLabel: Record<MarketNotificationItem['kind'], string> = {
    price_target: 'Target Harga',
    signal: 'Sinyal Teknikal',
    ojk_bei: 'OJK & BEI',
    news: 'Berita Pasar',
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Real-Time Price & News Notification Feed */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#1d2833]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span>Notifikasi Harga &amp; Berita Real-Time</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{notifications.length} item</span>
            </div>
            <h1 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-[#eaf1f7]">
              Pusat Peringatan Pasar &amp; Regulasi
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pushStatus === 'default' && (
              <button
                type="button"
                onClick={handleRequestBrowserPush}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-700/30 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 whitespace-nowrap shrink-0 dark:border-[#f5a524]/40 dark:bg-[#f5a524]/10 dark:text-[#f5a524] dark:hover:bg-[#f5a524]/20"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Aktifkan Push HP/Browser</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onMarkAllRead();
                onNotify?.('Semua notifikasi ditandai sudah dibaca.');
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Tandai Dibaca</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
          {(
            [
              { id: 'ALL', label: 'Semua' },
              { id: 'price_target', label: 'Target Harga' },
              { id: 'signal', label: 'Sinyal S/R' },
              { id: 'ojk_bei', label: 'OJK & BEI' },
              { id: 'news', label: 'Berita Global' },
            ] as { id: NotifFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[32px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1d2833]">
          {filteredNotifs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
              Belum ada notifikasi pada kategori ini. Peringatan harga dan rilis berita baru akan muncul otomatis di sini.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <article
                key={n.id}
                className={`py-3.5 first:pt-1 last:pb-1 ${n.read ? 'opacity-75' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  <span
                    className={`font-semibold ${
                      n.kind === 'price_target'
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : n.kind === 'signal'
                          ? 'text-amber-700 dark:text-[#f5a524]'
                          : n.kind === 'ojk_bei'
                            ? 'text-amber-700 dark:text-[#f5a524]'
                            : 'text-slate-700 dark:text-[#cbd5e1]'
                    }`}
                  >
                    {kindLabel[n.kind]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{formatWibTime(n.timestamp)} WIB</span>
                  {!n.read && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-amber-700 dark:text-[#f5a524]">Baru</span>
                    </>
                  )}
                </div>

                <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">{n.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">{n.message}</p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {n.ticker && (
                    <button
                      type="button"
                      onClick={() => onSelectStock(n.ticker!)}
                      className="font-mono text-xs font-semibold text-amber-700 hover:underline dark:text-[#f5a524]"
                    >
                      Buka Grafik {n.ticker} →
                    </button>
                  )}
                  {n.url && /^https?:\/\//i.test(n.url) && (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-amber-700 hover:underline dark:text-[#8d9aa8] dark:hover:text-[#f5a524]"
                    >
                      <span>Sumber Resmi</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Right: Custom Target Price Alert Manager (Open Access Without Login) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 h-fit dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="border-b border-slate-100 pb-4 dark:border-[#1d2833]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">Atur Alert Target Harga</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
            Sistem memantau harga setiap 2,8 detik dan memberi tahu seketika saat target tercapai.
          </p>
        </div>

        <form onSubmit={handleCreateAlert} className="mt-4 space-y-3.5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#fca5a5]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="alert-ticker" className="block text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">
                    Kode Saham BEI
                  </label>
                  <select
                    id="alert-ticker"
                    value={ticker}
                    onChange={(e) => {
                      const nextTk = e.target.value;
                      setTicker(nextTk);
                      const found = stocks.find((s) => s.ticker === nextTk);
                      if (found) setTargetPrice(String(found.price));
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-semibold text-slate-900 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:focus:border-[#f5a524] dark:focus:bg-[#0b1219]"
                  >
                    {stocks.slice(0, 60).map((s) => (
                      <option key={s.ticker} value={s.ticker}>
                        {s.ticker} — Rp {s.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alert-condition" className="block text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">
                    Kondisi Pemicu
                  </label>
                  <select
                    id="alert-condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:focus:border-[#f5a524] dark:focus:bg-[#0b1219]"
                  >
                    <option value="ABOVE">Harga Naik ≥ Target</option>
                    <option value="BELOW">Harga Turun ≤ Target</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="alert-price" className="font-medium text-slate-700 dark:text-[#cbd5e1]">
                    Target Harga (Rp)
                  </label>
                  {selectedStock && (
                    <span className="font-mono tabular-nums text-slate-500 dark:text-[#8d9aa8]">
                      Saat ini: Rp {selectedStock.price.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <input
                  id="alert-price"
                  type="number"
                  min={50}
                  step={5}
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold tabular-nums text-slate-900 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:focus:border-[#f5a524] dark:focus:bg-[#0b1219]"
                />
              </div>

              <div>
                <label htmlFor="alert-note" className="block text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">
                  Catatan (Opsional)
                </label>
                <input
                  id="alert-note"
                  type="text"
                  maxLength={120}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Area beli bertahap dekat S1"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#f5a524] dark:focus:bg-[#0b1219]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Pasang Alert Harga'}</span>
              </button>
            </form>

            {/* Saved Alerts List */}
            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8d9aa8]">
                <span className="font-semibold text-slate-700 dark:text-[#cbd5e1]">Daftar Alert Aktif</span>
                <span className="font-mono tabular-nums">{alerts.length} aturan</span>
              </div>

              {alerts.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  Belum ada alert harga terpasang. Tambahkan di formulir di atas.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-slate-100 dark:divide-[#1d2833]">
                  {alerts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900 dark:text-[#eaf1f7]">{a.ticker}</span>
                          <span className="text-slate-500 dark:text-[#8d9aa8]">
                            {a.condition === 'ABOVE' ? '≥' : '≤'} Rp {a.targetPrice.toLocaleString('id-ID')}
                          </span>
                          <span
                            className={
                              a.triggered
                                ? 'font-semibold text-emerald-700 dark:text-[#00e08a]'
                                : 'text-amber-700 dark:text-[#f5a524]'
                            }
                          >
                            {a.triggered ? 'Tercapai' : 'Memantau'}
                          </span>
                        </div>
                        {a.note && <div className="mt-0.5 truncate text-slate-500 dark:text-[#8d9aa8]">{a.note}</div>}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAlert(a.id)}
                        aria-label={`Hapus alert ${a.ticker}`}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700 shrink-0 dark:text-[#8d9aa8] dark:hover:bg-[#ff5a68]/15 dark:hover:text-[#ff5a68]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </section>
    </div>
  );
}
