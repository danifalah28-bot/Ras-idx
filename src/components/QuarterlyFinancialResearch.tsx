import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import type { QuarterlyResearchResponse, StockRecord } from '../types/market';

interface QuarterlyFinancialResearchProps {
  stock: StockRecord;
}

type ChartViewMode = 'revenue_profit' | 'margins_roe' | 'cashflow_eps';

export function QuarterlyFinancialResearch({ stock }: QuarterlyFinancialResearchProps) {
  const [data, setData] = useState<QuarterlyResearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartViewMode>('revenue_profit');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const [aiReport, setAiReport] = useState<{
    analysis: string;
    modelUsed: string;
    sources: { title: string; uri: string }[];
    updatedAt: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadQuarterly = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(stock.ticker)}/quarterly`);
      if (!res.ok) {
        throw new Error('Gagal memuat laporan keuangan kuartalan.');
      }
      const json = (await res.json()) as QuarterlyResearchResponse;
      setData(json);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data kuartalan.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setAiReport(null);
    setAiError(null);
    setHoveredIdx(null);
    loadQuarterly(false);
    const interval = setInterval(() => {
      loadQuarterly(true);
    }, 90_000);
    return () => clearInterval(interval);
  }, [stock.ticker]);

  const runAiQuarterlyResearch = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(stock.ticker)}/quarterly/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = (await res.json()) as {
        analysis?: string;
        modelUsed?: string;
        sources?: { title: string; uri: string }[];
        updatedAt?: string;
        error?: string;
      };
      if (!res.ok) {
        setAiError(json.error || 'Gagal menyusun riset kuartalan AI.');
      } else if (json.analysis) {
        setAiReport({
          analysis: json.analysis,
          modelUsed: json.modelUsed || 'gemini-4-hydrogen',
          sources: json.sources || [],
          updatedAt: json.updatedAt || new Date().toISOString(),
        });
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Kesalahan jaringan.');
    } finally {
      setAiLoading(false);
    }
  };

  const quarters = data?.quarters ?? [];
  const activeQuarter =
    hoveredIdx !== null && quarters[hoveredIdx]
      ? quarters[hoveredIdx]
      : quarters.length > 0
      ? quarters[quarters.length - 1]
      : null;

  const maxRev = Math.max(...quarters.map((q) => Math.max(q.revenueT, Math.abs(q.netProfitT))), 0.1);
  const maxPct = Math.max(...quarters.map((q) => Math.max(q.grossMarginPct, Math.abs(q.netMarginPct), Math.abs(q.roePct))), 10);
  const maxCash = Math.max(...quarters.map((q) => Math.max(Math.abs(q.operatingCashFlowT), Math.abs(q.freeCashFlowT))), 0.1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#1d2833]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
            <span>Riset Keuangan Per Kuartal</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-medium text-slate-700 dark:text-[#cbd5e1]">{stock.ticker}</span>
            <span aria-hidden="true">·</span>
            <span>{quarters.length || 8} Kuartal Terakhir (TTM &amp; YoY)</span>
            {data && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-semibold ${
                    data.source === 'live-yahoo'
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-amber-700 dark:text-[#f5a524]'
                  }`}
                >
                  {data.source === 'live-yahoo' ? 'Laporan Aktual Live' : 'Model Estimasi TTM'}
                </span>
              </>
            )}
            {data?.financialCurrency && data.financialCurrency !== 'IDR' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-700 dark:text-[#f5a524]">
                  {data.financialCurrency}→IDR (Rp {data.usdIdrRateUsed?.toLocaleString('id-ID')})
                </span>
              </>
            )}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">
            Tren Pendapatan, Laba, Margin & Arus Kas Kuartalan {stock.ticker}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
            {(
              [
                { id: 'revenue_profit', label: 'Pendapatan & Laba' },
                { id: 'margins_roe', label: 'Margin & ROE' },
                { id: 'cashflow_eps', label: 'Arus Kas & EPS' },
              ] as { id: ChartViewMode; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartMode(tab.id)}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  chartMode === tab.id
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
            onClick={runAiQuarterlyResearch}
            disabled={aiLoading || loading}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 py-1.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {aiLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{aiLoading ? 'Menganalisis...' : 'Analisis Kuartalan AI'}</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
          Memuat riset laporan keuangan per kuartal {stock.ticker}...
        </div>
      ) : error ? (
        <div className="py-10 text-center text-xs text-red-700 dark:text-[#ff5a68]">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadQuarterly(false)}
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-100 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff5a68]"
          >
            Muat Ulang
          </button>
        </div>
      ) : data ? (
        <div className="mt-5 space-y-6">
          {/* 4-Column TTM Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Pendapatan TTM (4 Kuartal)</div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                <span className="text-xl font-bold text-slate-900 dark:text-[#eaf1f7]">
                  Rp {data.ttmRevenueT.toFixed(2)} T
                </span>
                <span
                  className={`text-xs font-semibold ${
                    data.yoyRevenueGrowthPct >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {data.yoyRevenueGrowthPct >= 0 ? '+' : ''}
                  {data.yoyRevenueGrowthPct.toFixed(1)}% YoY
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Laba Bersih TTM (4 Kuartal)</div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                <span
                  className={`text-xl font-bold ${
                    data.ttmNetProfitT >= 0 ? 'text-slate-900 dark:text-[#eaf1f7]' : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  Rp {data.ttmNetProfitT.toFixed(2)} T
                </span>
                <span
                  className={`text-xs font-semibold ${
                    data.yoyProfitGrowthPct >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {data.yoyProfitGrowthPct >= 0 ? '+' : ''}
                  {data.yoyProfitGrowthPct.toFixed(1)}% YoY
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Tren Margin Bersih</div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                <span
                  className={`text-xl font-bold ${
                    data.marginTrend === 'Ekspansi'
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : data.marginTrend === 'Tertekan'
                      ? 'text-red-700 dark:text-[#ff5a68]'
                      : 'text-slate-900 dark:text-[#eaf1f7]'
                  }`}
                >
                  {data.marginTrend}
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-[#8d9aa8]">
                  {quarters[quarters.length - 1]?.netMarginPct.toFixed(1)}% NPM
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-[#1d2833] dark:bg-[#0b1219]">
              <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Kualitas Laba (OCF / Laba)</div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                <span
                  className={`text-xl font-bold ${
                    data.earningsQualityRatio >= 1
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-amber-700 dark:text-[#f5a524]'
                  }`}
                >
                  {data.earningsQualityRatio.toFixed(2)}x
                </span>
                <span className="font-sans text-xs text-slate-600 dark:text-[#8d9aa8]">
                  {data.earningsQualityRatio >= 1 ? 'Kas Kuat' : 'Moderat'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Quarterly Grouped Bar Chart + Readout */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            {activeQuarter && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs dark:border-[#1d2833]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-[#eaf1f7]">
                    {activeQuarter.quarter} ({activeQuarter.periodLabel})
                  </span>
                  {chartMode === 'revenue_profit' && (
                    <>
                      <span className="text-slate-700 dark:text-[#cbd5e1]">
                        Pendapatan: <strong>Rp {activeQuarter.revenueT.toFixed(2)} T</strong>
                      </span>
                      <span className="text-amber-700 dark:text-[#f5a524]">
                        Laba Bersih: <strong>Rp {activeQuarter.netProfitT.toFixed(2)} T</strong>
                      </span>
                      <span
                        className={
                          activeQuarter.netProfitYoYPct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }
                      >
                        YoY Laba: {activeQuarter.netProfitYoYPct >= 0 ? '+' : ''}
                        {activeQuarter.netProfitYoYPct.toFixed(1)}%
                      </span>
                    </>
                  )}
                  {chartMode === 'margins_roe' && (
                    <>
                      <span className="text-slate-700 dark:text-[#cbd5e1]">
                        Gross Margin: <strong>{activeQuarter.grossMarginPct.toFixed(1)}%</strong>
                      </span>
                      <span className="text-amber-700 dark:text-[#f5a524]">
                        Net Margin: <strong>{activeQuarter.netMarginPct.toFixed(1)}%</strong>
                      </span>
                      <span className="text-emerald-700 dark:text-[#00e08a]">
                        ROE: <strong>{activeQuarter.roePct.toFixed(1)}%</strong>
                      </span>
                    </>
                  )}
                  {chartMode === 'cashflow_eps' && (
                    <>
                      <span className="text-slate-700 dark:text-[#cbd5e1]">
                        OCF: <strong>Rp {activeQuarter.operatingCashFlowT.toFixed(2)} T</strong>
                      </span>
                      <span className="text-amber-700 dark:text-[#f5a524]">
                        FCF: <strong>Rp {activeQuarter.freeCashFlowT.toFixed(2)} T</strong>
                      </span>
                      <span className="text-emerald-700 dark:text-[#00e08a]">
                        EPS: <strong>Rp {activeQuarter.epsIdr.toFixed(1)}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-[#8d9aa8]">
                  {chartMode === 'revenue_profit' && (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-slate-800 dark:bg-[#cbd5e1]" />
                        Pendapatan
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-amber-600 dark:bg-[#f5a524]" />
                        Laba Bersih
                      </span>
                    </>
                  )}
                  {chartMode === 'margins_roe' && (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-slate-800 dark:bg-[#cbd5e1]" />
                        Gross Margin %
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-amber-600 dark:bg-[#f5a524]" />
                        Net Margin %
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-[#00e08a]" />
                        ROE %
                      </span>
                    </>
                  )}
                  {chartMode === 'cashflow_eps' && (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-slate-800 dark:bg-[#cbd5e1]" />
                        Operating CF (T)
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-amber-600 dark:bg-[#f5a524]" />
                        Free Cash Flow (T)
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <div
                className="grid gap-2 sm:gap-3 pt-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(2, quarters.length)}, minmax(78px, 1fr))`,
                }}
              >
              {quarters.map((q, idx) => {
                const isActive = hoveredIdx === idx || (hoveredIdx === null && idx === quarters.length - 1);

                let barA = 0;
                let barB = 0;
                let barC = 0;

                if (chartMode === 'revenue_profit') {
                  barA = Math.max(8, Math.round((q.revenueT / maxRev) * 100));
                  barB = Math.max(6, Math.round((Math.abs(q.netProfitT) / maxRev) * 100));
                } else if (chartMode === 'margins_roe') {
                  barA = Math.max(8, Math.round((q.grossMarginPct / maxPct) * 100));
                  barB = Math.max(6, Math.round((Math.abs(q.netMarginPct) / maxPct) * 100));
                  barC = Math.max(6, Math.round((Math.abs(q.roePct) / maxPct) * 100));
                } else {
                  barA = Math.max(8, Math.round((Math.abs(q.operatingCashFlowT) / maxCash) * 100));
                  barB = Math.max(6, Math.round((Math.abs(q.freeCashFlowT) / maxCash) * 100));
                }

                return (
                  <button
                    key={q.quarter}
                    type="button"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onFocus={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                    className={`flex flex-col items-center rounded-lg p-1.5 transition-colors ${
                      isActive
                        ? 'bg-slate-50 ring-1 ring-slate-200 dark:bg-[#131b25] dark:ring-[#2a3544]'
                        : 'hover:bg-slate-50/70 dark:hover:bg-[#131b25]/60'
                    }`}
                  >
                    <div className="flex h-36 w-full items-end justify-center gap-1 px-0.5">
                      <div
                        className="w-3 sm:w-4 rounded-t-xs bg-slate-800 transition-all duration-300 dark:bg-[#cbd5e1]"
                        style={{ height: `${barA}%` }}
                      />
                      <div
                        className={`w-3 sm:w-4 rounded-t-xs transition-all duration-300 ${
                          (chartMode === 'revenue_profit' && q.netProfitT < 0) ||
                          (chartMode === 'cashflow_eps' && q.freeCashFlowT < 0)
                            ? 'bg-red-500 dark:bg-[#ff5a68]'
                            : 'bg-amber-600 dark:bg-[#f5a524]'
                        }`}
                        style={{ height: `${barB}%` }}
                      />
                      {chartMode === 'margins_roe' && (
                        <div
                          className={`w-2.5 sm:w-3.5 rounded-t-xs transition-all duration-300 ${
                            q.roePct < 0 ? 'bg-red-500 dark:bg-[#ff5a68]' : 'bg-emerald-600 dark:bg-[#00e08a]'
                          }`}
                          style={{ height: `${barC}%` }}
                        />
                      )}
                    </div>
                    <div className="mt-2 font-mono text-[11px] font-semibold text-slate-800 tabular-nums whitespace-nowrap dark:text-[#eaf1f7]">
                      {q.quarter}
                    </div>
                    <div
                      className={`font-mono text-[10px] tabular-nums whitespace-nowrap ${
                        q.netProfitYoYPct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {q.netProfitYoYPct >= 0 ? '+' : ''}
                      {q.netProfitYoYPct.toFixed(0)}% YoY
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          {/* High-Density 8-Quarter Financial Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#1d2833]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#8d9aa8]">
                  <th className="py-2.5 px-3 whitespace-nowrap">Kuartal</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Pendapatan</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Rev YoY</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Laba Kotor</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Laba Bersih</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Laba YoY</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">QoQ</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Net Margin</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">ROE</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">DER</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">FCF</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">EPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums dark:divide-[#1d2833]">
                {quarters.map((q) => (
                  <tr key={q.quarter} className="hover:bg-slate-50 dark:hover:bg-[#131b25]">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 whitespace-nowrap dark:text-[#eaf1f7]">
                      <div>{q.quarter}</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-[#8d9aa8]">{q.periodLabel}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900 whitespace-nowrap dark:text-[#eaf1f7]">
                      Rp {q.revenueT.toFixed(2)} T
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-medium whitespace-nowrap ${
                        q.revenueYoYPct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {q.revenueYoYPct >= 0 ? '+' : ''}
                      {q.revenueYoYPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap dark:text-[#cbd5e1]">
                      Rp {q.grossProfitT.toFixed(2)} T
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${
                        q.netProfitT >= 0 ? 'text-slate-900 dark:text-[#eaf1f7]' : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      Rp {q.netProfitT.toFixed(2)} T
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-medium whitespace-nowrap ${
                        q.netProfitYoYPct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {q.netProfitYoYPct >= 0 ? '+' : ''}
                      {q.netProfitYoYPct.toFixed(1)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right whitespace-nowrap ${
                        q.netProfitQoQPct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {q.netProfitQoQPct >= 0 ? '+' : ''}
                      {q.netProfitQoQPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 whitespace-nowrap dark:text-[#eaf1f7]">
                      {q.netMarginPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 whitespace-nowrap dark:text-[#eaf1f7]">
                      {q.roePct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap dark:text-[#cbd5e1]">
                      {q.der.toFixed(2)}x
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right whitespace-nowrap ${
                        q.freeCashFlowT >= 0 ? 'text-amber-700 dark:text-[#f5a524]' : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      Rp {q.freeCashFlowT.toFixed(2)} T
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 whitespace-nowrap dark:text-[#eaf1f7]">
                      Rp {q.epsIdr.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analytical Summary */}
          <p className="text-sm leading-relaxed text-slate-700 dark:text-[#cbd5e1]">{data.summary}</p>

          {/* Optional On-Demand Gemini Quarterly AI Analysis */}
          {aiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff5a68]">
              {aiError}
            </div>
          )}

          {aiReport && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-[#f5a524]/35 dark:bg-[#f5a524]/10">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5 text-xs dark:border-[#f5a524]/25">
                <span className="font-semibold text-amber-900 dark:text-[#f5a524]">
                  Ringkasan Riset Kuartalan AI ({aiReport.modelUsed})
                </span>
                <span className="text-slate-500 dark:text-[#8d9aa8]">
                  Diperbarui:{' '}
                  {new Date(aiReport.updatedAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </span>
              </div>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-[#eaf1f7]">
                {aiReport.analysis}
              </div>
              {aiReport.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-amber-200/70 pt-3 dark:border-[#f5a524]/25">
                  {aiReport.sources.slice(0, 4).map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline max-w-[260px] truncate dark:text-[#f5a524]"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
