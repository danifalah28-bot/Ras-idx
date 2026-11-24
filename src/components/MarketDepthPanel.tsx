import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { StockRecord } from '../types/market';
import {
  buildOrderbookDepth,
  getIdxTickSize,
  type DepthLevel,
  type OrderbookDepthSnapshot,
} from '../utils/orderbookDepth';

interface MarketDepthPanelProps {
  stock: StockRecord;
  compact?: boolean;
}

interface HoverReadout {
  svgX: number;
  side: 'bid' | 'offer';
  price: number;
  cumLot: number;
}

export function MarketDepthChartSvg({
  depth,
  height = 220,
}: {
  depth: OrderbookDepthSnapshot;
  height?: number;
}) {
  const [hover, setHover] = useState<HoverReadout | null>(null);

  const chartMath = useMemo(() => {
    const bids = depth.bids;
    const asks = depth.asks;
    const n = bids.length;
    if (n === 0) return null;

    const pMin = bids[n - 1].price;
    const pMax = asks[n - 1].price;
    const pRange = Math.max(1, pMax - pMin);
    const yMax = Math.max(bids[n - 1].cumLot, asks[n - 1].cumLot, 10) * 1.08;

    const W = 640;
    const H = height;
    const L = 54;
    const R = 14;
    const T = 12;
    const B = 24;
    const pw = W - L - R;
    const ph = H - T - B;

    const toX = (p: number) => L + ((p - pMin) / pRange) * pw;
    const toY = (v: number) => T + ph - (v / yMax) * ph;
    const base = toY(0);

    let bidPath = `M ${toX(bids[0].price).toFixed(1)},${base.toFixed(1)} L ${toX(bids[0].price).toFixed(1)},${toY(bids[0].cumLot).toFixed(1)}`;
    for (let i = 1; i < n; i++) {
      bidPath += ` L ${toX(bids[i].price).toFixed(1)},${toY(bids[i - 1].cumLot).toFixed(1)} L ${toX(bids[i].price).toFixed(1)},${toY(bids[i].cumLot).toFixed(1)}`;
    }
    bidPath += ` L ${toX(bids[n - 1].price).toFixed(1)},${base.toFixed(1)} Z`;

    let askPath = `M ${toX(asks[0].price).toFixed(1)},${base.toFixed(1)} L ${toX(asks[0].price).toFixed(1)},${toY(asks[0].cumLot).toFixed(1)}`;
    for (let i = 1; i < n; i++) {
      askPath += ` L ${toX(asks[i].price).toFixed(1)},${toY(asks[i - 1].cumLot).toFixed(1)} L ${toX(asks[i].price).toFixed(1)},${toY(asks[i].cumLot).toFixed(1)}`;
    }
    askPath += ` L ${toX(asks[n - 1].price).toFixed(1)},${base.toFixed(1)} Z`;

    const mid = (bids[0].price + asks[0].price) / 2;

    return {
      W,
      H,
      L,
      R,
      T,
      B,
      pw,
      ph,
      base,
      pMin,
      pMax,
      pRange,
      yMax,
      mid,
      bidPath,
      askPath,
      toX,
      toY,
    };
  }, [depth, height]);

  if (!chartMath) return null;

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawX = ((e.clientX - rect.left) / rect.width) * chartMath.W;
    const x = Math.max(chartMath.L, Math.min(chartMath.W - chartMath.R, rawX));
    const priceAtCursor =
      chartMath.pMin + ((x - chartMath.L) / chartMath.pw) * chartMath.pRange;

    if (priceAtCursor <= chartMath.mid) {
      let chosen: DepthLevel = depth.bids[0];
      for (let i = 0; i < depth.bids.length; i++) {
        if (depth.bids[i].price >= priceAtCursor) {
          chosen = depth.bids[i];
        }
      }
      setHover({
        svgX: x,
        side: 'bid',
        price: chosen.price,
        cumLot: chosen.cumLot,
      });
    } else {
      let chosen: DepthLevel = depth.asks[0];
      for (let i = 0; i < depth.asks.length; i++) {
        if (depth.asks[i].price <= priceAtCursor) {
          chosen = depth.asks[i];
        }
      }
      setHover({
        svgX: x,
        side: 'offer',
        price: chosen.price,
        cumLot: chosen.cumLot,
      });
    }
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${chartMath.W} ${chartMath.H}`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHover(null)}
        className="w-full h-auto block touch-none select-none cursor-crosshair"
        role="img"
        aria-label="Grafik kedalaman order book bid dan offer kumulatif"
      >
        {[0, 0.33, 0.66, 1].map((t) => {
          const val = Math.round((chartMath.yMax / 1.08) * t);
          const y = chartMath.toY(val);
          return (
            <g key={t}>
              <line
                x1={chartMath.L}
                x2={chartMath.W - chartMath.R}
                y1={y}
                y2={y}
                className="stroke-slate-200 dark:stroke-[#1d2833]"
                strokeWidth={1}
              />
              <text
                x={chartMath.L - 6}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
              >
                {val.toLocaleString('id-ID')}
              </text>
            </g>
          );
        })}

        {/* Mid-price reference line */}
        <line
          x1={chartMath.toX(chartMath.mid)}
          x2={chartMath.toX(chartMath.mid)}
          y1={chartMath.T}
          y2={chartMath.base}
          className="stroke-slate-300 dark:stroke-[#2a3544]"
          strokeDasharray="2 3"
          strokeWidth={1}
        />

        {/* Bid & Ask Step Areas */}
        <path
          d={chartMath.bidPath}
          fill="#00e08a"
          fillOpacity={0.18}
          stroke="#00e08a"
          strokeWidth={1.8}
        />
        <path
          d={chartMath.askPath}
          fill="#ff5a68"
          fillOpacity={0.16}
          stroke="#ff5a68"
          strokeWidth={1.8}
        />

        {/* X-Axis Labels */}
        <text
          x={chartMath.L}
          y={chartMath.H - 6}
          textAnchor="start"
          className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
        >
          Rp {chartMath.pMin.toLocaleString('id-ID')}
        </text>
        <text
          x={chartMath.toX(chartMath.mid)}
          y={chartMath.H - 6}
          textAnchor="middle"
          className="fill-slate-700 font-mono text-[10px] font-semibold dark:fill-[#eaf1f7]"
        >
          Tengah Rp {Math.round(chartMath.mid).toLocaleString('id-ID')}
        </text>
        <text
          x={chartMath.W - chartMath.R}
          y={chartMath.H - 6}
          textAnchor="end"
          className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
        >
          Rp {chartMath.pMax.toLocaleString('id-ID')}
        </text>

        {/* Crosshair */}
        {hover && (
          <line
            x1={hover.svgX}
            x2={hover.svgX}
            y1={chartMath.T}
            y2={chartMath.base}
            className="stroke-slate-500 dark:stroke-[#00e08a]"
            strokeDasharray="3 3"
            strokeWidth={1.25}
          />
        )}
      </svg>

      <div className="mt-1.5 min-h-[20px] text-xs text-slate-500 dark:text-[#8d9aa8]">
        {hover ? (
          <span>
            Harga{' '}
            <strong className="font-mono text-slate-900 tabular-nums dark:text-[#eaf1f7]">
              Rp {hover.price.toLocaleString('id-ID')}
            </strong>{' '}
            · akumulasi {hover.side === 'bid' ? 'bid' : 'offer'}{' '}
            <strong
              className={`font-mono tabular-nums ${
                hover.side === 'bid'
                  ? 'text-emerald-700 dark:text-[#00e08a]'
                  : 'text-red-700 dark:text-[#ff5a68]'
              }`}
            >
              {hover.cumLot.toLocaleString('id-ID')} lot
            </strong>{' '}
            <span className="font-mono tabular-nums">
              ({(hover.cumLot * 100).toLocaleString('id-ID')} lembar)
            </span>
          </span>
        ) : (
          <span>
            Arahkan kursor atau sentuh grafik untuk memeriksa akumulasi lot per tingkat harga BEI.
          </span>
        )}
      </div>
    </div>
  );
}

export function MarketDepthPanel({ stock, compact = false }: MarketDepthPanelProps) {
  const [levelsCount, setLevelsCount] = useState<5 | 10 | 15>(compact ? 5 : 10);
  const [paused, setPaused] = useState<boolean>(false);
  const [displayStock, setDisplayStock] = useState<StockRecord>(stock);
  const prevTickerRef = useRef<string>(stock.ticker);

  useEffect(() => {
    if (prevTickerRef.current !== stock.ticker) {
      prevTickerRef.current = stock.ticker;
      setDisplayStock(stock);
      setPaused(false);
      return;
    }
    if (!paused) {
      setDisplayStock(stock);
    }
  }, [stock, paused]);

  const depth = useMemo(
    () => buildOrderbookDepth(displayStock, levelsCount),
    [displayStock, levelsCount]
  );

  const tickSize = getIdxTickSize(displayStock.price);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
      {/* Header + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">
            Kedalaman Pasar (Market Depth) &amp; Tembok Order Book {displayStock.ticker}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
            {displayStock.isEstimatedOrderbook === false
              ? `Bid/Ask L1 Live Pasar · Model ${levelsCount} fraksi BEI (Rp${tickSize}/tick) · 1 lot = 100 lembar`
              : `Estimasi Kedalaman ${levelsCount} fraksi BEI (Rp${tickSize}/tick) · Non-L2 Feed · 1 lot = 100 lembar`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Jumlah level kedalaman pasar"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]"
          >
            {([5, 10, 15] as const).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setLevelsCount(lv)}
                className={`min-h-[30px] rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                  levelsCount === lv
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {lv} Lvl
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              paused
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-[#f5a524]/45 dark:bg-[#f5a524]/15 dark:text-[#f5a524]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:border-[#2a3544]'
            }`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{paused ? 'Lanjut' : 'Jeda'}</span>
          </button>
        </div>
      </div>

      {/* Depth Summary Metrics Strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">Spread Bid-Offer</div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
            Rp {depth.spread.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-[#8d9aa8]">
              ({depth.spreadPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">
            Total Bid ({levelsCount} Lvl)
          </div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-[#00e08a]">
            {depth.totalBidLot.toLocaleString('id-ID')} lot
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">
            Total Offer ({levelsCount} Lvl)
          </div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-red-700 dark:text-[#ff5a68]">
            {depth.totalOfferLot.toLocaleString('id-ID')} lot
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">Tembok Bid Terbesar</div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-[#00e08a]">
            Rp {depth.bidWall.price.toLocaleString('id-ID')}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-[#8d9aa8]">
              ({depth.bidWall.lot.toLocaleString('id-ID')})
            </span>
          </div>
        </div>

        <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:col-span-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8d9aa8]">
            <span>Tekanan Beli</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
              {depth.buyPressurePct}%
            </span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950/70">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 dark:bg-[#22c55e]"
              style={{ width: `${depth.buyPressurePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split: Cumulative Depth Curve + Orderbook Ladder */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-[#eaf1f7]">
              Grafik Kedalaman Kumulatif (Bid vs Offer)
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-[#8d9aa8]">
              Tembok Offer: Rp {depth.offerWall.price.toLocaleString('id-ID')} ({depth.offerWall.lot.toLocaleString('id-ID')} lot)
            </span>
          </div>
          <MarketDepthChartSvg depth={depth} height={compact ? 175 : 230} />
        </div>

        <div className="lg:col-span-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-sans font-semibold text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                  <th className="py-2 pr-2 text-right">Bid Lot</th>
                  <th className="py-2 px-2 text-right">Bid</th>
                  <th className="py-2 px-2 text-left">Offer</th>
                  <th className="py-2 pl-2 text-right">Offer Lot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
                {depth.bids.map((b, idx) => {
                  const a = depth.asks[idx];
                  const bidPct = Math.max(8, Math.round((b.lot / depth.maxLevelLot) * 100));
                  const offerPct = Math.max(8, Math.round((a.lot / depth.maxLevelLot) * 100));
                  const isBidWall = b.price === depth.bidWall.price;
                  const isOfferWall = a.price === depth.offerWall.price;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#131b25]">
                      <td className="relative py-1.5 pr-2 text-right">
                        <div
                          className="pointer-events-none absolute inset-y-0.5 right-0 rounded-xs bg-emerald-100/75 dark:bg-[#22c55e]/15"
                          style={{ width: `${bidPct}%` }}
                        />
                        <span
                          className={`relative z-10 ${
                            isBidWall
                              ? 'font-bold text-emerald-900 dark:text-[#00e08a]'
                              : 'text-slate-700 dark:text-[#eaf1f7]'
                          }`}
                        >
                          {b.lot.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-semibold text-emerald-700 dark:text-[#00e08a]">
                        {b.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-1.5 px-2 text-left font-semibold text-red-700 dark:text-[#ff5a68]">
                        {a.price.toLocaleString('id-ID')}
                      </td>
                      <td className="relative py-1.5 pl-2 text-right">
                        <div
                          className="pointer-events-none absolute inset-y-0.5 left-0 rounded-xs bg-red-100/75 dark:bg-[#ef4444]/15"
                          style={{ width: `${offerPct}%` }}
                        />
                        <span
                          className={`relative z-10 ${
                            isOfferWall
                              ? 'font-bold text-red-900 dark:text-[#ff5a68]'
                              : 'text-slate-700 dark:text-[#eaf1f7]'
                          }`}
                        >
                          {a.lot.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-[#8d9aa8]">
            Fraksi harga resmi BEI (Peraturan II-A): Rp1 (&lt;200), Rp2 (200–&lt;500), Rp5 (500–&lt;2.000), Rp10 (2.000–&lt;5.000), Rp25 (≥5.000).
          </p>
        </div>
      </div>
    </section>
  );
}
