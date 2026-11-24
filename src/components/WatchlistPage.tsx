import React, { useMemo, useState } from 'react';
import { ArrowRight, Plus, Search, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import type { StockRecord } from '../types/market';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';
import { computeTechnicalSignal, getSignalToneClasses } from '../utils/signals';

interface WatchlistPageProps {
  stocks: StockRecord[];
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  onSelectStock: (ticker: string, targetTab?: 'overview' | 'analysis') => void;
  onQuickInspect?: (ticker: string) => void;
  onBrowseScreener: () => void;
}

export function WatchlistPage({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
  onQuickInspect,
  onBrowseScreener,
}: WatchlistPageProps) {
  const [quickQuery, setQuickQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const watchedStocks = useMemo(() => {
    const map = new Map(stocks.map((s) => [s.ticker, s]));
    return watchlist.map((tk) => map.get(tk)).filter((s): s is StockRecord => Boolean(s));
  }, [stocks, watchlist]);

  const quickCandidates = useMemo(() => {
    const q = quickQuery.trim().toUpperCase();
    const pool = stocks.filter((s) => !watchlist.includes(s.ticker));
    if (!q) return pool.slice(0, 8);
    return pool
      .filter(
        (s) =>
          s.ticker.includes(q) ||
          s.name.toUpperCase().includes(q) ||
          s.subSector.toUpperCase().includes(q)
      )
      .slice(0, 10);
  }, [stocks, watchlist, quickQuery]);

  const stats = useMemo(() => {
    let buyCount = 0;
    let totalInflow = 0;
    let positiveCount = 0;
    for (const s of watchedStocks) {
      if (computeTechnicalSignal(s) === 'Beli') buyCount++;
      totalInflow += s.inflow1WB;
      if (s.changePct > 0) positiveCount++;
    }
    return { buyCount, totalInflow, positiveCount };
  }, [watchedStocks]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Add */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#1d2833]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span>Watchlist Lokal Terintegrasi</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{watchedStocks.length} saham dipantau</span>
              <span aria-hidden="true">·</span>
              <span>Tersimpan otomatis di perangkat Anda</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Daftar Pantau Saham Favorit (Watchlist)
            </h1>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
            <input
              type="text"
              value={quickQuery}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
              onChange={(e) => {
                setQuickQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Tambah cepat kode saham (mis. PANI, BREN)..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#f5a524] dark:focus:bg-[#07090d]"
            />

            {searchOpen && (
              <div className="absolute top-full left-0 z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-[#1d2833] dark:bg-[#0e141c]">
                {quickCandidates.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    Tidak ada emiten baru yang cocok.
                  </div>
                ) : (
                  quickCandidates.map((s) => (
                    <button
                      key={s.ticker}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onToggleWatchlist(s.ticker);
                        setQuickQuery('');
                      }}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-3.5 py-2.5 text-left text-xs last:border-b-0 hover:bg-slate-50 dark:border-[#1d2833] dark:hover:bg-[#131b25]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono font-bold text-slate-900 dark:text-[#eaf1f7]">{s.ticker}</div>
                        <div className="truncate text-slate-500 dark:text-[#8d9aa8]">{s.name}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-[#f5a524] shrink-0">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Watchlist KPI Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Saham Dipantau</div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
              {watchedStocks.length}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Menguat Hari Ini</div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-700 dark:text-[#00e08a]">
              {stats.positiveCount} / {watchedStocks.length}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Sinyal Teknis Beli</div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-700 dark:text-[#f5a524]">
              {stats.buyCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Akumulasi Inflow 1W</div>
            <div
              className={`mt-1 font-mono text-xl font-bold tabular-nums ${
                stats.totalInflow >= 0
                  ? 'text-emerald-700 dark:text-[#00e08a]'
                  : 'text-red-700 dark:text-[#ff5a68]'
              }`}
            >
              {stats.totalInflow >= 0 ? '+' : ''}Rp {stats.totalInflow.toFixed(1)} M
            </div>
          </div>
        </div>
      </section>

      {/* Watchlist Items Table / Empty State */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        {watchedStocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Star className="h-9 w-9 text-slate-300 dark:text-[#2a3544]" />
            <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-[#eaf1f7]">
              Watchlist Anda Masih Kosong
            </h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-[#8d9aa8]">
              Gunakan kolom pencarian di atas atau klik ikon bintang pada Smart Screener &amp; Panel Orderbook untuk menyimpan emiten favorit secara otomatis tanpa perlu login.
            </p>
            <button
              type="button"
              onClick={onBrowseScreener}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110"
            >
              <span>Jelajahi Screening 940 Saham</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                  <th className="py-2.5 pr-3">Emiten</th>
                  <th className="py-2.5 px-2 text-right">Harga</th>
                  <th className="py-2.5 px-2 text-right">1D %</th>
                  <th className="py-2.5 px-2 text-right">Support S1</th>
                  <th className="py-2.5 px-2 text-right">Resisten R1</th>
                  <th className="py-2.5 px-2 text-right">Inflow 1W</th>
                  <th className="py-2.5 px-2 text-right">RSI(14)</th>
                  <th className="py-2.5 px-2">Sinyal</th>
                  <th className="py-2.5 px-2">Lampu S/R</th>
                  <th className="py-2.5 pl-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
                {watchedStocks.map((s) => {
                  const sig = computeTechnicalSignal(s);
                  return (
                    <tr
                      key={s.ticker}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25]"
                    >
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => onSelectStock(s.ticker, 'analysis')}
                          className="text-left group"
                        >
                          <div className="font-mono text-sm font-bold text-slate-900 group-hover:text-amber-700 dark:text-[#eaf1f7] dark:group-hover:text-[#f5a524]">
                            {s.ticker}
                          </div>
                          <div className="max-w-[200px] truncate text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                            {s.name}
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
                        Rp {s.price.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-3 px-2 text-right font-mono font-semibold tabular-nums ${
                          s.changePct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {s.changePct >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {s.changePct >= 0 ? '+' : ''}
                          {s.changePct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-[#cbd5e1]">
                        {s.s1.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-[#cbd5e1]">
                        {s.r1.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-3 px-2 text-right font-mono font-semibold tabular-nums ${
                          s.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.inflow1WB >= 0 ? '+' : ''}
                        {s.inflow1WB.toFixed(1)}M
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-700 dark:text-[#cbd5e1]">
                        {s.rsi14.toFixed(0)}
                      </td>
                      <td className={`py-3 px-2 font-semibold ${getSignalToneClasses(sig)}`}>
                        {sig}
                      </td>
                      <td className="py-3 px-2">
                        <SupportResistanceLampBadge status={s.lampStatus} compact />
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {onQuickInspect && (
                            <button
                              type="button"
                              onClick={() => onQuickInspect(s.ticker)}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:border-[#2a3544]"
                            >
                              Cepat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectStock(s.ticker, 'analysis')}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-[#00e08a]/35 dark:bg-[#00e08a]/12 dark:text-[#00e08a] dark:hover:bg-[#00e08a]/22"
                          >
                            Grafik
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleWatchlist(s.ticker)}
                            aria-label={`Hapus ${s.ticker} dari Watchlist`}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700 dark:text-[#8d9aa8] dark:hover:bg-red-950/50 dark:hover:text-[#ff5a68]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
