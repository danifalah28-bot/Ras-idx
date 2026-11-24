import React, { useMemo, useState } from 'react';
import { ArrowRight, Star, Trash2 } from 'lucide-react';
import type { StockRecord } from '../types/market';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';
import { buildOrderbookDepth } from '../utils/orderbookDepth';
import { MarketDepthChartSvg } from './MarketDepthPanel';

interface OrderbookWatchlistPanelProps {
  activeStock: StockRecord;
  stocks: StockRecord[];
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  onSelectStock: (ticker: string, targetTab?: 'analysis' | 'peers' | 'geopolitics') => void;
}

export function OrderbookWatchlistPanel({
  activeStock,
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}: OrderbookWatchlistPanelProps) {
  const [panelMode, setPanelMode] = useState<'orderbook' | 'depth' | 'watchlist'>('orderbook');
  const [levelsCount, setLevelsCount] = useState<5 | 10>(5);
  const isPinned = watchlist.includes(activeStock.ticker);

  const depth = useMemo(
    () => buildOrderbookDepth(activeStock, levelsCount),
    [activeStock, levelsCount]
  );

  const watchlistStocks = useMemo(() => {
    const map = new Map(stocks.map((s) => [s.ticker, s]));
    return watchlist.map((tk) => map.get(tk)).filter((s): s is StockRecord => Boolean(s));
  }, [stocks, watchlist]);

  return (
    <aside className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
      <div>
        {/* Panel Header + Mode Switch */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <button
              type="button"
              onClick={() => setPanelMode('orderbook')}
              className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                panelMode === 'orderbook'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              Orderbook
            </button>
            <button
              type="button"
              onClick={() => setPanelMode('depth')}
              className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                panelMode === 'depth'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              Depth Chart
            </button>
            <button
              type="button"
              onClick={() => setPanelMode('watchlist')}
              className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                panelMode === 'watchlist'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              Watchlist ({watchlistStocks.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleWatchlist(activeStock.ticker)}
            title={
              isPinned
                ? `Hapus ${activeStock.ticker} dari Watchlist`
                : `Simpan ${activeStock.ticker} ke Watchlist`
            }
            className={`inline-flex min-h-[34px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isPinned
                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-[#f5a524]/45 dark:bg-[#f5a524]/15 dark:text-[#f5a524]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:border-[#2a3544]'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${isPinned ? 'fill-amber-500 text-amber-600 dark:text-[#f5a524]' : ''}`}
            />
            <span className="hidden sm:inline">{isPinned ? 'Disimpan' : 'Pantau'}</span>
          </button>
        </div>

        {panelMode === 'orderbook' && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-[#8d9aa8]">
              <span>
                {activeStock.isEstimatedOrderbook === false
                  ? `Antrean Bid/Ask L1 Live (${activeStock.ticker})`
                  : `Estimasi ${levelsCount} Fraksi BEI (${activeStock.ticker})`}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums">
                  Spread Rp{depth.spread} ({depth.spreadPct.toFixed(2)}%)
                </span>
                <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
                  {([5, 10] as const).map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setLevelsCount(lv)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                        levelsCount === lv
                          ? 'bg-white text-slate-900 shadow-2xs dark:bg-[#00e08a] dark:text-[#03130b]'
                          : 'text-slate-500 hover:text-slate-800 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                      }`}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bid / Offer Column Headers */}
            <div className="grid grid-cols-4 border-b border-slate-100 pb-2 text-[11px] font-semibold text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
              <span className="text-left">Bid Lot</span>
              <span className="pr-2 text-right">Bid</span>
              <span className="pl-2 text-left">Offer</span>
              <span className="text-right">Offer Lot</span>
            </div>

            {/* Multi-Level Orderbook Rows */}
            <div className="max-h-[245px] divide-y divide-slate-100 overflow-y-auto font-mono text-xs tabular-nums dark:divide-[#1d2833]">
              {depth.bids.map((b, idx) => {
                const a = depth.asks[idx];
                const bidWidth = Math.max(8, Math.round((b.lot / depth.maxLevelLot) * 100));
                const offerWidth = Math.max(8, Math.round((a.lot / depth.maxLevelLot) * 100));
                return (
                  <div key={idx} className="grid grid-cols-4 items-center py-1.5">
                    <div className="relative flex items-center pr-1.5">
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 rounded-xs bg-emerald-100/75 dark:bg-[#00e08a]/15"
                        style={{ width: `${bidWidth}%` }}
                      />
                      <span className="relative z-10 font-medium text-slate-700 dark:text-[#eaf1f7]">
                        {b.lot.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="pr-2 text-right font-semibold text-emerald-700 dark:text-[#00e08a]">
                      {b.price.toLocaleString('id-ID')}
                    </div>

                    <div className="pl-2 text-left font-semibold text-red-700 dark:text-[#ff5a68]">
                      {a.price.toLocaleString('id-ID')}
                    </div>

                    <div className="relative flex items-center justify-end pl-1.5">
                      <div
                        className="pointer-events-none absolute inset-y-0 right-0 rounded-xs bg-red-100/75 dark:bg-[#ff5a68]/15"
                        style={{ width: `${offerWidth}%` }}
                      />
                      <span className="relative z-10 font-medium text-slate-700 dark:text-[#eaf1f7]">
                        {a.lot.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bid vs Offer Strength Meter + Wall Highlights */}
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-[#1d2833]">
              <div className="flex items-center justify-between font-mono text-[11px] font-semibold tabular-nums">
                <span className="text-emerald-700 dark:text-[#00e08a]">
                  Bid {depth.totalBidLot.toLocaleString('id-ID')} lot ({depth.buyPressurePct}%)
                </span>
                <span className="text-red-700 dark:text-[#ff5a68]">
                  Offer {depth.totalOfferLot.toLocaleString('id-ID')} lot ({100 - depth.buyPressurePct}%)
                </span>
              </div>
              <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950/70">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 dark:bg-[#00e08a]"
                  style={{ width: `${depth.buyPressurePct}%` }}
                />
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
                <div className="rounded-md bg-emerald-50/80 px-2.5 py-1.5 dark:bg-[#00e08a]/10">
                  <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Tembok Bid</div>
                  <div className="font-semibold text-emerald-800 dark:text-[#00e08a]">
                    Rp {depth.bidWall.price.toLocaleString('id-ID')} · {depth.bidWall.lot.toLocaleString('id-ID')} lot
                  </div>
                </div>
                <div className="rounded-md bg-red-50/80 px-2.5 py-1.5 dark:bg-[#ff5a68]/10">
                  <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Tembok Offer</div>
                  <div className="font-semibold text-red-800 dark:text-[#ff5a68]">
                    Rp {depth.offerWall.price.toLocaleString('id-ID')} · {depth.offerWall.lot.toLocaleString('id-ID')} lot
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Key Financial & Flow Snapshot */}
            <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 font-mono text-xs tabular-nums dark:border-[#1d2833]">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">PER / PBV</div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                  {activeStock.per > 0 ? `${activeStock.per.toFixed(1)}x` : 'N/A'} · {activeStock.pbv.toFixed(2)}x
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">Inflow 1W</div>
                <div
                  className={`mt-0.5 font-semibold ${
                    activeStock.inflow1WB >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {activeStock.inflow1WB >= 0 ? '+' : ''}Rp {activeStock.inflow1WB.toFixed(1)} M
                </div>
              </div>
            </div>
          </div>
        )}

        {panelMode === 'depth' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-[#eaf1f7]">
                Kedalaman Kumulatif {activeStock.ticker} ({levelsCount} Level)
              </span>
              <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
                {([5, 10] as const).map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevelsCount(lv)}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      levelsCount === lv
                        ? 'bg-white text-slate-900 shadow-2xs dark:bg-[#00e08a] dark:text-[#03130b]'
                        : 'text-slate-500 hover:text-slate-800 dark:text-[#8d9aa8]'
                    }`}
                  >
                    {lv} Lvl
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <MarketDepthChartSvg depth={depth} height={195} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs tabular-nums">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">Tembok Bid Terbesar</div>
                <div className="mt-0.5 font-semibold text-emerald-700 dark:text-[#00e08a]">
                  Rp {depth.bidWall.price.toLocaleString('id-ID')} ({depth.bidWall.lot.toLocaleString('id-ID')} lot)
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">Tembok Offer Terbesar</div>
                <div className="mt-0.5 font-semibold text-red-700 dark:text-[#ff5a68]">
                  Rp {depth.offerWall.price.toLocaleString('id-ID')} ({depth.offerWall.lot.toLocaleString('id-ID')} lot)
                </div>
              </div>
            </div>
          </div>
        )}

        {panelMode === 'watchlist' && (
          <div className="mt-3 max-h-[360px] divide-y divide-slate-100 overflow-y-auto dark:divide-[#1d2833]">
            {watchlistStocks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
                Belum ada saham di Watchlist. Ketuk tombol <strong>Pantau</strong> di atas untuk menyimpan emiten.
              </div>
            ) : (
              watchlistStocks.map((item) => {
                const isSelected = item.ticker === activeStock.ticker;
                return (
                  <div
                    key={item.ticker}
                    className={`flex items-center justify-between gap-2 rounded-lg px-1.5 py-2.5 transition-colors ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-[#f5a524]/10'
                        : 'hover:bg-slate-50 dark:hover:bg-[#131b25]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectStock(item.ticker)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#eaf1f7]">
                            {item.ticker}
                          </span>
                          <SupportResistanceLampBadge status={item.lampStatus} compact />
                        </div>
                        <div className="truncate text-[11px] text-slate-500 dark:text-[#8d9aa8]">{item.name}</div>
                      </div>

                      <div className="shrink-0 text-right font-mono text-xs tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-[#eaf1f7]">
                          Rp {item.price.toLocaleString('id-ID')}
                        </div>
                        <div
                          className={
                            item.changePct >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }
                        >
                          {item.changePct >= 0 ? '+' : ''}
                          {item.changePct.toFixed(2)}%
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(item.ticker)}
                      aria-label={`Hapus ${item.ticker} dari watchlist`}
                      className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-red-700 dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#ef4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Primary Action Link */}
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-[#1d2833]">
        <button
          type="button"
          onClick={() => onSelectStock(activeStock.ticker, 'analysis')}
          className="flex min-h-[40px] w-full items-center justify-between rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110"
        >
          <span>Bedah Keuangan, Kuartal &amp; Market Depth {activeStock.ticker}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
