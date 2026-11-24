import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { StockRecord } from '../types/market';
import { MarketDepthPanel } from './MarketDepthPanel';
import { buildOrderbookDepth } from '../utils/orderbookDepth';

interface MarketDepthPageProps {
  stocks: StockRecord[];
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
  onOpenStockAnalysis: (ticker: string) => void;
}

export function MarketDepthPage({
  stocks,
  activeTicker,
  onSelectTicker,
  onOpenStockAnalysis,
}: MarketDepthPageProps) {
  const [query, setQuery] = useState('');

  const activeStock = useMemo(
    () => stocks.find((s) => s.ticker === activeTicker) ?? stocks[0],
    [stocks, activeTicker]
  );

  const filteredStocks = useMemo(() => {
    const q = query.trim().toUpperCase();
    const list = q
      ? stocks.filter(
          (s) =>
            s.ticker.includes(q) ||
            s.name.toUpperCase().includes(q) ||
            s.sector.toUpperCase().includes(q)
        )
      : [...stocks].sort((a, b) => b.adtvB - a.adtvB);
    return list.slice(0, 15);
  }, [stocks, query]);

  if (!activeStock) return null;

  return (
    <div className="space-y-6">
      {/* Header + Quick Ticker Switcher */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-[#00e08a]">
              Analisis Order Book &amp; Antrean Likuiditas BEI
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Kedalaman Pasar (Market Depth) — {activeStock.ticker}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
              {activeStock.name} · Harga Live Rp {activeStock.price.toLocaleString('id-ID')} (
              {activeStock.changePct >= 0 ? '+' : ''}
              {activeStock.changePct.toFixed(2)}%)
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode / nama saham..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#00e08a]"
              />
            </div>

            <button
              type="button"
              onClick={() => onOpenStockAnalysis(activeStock.ticker)}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110 whitespace-nowrap shrink-0"
            >
              <span>Bedah Analisis {activeStock.ticker}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Interactive Market Depth Chart + Order Book Ladder */}
      <MarketDepthPanel stock={activeStock} />

      {/* Order Book Wall Comparison Matrix Across Liquid BEI Stocks */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">
              Peta Tembok Order Book Emiten Likuid BEI
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
              Level dengan antrean lot terbesar pada 15 fraksi teratas. Ketuk emiten untuk menampilkan grafik Market Depth-nya di atas.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-[#8d9aa8]">
            {filteredStocks.length} emiten ditampilkan
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                <th className="py-2.5 pr-3">Emiten</th>
                <th className="py-2.5 px-3 text-right">Harga</th>
                <th className="py-2.5 px-3 text-right">1D %</th>
                <th className="py-2.5 px-3 text-right">Tembok Bid</th>
                <th className="py-2.5 px-3 text-right">Tembok Offer</th>
                <th className="py-2.5 px-3 text-right">Spread</th>
                <th className="py-2.5 pl-3 text-right">Tekanan Beli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
              {filteredStocks.map((s) => {
                const depth = buildOrderbookDepth(s, 15);
                const isSelected = s.ticker === activeStock.ticker;
                return (
                  <tr
                    key={s.ticker}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-[#00e08a]/10'
                        : 'hover:bg-slate-50 dark:hover:bg-[#131b25]'
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTicker(s.ticker);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group text-left"
                      >
                        <div className="font-mono font-bold text-slate-900 group-hover:text-amber-700 dark:text-[#eaf1f7] dark:group-hover:text-[#f5a524]">
                          {s.ticker}
                        </div>
                        <div className="max-w-[180px] truncate text-xs text-slate-500 dark:text-[#8d9aa8]">
                          {s.name}
                        </div>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                      Rp {s.price.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-medium tabular-nums ${
                        s.changePct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {s.changePct >= 0 ? '+' : ''}
                      {s.changePct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <div className="font-semibold text-emerald-700 dark:text-[#00e08a]">
                        Rp {depth.bidWall.price.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                        {depth.bidWall.lot.toLocaleString('id-ID')} lot
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <div className="font-semibold text-red-700 dark:text-[#ff5a68]">
                        Rp {depth.offerWall.price.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                        {depth.offerWall.lot.toLocaleString('id-ID')} lot
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs text-slate-600 tabular-nums dark:text-[#8d9aa8]">
                      Rp {depth.spread} ({depth.spreadPct.toFixed(2)}%)
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          depth.buyPressurePct >= 55
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : depth.buyPressurePct <= 45
                            ? 'text-red-700 dark:text-[#ff5a68]'
                            : 'text-slate-700 dark:text-[#eaf1f7]'
                        }
                      >
                        {depth.buyPressurePct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
