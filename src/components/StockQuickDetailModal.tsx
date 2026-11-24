import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Star, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { CandleBar, CandleResponse, StockRecord } from '../types/market';
import { computeTechnicalSignal, getSignalToneClasses } from '../utils/signals';

interface StockQuickDetailModalProps {
  stock: StockRecord | null;
  isWatched: boolean;
  onToggleWatchlist: (ticker: string) => void;
  onOpenFullAnalysis: (ticker: string) => void;
  onClose: () => void;
}

function computeSmaSeries(closes: number[], period: number): number[] {
  return closes.map((_, i) => {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function computeRsiSeries(closes: number[], period = 14): number[] {
  const rsi: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < 2) {
      rsi.push(50);
      continue;
    }
    const start = Math.max(1, i - period + 1);
    let gains = 0;
    let losses = 0;
    let count = 0;
    for (let j = start; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
      count++;
    }
    const avgGain = gains / Math.max(1, count);
    const avgLoss = losses / Math.max(1, count);
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(Number((100 - 100 / (1 + rs)).toFixed(1)));
    }
  }
  return rsi;
}

export function StockQuickDetailModal({
  stock,
  isWatched,
  onToggleWatchlist,
  onOpenFullAnalysis,
  onClose,
}: StockQuickDetailModalProps) {
  const [candles, setCandles] = useState<CandleBar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!stock) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stock, onClose]);

  useEffect(() => {
    if (!stock) {
      setCandles([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetch(`/api/stocks/${encodeURIComponent(stock.ticker)}/candles?timeframe=1D`)
      .then((res) => (res.ok ? (res.json() as Promise<CandleResponse>) : null))
      .then((data) => {
        if (mounted && data?.candles && data.candles.length > 0) {
          setCandles(data.candles.slice(-30));
        } else if (mounted) {
          setCandles([]);
        }
      })
      .catch(() => {
        if (mounted) setCandles([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [stock]);

  const seriesData = useMemo(() => {
    if (!stock) return null;
    const closes =
      candles.length >= 5
        ? candles.map((c) => c.close)
        : [stock.prevClose || stock.price, stock.price];
    const labels =
      candles.length >= 5
        ? candles.map((c) =>
            new Date(c.time * 1000).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              timeZone: 'Asia/Jakarta',
            })
          )
        : ['Kemarin', 'Saat Ini'];
    const smaPeriod = closes.length >= 20 ? 20 : Math.min(10, closes.length);
    const sma = computeSmaSeries(closes, smaPeriod);
    const rsi = computeRsiSeries(closes, 14);
    const allPrices = [...closes, ...sma, stock.s1, stock.r1];
    const minP = Math.min(...allPrices) * 0.992;
    const maxP = Math.max(...allPrices) * 1.008;
    const rangeP = Math.max(1, maxP - minP);

    return { closes, labels, sma, rsi, minP, maxP, rangeP };
  }, [stock, candles]);

  if (!stock || !seriesData) return null;

  const sig = computeTechnicalSignal(stock);
  const { closes, labels, sma, rsi, minP, maxP, rangeP } = seriesData;

  const W = 600;
  const H = 190;
  const pad = { top: 14, right: 16, bottom: 24, left: 56 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const toX = (idx: number, total: number) =>
    pad.left + (cw * idx) / Math.max(1, total - 1);
  const toPriceY = (val: number) => pad.top + ch * (1 - (val - minP) / rangeP);

  const pricePath = closes
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i, closes.length).toFixed(1)} ${toPriceY(v).toFixed(1)}`)
    .join(' ');
  const smaPath = sma
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i, sma.length).toFixed(1)} ${toPriceY(v).toFixed(1)}`)
    .join(' ');

  const RH = 95;
  const rPad = { top: 10, right: 16, bottom: 16, left: 56 };
  const rCh = RH - rPad.top - rPad.bottom;
  const toRsiY = (v: number) => rPad.top + rCh * (1 - Math.max(0, Math.min(100, v)) / 100);
  const rsiPath = rsi
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i, rsi.length).toFixed(1)} ${toRsiY(v).toFixed(1)}`)
    .join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#060a0f]/75 p-3 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="quick-detail-title"
                className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]"
              >
                {stock.ticker} — {stock.name}
              </h2>
              <span className={`text-xs font-bold ${getSignalToneClasses(sig)}`}>
                Sinyal: {sig}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
              <span className="text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                Rp {stock.price.toLocaleString('id-ID')}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  stock.changePct >= 0
                    ? 'text-emerald-700 dark:text-[#00e08a]'
                    : 'text-red-700 dark:text-[#ff5a68]'
                }`}
              >
                {stock.changePct >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {stock.changePct >= 0 ? '+' : ''}
                {stock.changePct.toFixed(2)}%
              </span>
              <span className="text-slate-400 dark:text-[#8d9aa8]">·</span>
              <span className="text-slate-500 dark:text-[#8d9aa8]">{stock.sector}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleWatchlist(stock.ticker)}
              aria-label={isWatched ? `Hapus ${stock.ticker} dari Watchlist` : `Simpan ${stock.ticker} ke Watchlist`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                isWatched
                  ? 'border-amber-200 bg-amber-50 text-amber-500 dark:border-[#f5a524]/40 dark:bg-[#f5a524]/15 dark:text-[#f5a524]'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#8d9aa8] dark:hover:text-[#f5a524]'
              }`}
            >
              <Star className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail saham"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Price + MA20 Chart */}
        <div className="mt-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-[#cbd5e1]">
              Tren Harga Harian &amp; MA20 ({labels.length} sesi)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-[#8d9aa8]">
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 bg-[#16c47f]" />
                <span>Harga</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 bg-[#f5a524]" />
                <span>MA</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 border-t border-dashed border-red-500" />
                <span>R1</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 border-t border-dashed border-emerald-500" />
                <span>S1</span>
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
            {loading && candles.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-xs text-slate-500 dark:text-[#8d9aa8]">
                Memuat data historis harga &amp; indikator...
              </div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} className="h-[180px] w-full overflow-visible">
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                  const y = pad.top + ch * t;
                  const val = Math.round(maxP - rangeP * t);
                  return (
                    <g key={t}>
                      <line
                        x1={pad.left}
                        y1={y}
                        x2={W - pad.right}
                        y2={y}
                        className="stroke-slate-200 dark:stroke-[#1d2833]"
                        strokeWidth={1}
                      />
                      <text
                        x={pad.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                      >
                        {val.toLocaleString('id-ID')}
                      </text>
                    </g>
                  );
                })}

                {/* R1 & S1 reference lines */}
                <line
                  x1={pad.left}
                  y1={toPriceY(stock.r1)}
                  x2={W - pad.right}
                  y2={toPriceY(stock.r1)}
                  stroke="#ff5a68"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <line
                  x1={pad.left}
                  y1={toPriceY(stock.s1)}
                  x2={W - pad.right}
                  y2={toPriceY(stock.s1)}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />

                {/* SMA & Close Paths */}
                <path d={smaPath} fill="none" stroke="#f5a524" strokeWidth={1.75} />
                <path d={pricePath} fill="none" stroke="#16c47f" strokeWidth={2.25} />

                {/* Start / Mid / End date labels */}
                {[0, Math.floor((labels.length - 1) / 2), labels.length - 1]
                  .filter((idx, i, arr) => idx >= 0 && arr.indexOf(idx) === i)
                  .map((idx) => (
                    <text
                      key={idx}
                      x={toX(idx, labels.length)}
                      y={H - 5}
                      textAnchor={idx === 0 ? 'start' : idx === labels.length - 1 ? 'end' : 'middle'}
                      className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                    >
                      {labels[idx]}
                    </text>
                  ))}
              </svg>
            )}
          </div>
        </div>

        {/* RSI(14) Sub-Chart */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-[#cbd5e1]">
              RSI(14) Momentum Oscillator
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-[#8d9aa8]">
              Batas Referensi: 30 (Jenuh Jual) · 70 (Jenuh Beli)
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <svg viewBox={`0 0 ${W} ${RH}`} className="h-[92px] w-full overflow-visible">
              {[70, 50, 30].map((lvl) => {
                const y = toRsiY(lvl);
                return (
                  <g key={lvl}>
                    <line
                      x1={rPad.left}
                      y1={y}
                      x2={W - rPad.right}
                      y2={y}
                      stroke={lvl === 50 ? '#94a3b8' : '#f5a524'}
                      strokeOpacity={lvl === 50 ? 0.35 : 0.75}
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={rPad.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                    >
                      {lvl}
                    </text>
                  </g>
                );
              })}
              <path d={rsiPath} fill="none" stroke="#6366f1" strokeWidth={2} className="dark:stroke-[#38bdf8]" />
            </svg>
          </div>
        </div>

        {/* 4 Quick Technical Stat Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">Support S1</div>
            <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-[#00e08a]">
              Rp {stock.s1.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">Resisten R1</div>
            <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-red-700 dark:text-[#ff5a68]">
              Rp {stock.r1.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">MA 20</div>
            <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
              Rp {stock.ma20.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">RSI(14)</div>
            <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
              {stock.rsi14.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Summary & CTA */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#1d2833]">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-[#cbd5e1]">
            Ringkasan: Harga saat ini berada{' '}
            <strong>{stock.price >= stock.ma20 ? 'di atas' : 'di bawah'}</strong> rata-rata MA20 (Rp{' '}
            {stock.ma20.toLocaleString('id-ID')}) dengan RSI(14) di level{' '}
            <strong className="font-mono">{stock.rsi14.toFixed(1)}</strong> dan aliran dana 1 minggu{' '}
            <strong
              className={
                stock.inflow1WB >= 0
                  ? 'text-emerald-700 dark:text-[#00e08a]'
                  : 'text-red-700 dark:text-[#ff5a68]'
              }
            >
              {stock.inflow1WB >= 0 ? `masuk +Rp ${stock.inflow1WB.toFixed(1)} M` : `keluar Rp ${stock.inflow1WB.toFixed(1)} M`}
            </strong>
            .
          </p>

          <button
            type="button"
            onClick={() => {
              const tk = stock.ticker;
              onClose();
              onOpenFullAnalysis(tk);
            }}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110 whitespace-nowrap shrink-0"
          >
            <span>Buka Analisis Lengkap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
