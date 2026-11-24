import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { CompanyOfficialSyncResponse, StockRecord } from '../types/market';
import { SupportResistancePanel } from './SupportResistanceLamp';
import { TradingViewCandlestickChart } from './TradingViewCandlestickChart';
import { QuarterlyFinancialResearch } from './QuarterlyFinancialResearch';
import { CompanyOfficialSyncPanel } from './CompanyOfficialSyncPanel';
import { MarketDepthPanel } from './MarketDepthPanel';

interface CompanyAnalysisProps {
  stock: StockRecord;
  officialSync: CompanyOfficialSyncResponse | null;
  officialSyncLoading: boolean;
  onRefreshOfficialSync: () => void;
  onNavigateTab: (tab: 'peers' | 'geopolitics') => void;
  isDark?: boolean;
}

export function CompanyAnalysis({
  stock,
  officialSync,
  officialSyncLoading,
  onRefreshOfficialSync,
  onNavigateTab,
  isDark = false,
}: CompanyAnalysisProps) {
  const maxDailyFlow = Math.max(...stock.flowHistory5D.map((v) => Math.abs(v)), 1);

  const financialRows = [
    {
      label: 'Pendapatan (Annualized)',
      value: `Rp ${stock.revenueT.toFixed(2)} T`,
      status: stock.revenueT > 0 ? 'Normal' : 'Lemah',
    },
    {
      label: 'Laba Bersih (Annualized)',
      value: `Rp ${stock.netProfitT.toFixed(2)} T`,
      status: stock.netProfitT > 0 ? 'Sehat' : 'Rugi',
    },
    {
      label: 'Return on Equity (ROE)',
      value: `${stock.roePct.toFixed(1)}%`,
      status: stock.roePct >= 15 ? 'Sangat Sehat' : stock.roePct >= 10 ? 'Sehat' : 'Moderat',
    },
    {
      label: 'Return on Assets (ROA)',
      value: `${stock.roaPct.toFixed(1)}%`,
      status: stock.roaPct >= 5 ? 'Sehat' : 'Moderat',
    },
    {
      label: 'Margin Laba Kotor / Bersih',
      value: `${stock.grossMarginPct.toFixed(1)}% / ${stock.netMarginPct.toFixed(1)}%`,
      status: stock.netMarginPct >= 10 ? 'Tinggi' : stock.netMarginPct > 0 ? 'Stabil' : 'Negatif',
    },
    {
      label: 'Debt to Equity Ratio (DER)',
      value: `${stock.der.toFixed(2)}x`,
      status: stock.der <= 0.8 ? 'Konservatif' : stock.der <= 1.5 ? 'Terkendali' : 'Tinggi',
    },
    {
      label: 'Current Ratio (Likuiditas Neraca)',
      value: `${stock.currentRatio.toFixed(2)}x`,
      status: stock.currentRatio >= 1.5 ? 'Likuid' : stock.currentRatio >= 1.0 ? 'Cukup' : 'Ketat',
    },
    {
      label: 'Free Cash Flow',
      value: `Rp ${stock.freeCashFlowT.toFixed(2)} T`,
      status: stock.freeCashFlowT > 0 ? 'Positif' : 'Negatif',
    },
  ];

  const valuationRows = [
    { label: 'Price to Earnings (PER)', value: stock.per > 0 ? `${stock.per.toFixed(1)}x` : 'Negatif' },
    { label: 'Price to Book Value (PBV)', value: `${stock.pbv.toFixed(2)}x` },
    { label: 'EV / EBITDA', value: stock.evEbitda > 0 ? `${stock.evEbitda.toFixed(1)}x` : 'N/A' },
    { label: 'Pertumbuhan EPS (YoY)', value: `${stock.epsGrowthPct >= 0 ? '+' : ''}${stock.epsGrowthPct.toFixed(1)}%` },
    { label: 'Dividend Yield', value: `${stock.divYieldPct.toFixed(1)}%` },
    { label: 'Kapitalisasi Pasar', value: `Rp ${stock.marketCapT.toFixed(1)} T` },
    ...(stock.sharesOutstandingB
      ? [{ label: 'Saham Beredar', value: `${stock.sharesOutstandingB.toFixed(2)} M lbr` }]
      : []),
    ...(stock.financialCurrency && stock.financialCurrency !== 'IDR'
      ? [{ label: 'Kurs Laporan Asli', value: `${stock.financialCurrency} → IDR` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Real-Time TradingView Candlestick Chart + Indicator Selector */}
      <TradingViewCandlestickChart stock={stock} isDark={isDark} />

      {/* Lampu Indikator Support & Resisten */}
      <SupportResistancePanel stock={stock} />

      {/* Kedalaman Pasar (Market Depth) & Tembok Bid/Offer */}
      <MarketDepthPanel stock={stock} />

      {/* 3-Column Analytical Breakdown: Keuangan, Likuiditas Pasar, Inflow/Outflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 1. Analisis Keuangan & Valuasi */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-3 dark:border-[#1d2833]">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">Kesehatan Keuangan & Valuasi</h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">Rasio profitabilitas, solvabilitas neraca, dan valuasi pasar</p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Status Fundamental</div>
              <div
                className={`text-sm font-semibold ${
                  stock.isHealthyFinancial
                    ? 'text-emerald-700 dark:text-[#00e08a]'
                    : 'text-amber-700 dark:text-[#ffb020]'
                }`}
              >
                {stock.isHealthyFinancial ? 'Keuangan Sehat' : 'Perlu Selektif'}
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100 text-sm dark:divide-[#1d2833]">
            {financialRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5">
                <span className="text-slate-600 dark:text-[#8d9aa8]">{row.label}</span>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="font-semibold text-slate-900 dark:text-[#eaf1f7]">{row.value}</span>
                  <span className="w-20 text-right text-xs text-slate-500 dark:text-[#8d9aa8]">{row.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-[#1d2833]">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-[#8d9aa8]">Kelipatan Valuasi & Kapitalisasi</h3>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {valuationRows.map((v) => (
                <div key={v.label} className="flex items-baseline justify-between border-b border-slate-100 pb-1.5 dark:border-[#1d2833]">
                  <span className="text-xs text-slate-500 dark:text-[#8d9aa8]">{v.label}</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Likuiditas Saham & Kedalaman Order */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-3 flex flex-col justify-between dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div>
            <div className="border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">Likuiditas Saham</h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">Daya serap transaksi & kedalaman pasar</p>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Rata-Rata Nilai Transaksi Harian (ADTV)</div>
                <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                  Rp {stock.adtvB.toFixed(1)} M
                </div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-[#8d9aa8]">
                  {stock.adtvB >= 50
                    ? 'Likuiditas Institusional Tinggi (Mudah keluar-masuk)'
                    : stock.adtvB >= 10
                    ? 'Likuiditas Menengah (Cukup likuid)'
                    : 'Likuiditas Tipis (Waspadai slippage)'}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3 text-sm dark:border-[#1d2833]">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#8d9aa8]">Free Float Publik</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">{stock.freeFloatPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#8d9aa8]">Turnover Free-Float / Hari</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">{stock.turnoverPct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#8d9aa8]">Estimasi Spread Bid-Ask</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">{stock.bidAskSpreadBps} bps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#8d9aa8]">Volume Harian</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                    {(stock.volumeShares / 1_000_000).toFixed(1)} jt lbr
                  </span>
                </div>
              </div>

              {/* Orderbook Bid vs Offer Imbalance */}
              <div className="border-t border-slate-100 pt-4 dark:border-[#1d2833]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-emerald-700 tabular-nums dark:text-[#00e08a]">Tekanan Beli (Bid) {stock.bidVolumeRatio}%</span>
                  <span className="text-red-700 tabular-nums dark:text-[#ff5a68]">Jual (Offer) {100 - stock.bidVolumeRatio}%</span>
                </div>
                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-red-100 dark:bg-[#ff5a68]/20">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 dark:bg-[#00e08a]"
                    style={{ width: `${stock.bidVolumeRatio}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  {stock.bidVolumeRatio >= 55
                    ? 'Tekanan beli (posisi rentang intraday & momentum) cenderung kuat.'
                    : stock.bidVolumeRatio <= 45
                    ? 'Tekanan jual di antrean Offer lebih besar daripada Bid.'
                    : 'Keseimbangan tekanan beli dan jual relatif netral.'}{' '}
                  {stock.isEstimatedOrderbook !== false && '(Estimasi dari posisi rentang intraday & fraksi BEI)'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
            <button
              type="button"
              onClick={() => onNavigateTab('peers')}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
            >
              <span>Bandingkan Grafik Sektor {stock.subSector}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* 3. Inflow & Outflow (Bandarmologi / Institusi & Asing) */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4 flex flex-col justify-between dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div>
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">Inflow & Outflow Dana</h2>
                <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">Arus modal bersih institusi & investor asing</p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Skor Akumulasi</div>
                <div
                  className={`text-sm font-bold ${
                    stock.accumulationScore >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {stock.accumulationScore >= 0 ? `+${stock.accumulationScore}` : stock.accumulationScore}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Net Flow 1 Hari</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    stock.inflow1DB >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {stock.inflow1DB >= 0 ? '+' : ''}Rp {stock.inflow1DB.toFixed(1)} M
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Net Flow 1 Minggu (5D)</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    stock.inflow1WB >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {stock.inflow1WB >= 0 ? '+' : ''}Rp {stock.inflow1WB.toFixed(1)} M
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Net Flow 1 Bulan</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    stock.inflow1MB >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {stock.inflow1MB >= 0 ? '+' : ''}Rp {stock.inflow1MB.toFixed(1)} M
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#0b1219]">
                <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Foreign Net Buy/Sell 1W</div>
                <div
                  className={`mt-1 font-mono text-base font-bold tabular-nums ${
                    stock.foreignFlow1WB >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {stock.foreignFlow1WB >= 0 ? '+' : ''}Rp {stock.foreignFlow1WB.toFixed(1)} M
                </div>
              </div>
            </div>

            {/* 5-Day Flow Histogram */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8d9aa8]">
                <span>Histori Aliran Dana 5 Hari Terakhir</span>
                <span className="font-mono">Miliar IDR</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {stock.flowHistory5D.map((val, idx) => {
                  const pct = Math.max(12, Math.round((Math.abs(val) / maxDailyFlow) * 100));
                  const isPos = val >= 0;
                  const dayLabel = idx === 4 ? 'Hari Ini' : `H-${4 - idx}`;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="flex h-24 w-full items-end justify-center rounded-md bg-slate-50 p-1.5 dark:bg-[#0b1219]">
                        <div
                          className={`w-full rounded-sm transition-all duration-300 ${
                            isPos ? 'bg-emerald-600 dark:bg-[#00e08a]' : 'bg-red-500 dark:bg-[#ff5a68]'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <div
                        className={`mt-1.5 font-mono text-xs font-semibold tabular-nums ${
                          isPos ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {val.toFixed(1)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">{dayLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
            <button
              type="button"
              onClick={() => onNavigateTab('geopolitics')}
              className="flex w-full items-center justify-between rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-110"
            >
              <span>Buka Riset Geopolitik & Masa Depan {stock.ticker}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* Riset Laporan Keuangan Per Kuartal (8 Kuartal Terakhir) */}
      <QuarterlyFinancialResearch stock={stock} />

      {/* Sinkronisasi Otomatis Website Resmi Emiten (Terdaftar di BEI & OJK) */}
      <CompanyOfficialSyncPanel
        stock={stock}
        officialSync={officialSync}
        loading={officialSyncLoading}
        onRefresh={onRefreshOfficialSync}
      />
    </div>
  );
}
