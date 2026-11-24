import React, { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw, Sparkles } from 'lucide-react';
import type { PeerComparisonResponse, StockRecord } from '../types/market';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';

interface SectorPeerChartProps {
  stock: StockRecord;
  onSelectStock: (ticker: string) => void;
}

export function SectorPeerChart({ stock, onSelectStock }: SectorPeerChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M'>('1D');
  const [mode, setMode] = useState<'pct' | 'price'>('pct');
  const [data, setData] = useState<PeerComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hiddenTickers, setHiddenTickers] = useState<Set<string>>(new Set());
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const fetchPeers = async (tf: '1D' | '5D' | '1M', silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(stock.ticker)}/peers?timeframe=${tf}`);
      if (res.ok) {
        const json = (await res.json()) as PeerComparisonResponse;
        setData(json);
      }
    } catch {
      // Keep existing peer comparison chart on transient fetch error
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setHiddenTickers(new Set());
    setAiExplanation('');
    setAiError('');
    fetchPeers(timeframe, false);
    const interval = setInterval(() => {
      fetchPeers(timeframe, true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [stock.ticker, timeframe]);

  // Keep latest point of primary stock synced in real time when live SSE ticks update `stock.price`
  const syncedPeers = useMemo(() => {
    if (!data) return [];
    return data.peers.map((peer) => {
      if (peer.ticker !== stock.ticker || peer.points.length === 0) return peer;
      const updatedPoints = [...peer.points];
      const last = updatedPoints[updatedPoints.length - 1];
      const baseRef =
        timeframe === '1D'
          ? stock.prevClose || peer.points[0]?.price || last.price
          : peer.points[0]?.price || stock.prevClose || last.price;
      updatedPoints[updatedPoints.length - 1] = {
        ...last,
        price: stock.price,
        pctChange:
          timeframe === '1D'
            ? stock.changePct
            : Number((((stock.price - baseRef) / Math.max(1, baseRef)) * 100).toFixed(2)),
      };
      return {
        ...peer,
        currentPrice: stock.price,
        changePct: stock.changePct,
        points: updatedPoints,
      };
    });
  }, [data, stock.ticker, stock.price, stock.changePct, stock.prevClose, timeframe]);

  const visiblePeers = useMemo(
    () => syncedPeers.filter((p) => !hiddenTickers.has(p.ticker)),
    [syncedPeers, hiddenTickers]
  );

  const togglePeer = (ticker: string) => {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else if (visiblePeers.length > 1) {
        next.add(ticker);
      }
      return next;
    });
  };

  const runGeminiExplanation = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/research/peer-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: stock.ticker }),
      });
      const json = (await res.json()) as { explanation?: string; error?: string };
      if (!res.ok) {
        setAiError(json.error || 'Gagal memuat analisis Gemini.');
      } else {
        setAiExplanation(json.explanation || '');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Kesalahan jaringan.');
    } finally {
      setAiLoading(false);
    }
  };

  // SVG Coordinate Math
  const svgW = 860;
  const svgH = 340;
  const padL = 62;
  const padR = 24;
  const padT = 20;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const { minVal, maxVal, maxLen } = useMemo(() => {
    if (visiblePeers.length === 0) return { minVal: -2, maxVal: 2, maxLen: 10 };
    let min = Infinity;
    let max = -Infinity;
    let len = 0;

    for (const peer of visiblePeers) {
      len = Math.max(len, peer.points.length);
      for (const pt of peer.points) {
        const val = mode === 'pct' ? pt.pctChange : pt.price;
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    if (mode === 'price' && data && !hiddenTickers.has(stock.ticker)) {
      min = Math.min(min, data.supportResistance.s1 * 0.99);
      max = Math.max(max, data.supportResistance.r1 * 1.01);
    }

    if (min === max) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.1;
    return { minVal: min - pad, maxVal: max + pad, maxLen: Math.max(2, len) };
  }, [visiblePeers, mode, data, hiddenTickers, stock.ticker]);

  const toX = (i: number, total: number) => padL + (i / Math.max(1, total - 1)) * plotW;
  const toY = (val: number) => padT + ((maxVal - val) / Math.max(0.0001, maxVal - minVal)) * plotH;

  const yTicks = Array.from({ length: 5 }, (_, idx) => {
    const ratio = idx / 4;
    const val = maxVal - ratio * (maxVal - minVal);
    return { val, y: padT + ratio * plotH };
  });

  const referenceLabels = visiblePeers[0]?.points ?? [];
  const activeHoverIdx =
    hoverIdx !== null && referenceLabels.length > 0
      ? Math.min(hoverIdx, referenceLabels.length - 1)
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        {/* Header Controls */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span>{stock.sector}</span>
              <span aria-hidden="true">·</span>
              <span>Sub-sektor {stock.subSector}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-[#00e08a]">
                <Activity className="h-3.5 w-3.5" />
                Stream Real-Time Aktif
              </span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-[#eaf1f7]">
              Grafik Perbandingan Perusahaan Sejenis ({stock.ticker} vs Kompetitor)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
              {(['pct', 'price'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    mode === m
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {m === 'pct' ? 'Performa %' : 'Harga (IDR)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
              {(['1D', '5D', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    timeframe === tf
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fetchPeers(timeframe)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {syncedPeers.map((peer) => {
              const hidden = hiddenTickers.has(peer.ticker);
              return (
                <button
                  key={peer.ticker}
                  type="button"
                  onClick={() => togglePeer(peer.ticker)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity ${
                    hidden
                      ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-60 dark:border-[#1d2833] dark:bg-[#0b1219]/60 dark:text-[#8d9aa8]'
                      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: peer.color }} />
                  <span className="font-mono font-semibold">{peer.ticker}</span>
                  <span
                    className={`font-mono tabular-nums ${
                      peer.changePct >= 0
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : 'text-red-700 dark:text-[#ff5a68]'
                    }`}
                  >
                    {peer.changePct >= 0 ? '+' : ''}
                    {peer.changePct.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>

          <SupportResistanceLampBadge status={stock.lampStatus} compact />
        </div>

        {/* SVG Chart */}
        <div className="relative mt-4 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-[#1d2833] dark:bg-[#0b1219]">
          {loading && !data ? (
            <div className="flex h-[340px] items-center justify-center text-sm text-slate-500 dark:text-[#8d9aa8]">
              Memuat data perbandingan sektor real-time...
            </div>
          ) : (
            <div className="relative">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="h-auto w-full select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = ((e.clientX - rect.left) / rect.width) * svgW;
                  const ratio = Math.max(0, Math.min(1, (relX - padL) / plotW));
                  const idx = Math.round(ratio * (maxLen - 1));
                  setHoverIdx(idx);
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {/* Horizontal Gridlines & Y Axis Labels */}
                {yTicks.map((t, i) => (
                  <g key={i}>
                    <line
                      x1={padL}
                      y1={t.y}
                      x2={svgW - padR}
                      y2={t.y}
                      className="stroke-slate-200 dark:stroke-[#1d2833]"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 8}
                      y={t.y + 4}
                      textAnchor="end"
                      className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                    >
                      {mode === 'pct'
                        ? `${t.val >= 0 ? '+' : ''}${t.val.toFixed(2)}%`
                        : `${Math.round(t.val).toLocaleString('id-ID')}`}
                    </text>
                  </g>
                ))}

                {/* Zero Baseline in % Mode */}
                {mode === 'pct' && minVal < 0 && maxVal > 0 && (
                  <line
                    x1={padL}
                    y1={toY(0)}
                    x2={svgW - padR}
                    y2={toY(0)}
                    className="stroke-slate-400 dark:stroke-[#2a3544]"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                )}

                {/* Support & Resistance Lines in Price Mode */}
                {mode === 'price' && data && !hiddenTickers.has(stock.ticker) && (
                  <>
                    <line
                      x1={padL}
                      y1={toY(data.supportResistance.r1)}
                      x2={svgW - padR}
                      y2={toY(data.supportResistance.r1)}
                      stroke="#16A34A"
                      strokeDasharray="5 4"
                      strokeWidth="1.25"
                    />
                    <text
                      x={svgW - padR - 4}
                      y={toY(data.supportResistance.r1) - 5}
                      textAnchor="end"
                      className="fill-emerald-700 font-mono text-[10px] font-semibold dark:fill-[#00e08a]"
                    >
                      R1 Rp {data.supportResistance.r1.toLocaleString('id-ID')}
                    </text>

                    <line
                      x1={padL}
                      y1={toY(data.supportResistance.s1)}
                      x2={svgW - padR}
                      y2={toY(data.supportResistance.s1)}
                      stroke="#D97706"
                      strokeDasharray="5 4"
                      strokeWidth="1.25"
                    />
                    <text
                      x={svgW - padR - 4}
                      y={toY(data.supportResistance.s1) + 12}
                      textAnchor="end"
                      className="fill-amber-700 font-mono text-[10px] font-semibold dark:fill-[#f5a524]"
                    >
                      S1 Rp {data.supportResistance.s1.toLocaleString('id-ID')}
                    </text>
                  </>
                )}

                {/* Peer Series Polylines */}
                {visiblePeers.map((peer) => {
                  const pts = peer.points
                    .map((pt, i) => {
                      const val = mode === 'pct' ? pt.pctChange : pt.price;
                      return `${toX(i, peer.points.length).toFixed(1)},${toY(val).toFixed(1)}`;
                    })
                    .join(' ');
                  const lastPt = peer.points[peer.points.length - 1];
                  const lastVal = lastPt ? (mode === 'pct' ? lastPt.pctChange : lastPt.price) : 0;
                  const isPrimary = peer.ticker === stock.ticker;

                  return (
                    <g key={peer.ticker}>
                      <polyline
                        fill="none"
                        stroke={peer.color}
                        strokeWidth={isPrimary ? '2.75' : '1.75'}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity={isPrimary ? 1 : 0.8}
                        points={pts}
                      />
                      {lastPt && (
                        <circle
                          cx={toX(peer.points.length - 1, peer.points.length)}
                          cy={toY(lastVal)}
                          r={isPrimary ? 4.5 : 3}
                          fill={peer.color}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Time Labels */}
                {referenceLabels.length > 1 &&
                  [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const idx = Math.round(ratio * (referenceLabels.length - 1));
                    const pt = referenceLabels[idx];
                    if (!pt) return null;
                    return (
                      <text
                        key={i}
                        x={toX(idx, referenceLabels.length)}
                        y={svgH - 10}
                        textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}
                        className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                      >
                        {pt.label}
                      </text>
                    );
                  })}

                {/* Hover Crosshair */}
                {activeHoverIdx !== null && (
                  <line
                    x1={toX(activeHoverIdx, referenceLabels.length)}
                    y1={padT}
                    x2={toX(activeHoverIdx, referenceLabels.length)}
                    y2={svgH - padB}
                    className="stroke-slate-900 dark:stroke-[#f5a524]"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}
              </svg>

              {/* Hover Tooltip Box */}
              {activeHoverIdx !== null && referenceLabels[activeHoverIdx] && (
                <div className="pointer-events-none absolute top-3 left-18 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-xs dark:border-[#1d2833] dark:bg-[#0e141c]/95">
                  <div className="font-mono text-[11px] font-semibold text-slate-500 dark:text-[#8d9aa8]">
                    {referenceLabels[activeHoverIdx].label} WIB
                  </div>
                  <div className="mt-1 space-y-1 font-mono text-xs tabular-nums">
                    {visiblePeers.map((peer) => {
                      const pt = peer.points[Math.min(activeHoverIdx, peer.points.length - 1)];
                      if (!pt) return null;
                      return (
                        <div key={peer.ticker} className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                            <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: peer.color }} />
                            {peer.ticker}
                          </span>
                          <span className="text-slate-700 dark:text-[#cbd5e1]">Rp {pt.price.toLocaleString('id-ID')}</span>
                          <span
                            className={
                              pt.pctChange >= 0
                                ? 'text-emerald-700 dark:text-[#00e08a]'
                                : 'text-red-700 dark:text-[#ff5a68]'
                            }
                          >
                            {pt.pctChange >= 0 ? '+' : ''}
                            {pt.pctChange.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accurate Explanation Panel */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#eaf1f7]">
                Penjelasan Akurat Pergerakan Sektor {stock.subSector}
              </h3>
              <button
                type="button"
                onClick={runGeminiExplanation}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 py-1.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{aiLoading ? 'Menganalisis...' : 'Analisis Akurat dengan Gemini'}</span>
              </button>
            </div>

            {data?.accurateSummary && (
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-[#cbd5e1]">{data.accurateSummary}</p>
            )}

            {aiError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff5a68]">
                {aiError}
              </div>
            )}

            {aiExplanation && (
              <div className="mt-4 border-t border-slate-200 pt-4 text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:border-[#1d2833] dark:text-[#eaf1f7]">
                {aiExplanation}
              </div>
            )}
          </div>

          {/* Peer Matrix Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#eaf1f7]">Matriks Kompetitor Sejenis</h3>
            <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">Klik baris emiten untuk memindahkan fokus analisis</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                    <th className="py-2 pr-2">Kode</th>
                    <th className="py-2 px-2 text-right">Harga</th>
                    <th className="py-2 px-2 text-right">1D %</th>
                    <th className="py-2 px-2 text-right">PER</th>
                    <th className="py-2 px-2 text-right">ROE</th>
                    <th className="py-2 pl-2 text-right">Flow 1W</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums dark:divide-[#1d2833]">
                  {syncedPeers.map((peer) => (
                    <tr
                      key={peer.ticker}
                      onClick={() => onSelectStock(peer.ticker)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25] ${
                        peer.ticker === stock.ticker ? 'bg-emerald-50/70 dark:bg-[#00e08a]/10' : ''
                      }`}
                    >
                      <td className="py-2.5 pr-2 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: peer.color }} />
                          {peer.ticker}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-800 dark:text-[#eaf1f7]">
                        {peer.currentPrice.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-semibold ${
                          peer.changePct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {peer.changePct >= 0 ? '+' : ''}
                        {peer.changePct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700 dark:text-[#cbd5e1]">
                        {peer.per > 0 ? `${peer.per.toFixed(1)}x` : 'Neg'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700 dark:text-[#cbd5e1]">{peer.roePct.toFixed(1)}%</td>
                      <td
                        className={`py-2.5 pl-2 text-right font-semibold ${
                          peer.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {peer.inflow1WB >= 0 ? '+' : ''}
                        {peer.inflow1WB.toFixed(1)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
