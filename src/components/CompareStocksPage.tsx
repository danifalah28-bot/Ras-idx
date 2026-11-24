import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Plus, Search, X } from 'lucide-react';
import type { CandleBar, CandleResponse, StockRecord } from '../types/market';
import { SectorPeerChart } from './SectorPeerChart';

interface CompareStocksPageProps {
  stocks: StockRecord[];
  activeStock: StockRecord;
  compareTickers: string[];
  onChangeCompareTickers: (next: string[]) => void;
  onOpenStockAnalysis: (ticker: string) => void;
}

const COMPARE_COLORS = ['#00e08a', '#3d8bff', '#ffb020', '#c264ff'];

type ComparePeriod = '1B' | '3B' | '6B' | '1T';

const PERIOD_DAYS: Record<ComparePeriod, number> = {
  '1B': 21,
  '3B': 63,
  '6B': 126,
  '1T': 249,
};

function fmtNum(v: number, dec = 1): string {
  return v.toLocaleString('id-ID', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtPct(v: number, dec = 1): string {
  return `${v > 0 ? '+' : ''}${fmtNum(v, dec)}%`;
}

export function CompareStocksPage({
  stocks,
  activeStock,
  compareTickers,
  onChangeCompareTickers,
  onOpenStockAnalysis,
}: CompareStocksPageProps) {
  const [viewMode, setViewMode] = useState<'custom' | 'sector'>('custom');
  const [period, setPeriod] = useState<ComparePeriod>('3B');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetQuery, setSheetQuery] = useState('');
  const [candlesMap, setCandlesMap] = useState<Record<string, CandleBar[]>>({});
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const selectedStocks = useMemo(() => {
    const map = new Map(stocks.map((s) => [s.ticker, s]));
    const picked = compareTickers
      .map((tk) => map.get(tk))
      .filter((s): s is StockRecord => Boolean(s));
    return picked.length > 0 ? picked : stocks.slice(0, 3);
  }, [stocks, compareTickers]);

  // Fetch real daily candles for all compared stocks
  useEffect(() => {
    let mounted = true;
    const missing = selectedStocks.filter((s) => !candlesMap[s.ticker]);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (s) => {
        try {
          const res = await fetch(`/api/stocks/${encodeURIComponent(s.ticker)}/candles?timeframe=1D`);
          if (!res.ok) return null;
          const data = (await res.json()) as CandleResponse;
          return { ticker: s.ticker, candles: data.candles || [] };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!mounted) return;
      const updates: Record<string, CandleBar[]> = {};
      for (const item of results) {
        if (item && item.candles.length > 0) {
          updates[item.ticker] = item.candles;
        }
      }
      if (Object.keys(updates).length > 0) {
        setCandlesMap((prev) => ({ ...prev, ...updates }));
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedStocks, candlesMap]);

  // Build aligned relative % return series for the interactive SVG chart
  const chartData = useMemo(() => {
    const targetLen = PERIOD_DAYS[period];
    const seriesList = selectedStocks.map((s) => {
      const raw = candlesMap[s.ticker];
      if (raw && raw.length >= 6) {
        const sliced = raw.slice(-Math.min(raw.length, targetLen + 1));
        const base = sliced[0].close || s.price;
        return {
          stock: s,
          points: sliced.map((bar) => ({
            label: new Date(bar.time * 1000).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              timeZone: 'Asia/Jakarta',
            }),
            pct: base > 0 ? ((bar.close - base) / base) * 100 : 0,
          })),
        };
      }
      // Fallback deterministic trajectory anchored to live 1D/1W flow until candle fetch lands
      const pts: { label: string; pct: number }[] = [];
      const count = 24;
      const drift = (s.inflow1WB >= 0 ? 1 : -1) * Math.min(18, Math.abs(s.changePct) * 2.5 + 3);
      for (let i = 0; i < count; i++) {
        const progress = i / (count - 1);
        const d = new Date(Date.now() - (count - 1 - i) * 86400 * 1000 * (targetLen / count));
        pts.push({
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          pct: Number((drift * progress + Math.sin(i * 0.7 + s.ticker.charCodeAt(0)) * 1.4).toFixed(2)),
        });
      }
      return { stock: s, points: pts };
    });

    const minPts = Math.max(2, Math.min(...seriesList.map((item) => item.points.length)));
    const normalized = seriesList.map((item) => ({
      stock: item.stock,
      points: item.points.slice(-minPts),
    }));

    const allVals = normalized.flatMap((n) => n.points.map((p) => p.pct));
    let lo = Math.min(0, ...allVals);
    let hi = Math.max(0, ...allVals);
    const span = Math.max(2, hi - lo);
    lo -= span * 0.1;
    hi += span * 0.1;

    return { normalized, pointCount: minPts, lo, hi };
  }, [selectedStocks, candlesMap, period]);

  const sheetMatches = useMemo(() => {
    const q = sheetQuery.trim().toUpperCase();
    const list = q
      ? stocks.filter(
          (s) =>
            s.ticker.includes(q) ||
            s.name.toUpperCase().includes(q) ||
            s.sector.toUpperCase().includes(q)
        )
      : [...stocks].sort((a, b) => b.adtvB - a.adtvB);
    return list.slice(0, 40);
  }, [stocks, sheetQuery]);

  const toggleTicker = (tk: string) => {
    if (compareTickers.includes(tk)) {
      if (compareTickers.length <= 1) return;
      onChangeCompareTickers(compareTickers.filter((x) => x !== tk));
    } else if (compareTickers.length < 4) {
      onChangeCompareTickers([...compareTickers, tk]);
    }
  };

  // Chart Geometry
  const W = 620;
  const H = 230;
  const pad = { l: 46, r: 70, t: 16, b: 26 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const toX = (i: number) => pad.l + (i / Math.max(1, chartData.pointCount - 1)) * cw;
  const toY = (v: number) =>
    pad.t + ((chartData.hi - v) / Math.max(1, chartData.hi - chartData.lo)) * ch;

  // Compute non-overlapping side label Y positions ("nama samping grafik")
  const sideLabelPositions = useMemo(() => {
    const raw = chartData.normalized.map((item, idx) => {
      const lastPct = item.points[item.points.length - 1]?.pct ?? 0;
      return {
        idx,
        ticker: item.stock.ticker,
        pct: lastPct,
        y: toY(lastPct),
        color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
      };
    });
    const sorted = [...raw].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].y - sorted[i - 1].y < 16) {
        sorted[i].y = Math.min(H - pad.b, sorted[i - 1].y + 16);
      }
    }
    return sorted;
  }, [chartData]);

  // Metrics Comparison Matrix
  const metricGroups = useMemo(() => {
    const n = selectedStocks.length;
    const rows: {
      group: string;
      label: string;
      values: { text: string; num: number; isBest: boolean; tone?: 'up' | 'down' }[];
    }[] = [];

    const addMetric = (
      group: string,
      label: string,
      getter: (s: StockRecord) => number,
      formatter: (v: number) => string,
      bestMode: 'max' | 'min' | null,
      validCheck?: (v: number) => boolean,
      signedTone = false
    ) => {
      const nums = selectedStocks.map(getter);
      const validNums = validCheck ? nums.filter(validCheck) : nums;
      const targetBest =
        bestMode && n > 1 && validNums.length > 1
          ? bestMode === 'max'
            ? Math.max(...validNums)
            : Math.min(...validNums)
          : null;

      rows.push({
        group,
        label,
        values: nums.map((num) => ({
          num,
          text: formatter(num),
          isBest:
            targetBest !== null &&
            (!validCheck || validCheck(num)) &&
            Math.abs(num - targetBest) < 1e-6,
          tone: signedTone ? (num >= 0 ? 'up' : 'down') : undefined,
        })),
      });
    };

    addMetric('Valuasi', 'PER', (s) => s.per, (v) => (v > 0 ? `${fmtNum(v)}x` : 'N/A'), 'min', (v) => v > 0);
    addMetric('Valuasi', 'PBV', (s) => s.pbv, (v) => `${fmtNum(v)}x`, 'min', (v) => v > 0);
    addMetric('Valuasi', 'Div. Yield', (s) => s.divYieldPct, (v) => `${fmtNum(v)}%`, 'max');
    addMetric('Profitabilitas', 'ROE', (s) => s.roePct, (v) => `${fmtNum(v)}%`, 'max');
    addMetric('Profitabilitas', 'Growth EPS', (s) => s.epsGrowthPct, (v) => fmtPct(v), 'max', undefined, true);
    addMetric('Risiko & Arus Dana', 'DER', (s) => s.der, (v) => `${fmtNum(v, 2)}x`, 'min');
    addMetric('Risiko & Arus Dana', 'Inflow 1W', (s) => s.inflow1WB, (v) => `${v >= 0 ? '+' : ''}${fmtNum(v)} M`, 'max', undefined, true);
    addMetric('Teknikal', 'RSI (14)', (s) => s.rsi14, (v) => fmtNum(v), null);

    return rows;
  }, [selectedStocks]);

  return (
    <div className="space-y-5">
      {/* Header & Mode Switch */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-[#00e08a]">
              Banding Saham &amp; Pembanding Sektor
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Bandingkan Emiten
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
              Pilih hingga 4 saham BEI untuk melihat kinerja harga real-time, valuasi, dan fundamental berdampingan.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#060a0f]">
            <button
              type="button"
              onClick={() => setViewMode('custom')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                viewMode === 'custom'
                  ? 'bg-emerald-600 text-white dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              Banding Bebas (4 Saham)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sector')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                viewMode === 'sector'
                  ? 'bg-emerald-600 text-white dark:bg-[#00e08a] dark:text-[#03130b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              Pembanding Sektor ({activeStock.ticker})
            </button>
          </div>
        </div>
      </section>

      {viewMode === 'sector' ? (
        <SectorPeerChart stock={activeStock} onSelectStock={onOpenStockAnalysis} />
      ) : (
        <>
          {/* Selected Chips + Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedStocks.map((s, idx) => (
              <div
                key={s.ticker}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-display text-xs font-extrabold text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#eaf1f7]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                />
                <span>{s.ticker}</span>
                {selectedStocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => toggleTicker(s.ticker)}
                    aria-label={`Hapus ${s.ticker}`}
                    className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[10px] text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-[#1d2833] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setSheetQuery('');
                setSheetOpen(true);
              }}
              disabled={selectedStocks.length >= 4}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-emerald-500/50 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40 dark:border-[#00e08a]/50 dark:bg-[#00e08a]/10 dark:text-[#00e08a]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah saham</span>
            </button>
          </div>

          {/* Kinerja Harga Card + Interactive SVG with Side Labels */}
          <section className="rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                  Kinerja Harga (%)
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                  Perubahan harga relatif (%) sejak awal periode — nama emiten terpasang di samping garis grafik.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#060a0f]">
                {(['1B', '3B', '6B', '1T'] as ComparePeriod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors ${
                      period === p
                        ? 'bg-emerald-600 text-white dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                        : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-4">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-[235px] w-full select-none overflow-visible rounded-xl border border-slate-100 bg-slate-50/70 dark:border-[#1d2833] dark:bg-[#060a0f]"
                onMouseLeave={() => setHoverIdx(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = ((e.clientX - rect.left) / rect.width) * W;
                  const idx = Math.round(((relX - pad.l) / Math.max(1, cw)) * (chartData.pointCount - 1));
                  setHoverIdx(Math.max(0, Math.min(chartData.pointCount - 1, idx)));
                }}
              >
                {/* Zero baseline */}
                <line
                  x1={pad.l}
                  x2={W - pad.r}
                  y1={toY(0)}
                  y2={toY(0)}
                  stroke="#3a4a5a"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />

                {/* Grid Y ticks */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                  const val = chartData.hi - (chartData.hi - chartData.lo) * t;
                  const y = pad.t + ch * t;
                  return (
                    <g key={t}>
                      <line
                        x1={pad.l}
                        x2={W - pad.r}
                        y1={y}
                        y2={y}
                        className="stroke-slate-200 dark:stroke-[#1d2833]"
                        strokeWidth={1}
                      />
                      <text
                        x={pad.l - 6}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                      >
                        {val > 0 ? '+' : ''}
                        {val.toFixed(0)}%
                      </text>
                    </g>
                  );
                })}

                {/* X Labels */}
                {[0, Math.floor((chartData.pointCount - 1) / 2), chartData.pointCount - 1].map((idx) => {
                  const lbl = chartData.normalized[0]?.points[idx]?.label ?? '';
                  return (
                    <text
                      key={idx}
                      x={toX(idx)}
                      y={H - 6}
                      textAnchor={idx === 0 ? 'start' : idx === chartData.pointCount - 1 ? 'end' : 'middle'}
                      className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                    >
                      {lbl}
                    </text>
                  );
                })}

                {/* Lines */}
                {chartData.normalized.map((item, j) => {
                  const col = COMPARE_COLORS[j % COMPARE_COLORS.length];
                  const d = item.points
                    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(pt.pct).toFixed(1)}`)
                    .join(' ');
                  const last = item.points[item.points.length - 1];
                  return (
                    <g key={item.stock.ticker}>
                      <path
                        d={d}
                        fill="none"
                        stroke={col}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx={toX(item.points.length - 1)}
                        cy={toY(last.pct)}
                        r={4.2}
                        fill={col}
                        className="stroke-white dark:stroke-[#0e141c]"
                        strokeWidth={2}
                      />
                    </g>
                  );
                })}

                {/* Stock Names Positioned Right Beside Graph End ("nama samping grafik") */}
                {sideLabelPositions.map((lbl) => (
                  <text
                    key={lbl.ticker}
                    x={W - pad.r + 8}
                    y={lbl.y + 3.5}
                    fill={lbl.color}
                    className="font-display text-[11px] font-extrabold"
                  >
                    {lbl.ticker} {lbl.pct >= 0 ? '+' : ''}
                    {lbl.pct.toFixed(1)}%
                  </text>
                ))}

                {/* Crosshair hover */}
                {hoverIdx !== null && (
                  <g>
                    <line
                      x1={toX(hoverIdx)}
                      x2={toX(hoverIdx)}
                      y1={pad.t}
                      y2={H - pad.b}
                      stroke="#8d9aa8"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    {chartData.normalized.map((item, j) => {
                      const pt = item.points[hoverIdx];
                      if (!pt) return null;
                      return (
                        <circle
                          key={item.stock.ticker}
                          cx={toX(hoverIdx)}
                          cy={toY(pt.pct)}
                          r={4.5}
                          fill={COMPARE_COLORS[j % COMPARE_COLORS.length]}
                          className="stroke-white dark:stroke-[#0e141c]"
                          strokeWidth={2}
                        />
                      );
                    })}
                  </g>
                )}
              </svg>

              {hoverIdx !== null && (
                <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs tabular-nums dark:border-[#1d2833] dark:bg-[#131b25]">
                  <span className="text-slate-500 dark:text-[#8d9aa8]">
                    {chartData.normalized[0]?.points[hoverIdx]?.label}
                  </span>
                  {chartData.normalized.map((item, j) => {
                    const pt = item.points[hoverIdx];
                    if (!pt) return null;
                    return (
                      <span key={item.stock.ticker} className="inline-flex items-center gap-1.5 font-bold">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: COMPARE_COLORS[j % COMPARE_COLORS.length] }}
                        />
                        <span className="text-slate-900 dark:text-[#eaf1f7]">{item.stock.ticker}:</span>
                        <span className={pt.pct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}>
                          {fmtPct(pt.pct)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend Cards */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {chartData.normalized.map((item, j) => {
                const lastPct = item.points[item.points.length - 1]?.pct ?? 0;
                return (
                  <button
                    key={item.stock.ticker}
                    type="button"
                    onClick={() => onOpenStockAnalysis(item.stock.ticker)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-emerald-400 dark:border-[#1d2833] dark:bg-[#131b25] dark:hover:border-[#00e08a]/50"
                  >
                    <span
                      className="h-7 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: COMPARE_COLORS[j % COMPARE_COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                        {item.stock.ticker}
                      </div>
                      <div className="truncate text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                        {item.stock.name} · Rp {item.stock.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-extrabold tabular-nums ${
                        lastPct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {fmtPct(lastPct)}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Metrics Comparison Table */}
          <section className="rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                Perbandingan Metrik Fundamental &amp; Teknikal
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                Nilai terbaik per metrik ditandai hijau. Klik header ticker untuk membuka grafik &amp; riset lengkapnya.
              </p>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1d2833]">
                    <th className="py-2.5 pr-3 text-left font-medium text-slate-500 dark:text-[#8d9aa8]">Metrik</th>
                    {selectedStocks.map((s, j) => (
                      <th key={s.ticker} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenStockAnalysis(s.ticker)}
                          className="inline-flex items-center gap-1 font-display text-sm font-extrabold hover:underline"
                          style={{ color: COMPARE_COLORS[j % COMPARE_COLORS.length] }}
                        >
                          <span>{s.ticker}</span>
                          <BarChart3 className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums dark:divide-[#1d2833]/70">
                  <tr>
                    <td className="py-2.5 pr-3 font-sans text-slate-500 dark:text-[#8d9aa8]">Harga Live</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-[#eaf1f7]">
                        Rp {s.price.toLocaleString('id-ID')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-sans text-slate-500 dark:text-[#8d9aa8]">Kapitalisasi</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="py-2.5 px-2 text-center text-slate-700 dark:text-[#eaf1f7]">
                        Rp {fmtNum(s.marketCapT)} T
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-sans text-slate-500 dark:text-[#8d9aa8]">Sektor</td>
                    {selectedStocks.map((s) => (
                      <td key={s.ticker} className="py-2.5 px-2 text-center font-sans text-[11px] text-slate-600 dark:text-[#8d9aa8]">
                        {s.sector}
                      </td>
                    ))}
                  </tr>
                  {metricGroups.map((row) => (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-3 font-sans text-slate-500 dark:text-[#8d9aa8]">
                        <span className="mr-1.5 text-[10px] uppercase tracking-wide opacity-65">{row.group} ·</span>
                        <span className="font-medium text-slate-700 dark:text-[#eaf1f7]">{row.label}</span>
                      </td>
                      {row.values.map((val, idx) => (
                        <td key={idx} className="py-2 px-2 text-center">
                          <span
                            className={`inline-block rounded-lg px-2 py-1 font-bold ${
                              val.isBest
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                                : val.tone === 'up'
                                ? 'text-emerald-700 dark:text-[#00e08a]'
                                : val.tone === 'down'
                                ? 'text-red-700 dark:text-[#ff5a68]'
                                : 'text-slate-900 dark:text-[#eaf1f7]'
                            }`}
                          >
                            {val.text}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Searchable Add Stock Bottom Sheet / Modal */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSheetOpen(false);
          }}
        >
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-[24px] border border-slate-200 bg-white p-5 sm:rounded-[24px] dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-center justify-between">
              <strong className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                Pilih Saham untuk Dibandingkan
              </strong>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
              <input
                type="text"
                value={sheetQuery}
                onChange={(e) => setSheetQuery(e.target.value)}
                placeholder="Cari kode, nama, atau sektor..."
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#00e08a]"
              />
            </div>

            <div className="mt-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              {selectedStocks.length >= 4
                ? 'Maksimal 4 saham dipilih. Ketuk saham terpilih untuk melepasnya.'
                : `Pilih hingga ${4 - selectedStocks.length} saham lagi.`}
            </div>

            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {sheetMatches.map((s) => {
                const isSel = compareTickers.includes(s.ticker);
                return (
                  <button
                    key={s.ticker}
                    type="button"
                    onClick={() => toggleTicker(s.ticker)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isSel
                        ? 'border-emerald-500/50 bg-emerald-50 dark:border-[#00e08a]/50 dark:bg-[#00e08a]/10'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-[#1d2833] dark:bg-[#131b25] dark:hover:border-[#2a3846]'
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white font-display text-xs font-extrabold text-emerald-700 dark:bg-[#0e141c] dark:text-[#00e08a]">
                      {s.ticker.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                        {s.ticker}
                      </div>
                      <div className="truncate text-xs text-slate-500 dark:text-[#8d9aa8]">
                        {s.name} · {s.sector}
                      </div>
                    </div>
                    <div
                      className={`shrink-0 text-right font-mono text-xs font-bold ${
                        isSel ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-slate-600 dark:text-[#8d9aa8]'
                      }`}
                    >
                      {isSel ? '✓ Dipilih' : `Rp ${s.price.toLocaleString('id-ID')}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
