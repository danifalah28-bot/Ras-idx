import React, { useState } from 'react';
import { ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import type { OjkBeiLiveSyncResponse } from '../types/market';

interface OjkBeiLivePanelProps {
  data: OjkBeiLiveSyncResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectStock: (ticker: string) => void;
}

type FeedFilter = 'ALL' | 'BEI' | 'OJK' | 'SUPERVISION';

export function OjkBeiLivePanel({
  data,
  loading,
  onRefresh,
  onSelectStock,
}: OjkBeiLivePanelProps) {
  const [filter, setFilter] = useState<FeedFilter>('ALL');

  const items = (() => {
    if (!data) return [];
    if (filter === 'BEI') return data.beiUpdates;
    if (filter === 'OJK') return data.ojkUpdates;
    if (filter === 'SUPERVISION') {
      return data.combinedFeed.filter(
        (i) => i.category === 'Pengawasan / UMA / Suspensi'
      );
    }
    return data.combinedFeed;
  })();

  const lastRegTime = data?.lastRegulatorySyncAt
    ? new Date(data.lastRegulatorySyncAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      })
    : 'Memuat...';

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#1d2833]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-[#00e08a]" />
            <span>Sinkronisasi Otomatis OJK & BEI</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Pembaruan Otomatis Tiap {data?.syncIntervalSec ?? 120} Detik
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Sync Terakhir: {lastRegTime} WIB
            </span>
            {data && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-700 tabular-nums dark:text-[#00e08a]">
                  {data.liveYahooSyncedCount} / {data.totalTrackedStocks} emiten tersinkron live
                </span>
              </>
            )}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">
            Aliran Keterbukaan Informasi BEI, Regulasi OJK & Pengawasan Pasar
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
            {(
              [
                { id: 'ALL', label: 'Semua' },
                { id: 'BEI', label: 'BEI / IDX' },
                { id: 'OJK', label: 'OJK' },
                { id: 'SUPERVISION', label: 'Pengawasan / UMA' },
              ] as { id: FeedFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:border-[#2a3544]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menyinkronkan...' : 'Sinkron OJK & BEI'}</span>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
          {loading
            ? 'Mengambil pengumuman terbaru dari OJK & BEI...'
            : 'Belum ada item yang sesuai pada filter ini. Klik "Sinkron OJK & BEI" untuk memeriksa pembaruan.'}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.slice(0, 8).map((item) => {
            const pubLabel = new Date(item.publishedAt).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'Asia/Jakarta',
            });

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0b1219] dark:hover:border-[#2a3544]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    <span
                      className={`font-mono font-bold ${
                        item.authority === 'OJK'
                          ? 'text-amber-700 dark:text-[#00e08a]'
                          : 'text-emerald-700 dark:text-[#00e08a]'
                      }`}
                    >
                      {item.authority}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        item.category === 'Pengawasan / UMA / Suspensi'
                          ? 'font-semibold text-red-700 dark:text-[#ff5a68]'
                          : 'text-slate-700 dark:text-[#cbd5e1]'
                      }
                    >
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{pubLabel} WIB</span>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-sm font-semibold leading-snug text-slate-900 hover:text-amber-700 hover:underline dark:text-[#eaf1f7] dark:hover:text-[#00e08a]"
                  >
                    {item.title}
                  </a>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5 text-xs dark:border-[#1d2833]">
                  <span className="truncate text-slate-500 dark:text-[#8d9aa8]">{item.source}</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.detectedTickers.map((tk) => (
                      <button
                        key={tk}
                        type="button"
                        onClick={() => onSelectStock(tk)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 hover:border-amber-600 hover:text-amber-800 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#eaf1f7] dark:hover:border-[#f5a524] dark:hover:text-[#00e08a]"
                      >
                        {tk}
                      </button>
                    ))}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-amber-700 hover:underline dark:text-[#00e08a]"
                    >
                      <span>Buka</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
