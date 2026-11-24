import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Globe,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  IdxSector,
  MacroLiveResponse,
  OjkBeiLiveSyncResponse,
  StockRecord,
} from '../types/market';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';
import { TradingViewCandlestickChart } from './TradingViewCandlestickChart';
import { OjkBeiLivePanel } from './OjkBeiLivePanel';
import { RealTimeStockTable } from './RealTimeStockTable';
import { ALL_IDX_SECTORS } from '../data/idxUniverse';
import { computeTechnicalSignal } from '../utils/signals';
import { buildOrderbookDepth } from '../utils/orderbookDepth';

interface MarketOverviewProps {
  activeStock: StockRecord;
  stocks: StockRecord[];
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  macro: MacroLiveResponse | null;
  macroLoading: boolean;
  onRefreshMacro: () => void;
  ojkBei: OjkBeiLiveSyncResponse | null;
  ojkBeiLoading: boolean;
  onRefreshOjkBei: () => void;
  onSelectStock: (
    ticker: string,
    targetTab?: 'overview' | 'analysis' | 'peers' | 'geopolitics'
  ) => void;
  onQuickInspect?: (ticker: string) => void;
  onOpenGeopoliticsPage?: () => void;
  onOpenScreenerIndex?: (indexCode?: string) => void;
  compareTickers?: string[];
  onToggleCompare?: (ticker: string) => void;
  isDark?: boolean;
}

type RadarMode =
  | 'BREAKOUT_RESISTANCE'
  | 'AT_SUPPORT'
  | 'TOP_GAINERS'
  | 'TOP_LOSERS'
  | 'TOP_INFLOW'
  | 'WALLS'
  | 'BREAKDOWN_SUPPORT';

const IDX_INDEX_CATALOG: {
  code: string;
  badge: string;
  name: string;
  matchTags: string[];
  baseValue: number;
}[] = [
  { code: 'LQ45', badge: 'LQ', name: '45 saham paling likuid', matchTags: ['LQ45'], baseValue: 918.2 },
  { code: 'IDX30', badge: '30', name: '30 saham likuid & kapitalisasi besar', matchTags: ['IDX30'], baseValue: 1284.65 },
  { code: 'IDX80', badge: '80', name: '80 saham dengan likuiditas tinggi', matchTags: ['IDX80'], baseValue: 812.74 },
  { code: 'IDX35', badge: '35', name: '35 saham unggulan likuiditas', matchTags: ['LQ45', 'IDX30'], baseValue: 712.48 },
  { code: 'IDXQ30', badge: 'Q30', name: '30 perusahaan kualitas & ROE tinggi', matchTags: ['LQ45'], baseValue: 1026.31 },
  { code: 'IDXESGL', badge: 'ESG', name: 'Saham pemimpin praktik ESG BEI', matchTags: ['IDX30'], baseValue: 212.86 },
  { code: 'IDXDIV20', badge: 'DIV', name: '20 saham dengan imbal hasil dividen tinggi', matchTags: ['IDXHIDIV20', 'IDXDIV20'], baseValue: 684.2 },
  { code: 'IDXG30', badge: 'G30', name: '30 perusahaan pertumbuhan & tata kelola', matchTags: ['IDX80'], baseValue: 318.54 },
  { code: 'SMINFRA18', badge: 'INF', name: '18 saham infrastruktur & utilitas', matchTags: ['KOMPAS100'], baseValue: 726.1 },
  { code: 'SMIDEV20', badge: 'DEV', name: '20 saham properti & pengembangan kawasan', matchTags: ['IDX80'], baseValue: 512.36 },
];

export function MarketOverview({
  activeStock,
  stocks,
  watchlist,
  onToggleWatchlist,
  macro,
  macroLoading,
  onRefreshMacro,
  ojkBei,
  ojkBeiLoading,
  onRefreshOjkBei,
  onSelectStock,
  onQuickInspect,
  onOpenGeopoliticsPage,
  onOpenScreenerIndex,
  compareTickers,
  onToggleCompare,
  isDark = false,
}: MarketOverviewProps) {
  const [radarMode, setRadarMode] = useState<RadarMode>('BREAKOUT_RESISTANCE');
  const [showAllIndices, setShowAllIndices] = useState<boolean>(false);

  const breakoutCount = stocks.filter((s) => s.lampStatus === 'BREAKOUT_RESISTANCE').length;
  const supportCount = stocks.filter((s) => s.lampStatus === 'AT_SUPPORT').length;
  const breakdownCount = stocks.filter((s) => s.lampStatus === 'BREAKDOWN_SUPPORT').length;
  const screenerMatchCount = stocks.filter((s) => s.isCompositeScreenerMatch).length;
  const buySignalCount = stocks.filter((s) => computeTechnicalSignal(s) === 'Beli').length;

  const totalNetFlow1W = stocks.reduce((acc, s) => acc + s.inflow1WB, 0);
  const topFlowMover = [...stocks].sort((a, b) => Math.abs(b.inflow1WB) - Math.abs(a.inflow1WB))[0];

  const flowChartStocks = (() => {
    const pos = [...stocks].sort((a, b) => b.inflow1WB - a.inflow1WB).slice(0, 6);
    const neg = [...stocks].sort((a, b) => a.inflow1WB - b.inflow1WB).slice(0, 4);
    const seen = new Set<string>();
    const combined: StockRecord[] = [];
    for (const s of [...pos, ...neg]) {
      if (!seen.has(s.ticker)) {
        seen.add(s.ticker);
        combined.push(s);
      }
    }
    return combined;
  })();

  const ihsgHistory = macro?.ihsgHistory ?? [];
  const ihsgVal = macro?.ihsg.value ?? 7412.35;
  const ihsgChangePct = macro?.ihsg.changePct ?? 0;
  const ihsgHigh = useMemo(() => {
    const histMax = ihsgHistory.length ? Math.max(...ihsgHistory.slice(-5).map((h) => h.value)) : ihsgVal;
    return Math.max(ihsgVal, histMax);
  }, [ihsgHistory, ihsgVal]);
  const ihsgLow = useMemo(() => {
    const histMin = ihsgHistory.length ? Math.min(...ihsgHistory.slice(-5).map((h) => h.value)) : ihsgVal;
    return Math.min(ihsgVal, histMin);
  }, [ihsgHistory, ihsgVal]);

  const ihsgStockRecord: StockRecord = {
    ...activeStock,
    ticker: 'IHSG',
    name: 'Indeks Harga Saham Gabungan (^JKSE)',
    sector: 'Investasi & Lainnya',
    subSector: 'Indeks Komposit BEI',
    price: ihsgVal,
    prevClose:
      macro?.ihsg.value && macro?.ihsg.change
        ? Number((macro.ihsg.value - macro.ihsg.change).toFixed(2))
        : ihsgVal,
    change: macro?.ihsg.change ?? 0,
    changePct: ihsgChangePct,
    s1: 0,
    s2: 0,
    pivot: 0,
    r1: 0,
    r2: 0,
  };

  const advancingCount = stocks.filter((s) => s.changePct > 0).length;
  const decliningCount = stocks.filter((s) => s.changePct < 0).length;
  const unchangedCount = stocks.length - advancingCount - decliningCount;
  const breadthBullPct = stocks.length > 0 ? Math.round((advancingCount / stocks.length) * 100) : 50;

  // Live index category performance computed from constituent universe stocks
  const liveIndices = useMemo(() => {
    return IDX_INDEX_CATALOG.map((item) => {
      let matched = stocks.filter((s) =>
        item.matchTags.some((tag) => s.indexTags.includes(tag))
      );
      if (item.code === 'IDXQ30') {
        matched = [...matched].sort((a, b) => b.roePct - a.roePct).slice(0, 30);
      } else if (item.code === 'IDXDIV20') {
        matched = [...stocks].sort((a, b) => b.divYieldPct - a.divYieldPct).slice(0, 20);
      } else if (item.code === 'SMINFRA18') {
        matched = stocks.filter((s) => s.sector === 'Infrastruktur').slice(0, 18);
      } else if (item.code === 'SMIDEV20') {
        matched = stocks.filter((s) => s.sector === 'Properti & Real Estat').slice(0, 20);
      }
      const avgPct = matched.length
        ? matched.reduce((acc, s) => acc + s.changePct, 0) / matched.length
        : ihsgChangePct;
      const liveValue = item.baseValue * (1 + avgPct / 100);
      return {
        ...item,
        count: matched.length,
        avgPct,
        liveValue,
      };
    });
  }, [stocks, ihsgChangePct]);

  const radarStocks = (() => {
    if (radarMode === 'TOP_GAINERS') {
      return [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 14);
    }
    if (radarMode === 'TOP_LOSERS') {
      return [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 14);
    }
    if (radarMode === 'TOP_INFLOW') {
      return [...stocks].sort((a, b) => b.inflow1WB - a.inflow1WB).slice(0, 14);
    }
    if (radarMode === 'WALLS') {
      return [...stocks].sort((a, b) => b.adtvB - a.adtvB).slice(0, 14);
    }
    return stocks.filter((s) => s.lampStatus === radarMode).slice(0, 14);
  })();

  const sectorStats = ALL_IDX_SECTORS.map((sector: IdxSector) => {
    const items = stocks.filter((s) => s.sector === sector);
    const total1WFlow = items.reduce((acc, s) => acc + s.inflow1WB, 0);
    const avgChange = items.length ? items.reduce((acc, s) => acc + s.changePct, 0) / items.length : 0;
    const breakoutInSector = items.filter((s) => s.lampStatus === 'BREAKOUT_RESISTANCE').length;
    return {
      sector,
      count: items.length,
      total1WFlow,
      avgChange,
      breakoutInSector,
    };
  }).sort((a, b) => b.total1WFlow - a.total1WFlow);

  return (
    <div className="space-y-6">
      {/* v17 Greeting + Market Status */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px] dark:text-[#eaf1f7]">
            Selamat datang, Investor
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#8d9aa8]">
            Pantau IHSG, indeks saham Indonesia, aliran dana, dan riset emiten BEI secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ojkBei?.marketStatus && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold ${
                ojkBei.marketStatus.isOpen
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  ojkBei.marketStatus.isOpen ? 'animate-pulse bg-emerald-500 dark:bg-[#00e08a]' : 'bg-slate-400'
                }`}
              />
              <span>{ojkBei.marketStatus.label}</span>
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8]">
            {stocks.length} Emiten Live
          </span>
        </div>
      </section>

      {/* v17 IHSG Hero Card + Live Macro KPI Strip */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Hero IHSG Card matching v17 gradient */}
        <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 lg:col-span-5 dark:border-[#243140] dark:bg-none dark:bg-[#0e141c] dark:[background-image:linear-gradient(145deg,#101a24,#0b1219)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.8px] text-slate-500 dark:text-[#8d9aa8]">
              Indeks Harga Saham Gabungan
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-[#8d9aa8]">^JKSE</span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <div className="font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-[34px] dark:text-[#eaf1f7]">
              {macro
                ? macro.ihsg.value.toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '--'}
            </div>

            {macro && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-extrabold tabular-nums ${
                  macro.ihsg.changePct >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                    : 'bg-red-50 text-red-700 dark:bg-[#ff5a68]/12 dark:text-[#ff5a68]'
                }`}
              >
                {macro.ihsg.changePct >= 0 ? '▲ +' : '▼ '}
                {macro.ihsg.changePct.toFixed(2)}%
              </span>
            )}
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-[#8d9aa8]">
            <div>
              <strong className="block font-display text-sm font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                {ihsgHigh.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
              <span>High (5D)</span>
            </div>
            <div>
              <strong className="block font-display text-sm font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                {ihsgLow.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
              <span>Low (5D)</span>
            </div>
            <div>
              <strong
                className={`block font-display text-sm font-bold tabular-nums ${
                  totalNetFlow1W >= 0
                    ? 'text-emerald-700 dark:text-[#00e08a]'
                    : 'text-red-700 dark:text-[#ff5a68]'
                }`}
              >
                {totalNetFlow1W >= 0 ? '+' : ''}Rp {totalNetFlow1W.toFixed(0)} M
              </strong>
              <span>Net Flow 1W</span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="font-semibold text-emerald-700 dark:text-[#00e08a]">
              {advancingCount} Naik
            </span>
            <span className="text-slate-500 dark:text-[#8d9aa8]">{unchangedCount} Tetap</span>
            <span className="font-semibold text-red-700 dark:text-[#ff5a68]">
              {decliningCount} Turun
            </span>
          </div>
          <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-red-100 dark:bg-[#ff5a68]/25">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 dark:bg-[#00e08a]"
              style={{ width: `${breadthBullPct}%` }}
            />
          </div>
        </div>

        {/* 3 Macro / Screener / Lamp Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
          <div className="flex flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.7px] text-slate-500 dark:text-[#8d9aa8]">
                Kurs &amp; Suku Bunga
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                {macro ? `Rp ${macro.usdIdr.value.toLocaleString('id-ID')}` : '--'}
              </div>
              <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-[#8d9aa8]">USD / IDR</div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
              <span>BI {macro?.biRate ?? '--'}</span>
              <span>Fed {macro?.fedRate ?? '--'}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.7px] text-slate-500 dark:text-[#8d9aa8]">
                Lampu S/R Hari Ini
              </div>
              <div className="mt-2 flex items-baseline gap-3 font-display tabular-nums">
                <div>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-[#00e08a]">
                    {breakoutCount}
                  </span>
                  <span className="ml-1 text-[11px] text-slate-500 dark:text-[#8d9aa8]">Breakout</span>
                </div>
                <span className="text-slate-300 dark:text-[#1d2833]">|</span>
                <div>
                  <span className="text-2xl font-bold text-amber-600 dark:text-[#ffb020]">
                    {supportCount}
                  </span>
                  <span className="ml-1 text-[11px] text-slate-500 dark:text-[#8d9aa8]">Support</span>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
              Jebol support:{' '}
              <span className="font-mono font-bold text-red-700 dark:text-[#ff5a68]">
                {breakdownCount}
              </span>{' '}
              emiten
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.7px] text-slate-500 dark:text-[#8d9aa8]">
                Smart Screener &amp; Sinyal
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-emerald-700 tabular-nums dark:text-[#00e08a]">
                  {screenerMatchCount}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#8d9aa8]">Lolos Komposit</span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-slate-600 dark:text-[#8d9aa8]">
                {buySignalCount} Sinyal Beli Aktif
              </div>
            </div>
            {onOpenScreenerIndex && (
              <button
                type="button"
                onClick={() => onOpenScreenerIndex()}
                className="mt-3 inline-flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-emerald-700 hover:underline dark:border-[#1d2833] dark:text-[#00e08a]"
              >
                <span>Buka Screener Saham</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live TradingView IHSG All-Indicators Candlestick Chart */}
      <div>
        <TradingViewCandlestickChart stock={ihsgStockRecord} isDark={isDark} />
      </div>

      {/* Real-Time Stock Directory Table + Instant Chart & Research */}
      <RealTimeStockTable
        stocks={stocks}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onOpenFullAnalysis={(ticker) => onSelectStock(ticker, 'analysis')}
        onOpenGeopolitics={(ticker) => onSelectStock(ticker, 'geopolitics')}
        compareTickers={compareTickers}
        onToggleCompare={onToggleCompare}
        isDark={isDark}
        defaultLimit={20}
      />

      {/* v17 Indeks Saham Section + Riset Geopolitik Card */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                Indeks Saham Indonesia
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                Pergerakan live indeks utama Bursa Efek Indonesia berdasarkan emiten penyusunnya
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllIndices((v) => !v)}
              className="text-xs font-bold text-emerald-700 hover:underline dark:text-[#00e08a]"
            >
              {showAllIndices ? 'Ringkas' : `Semua indeks (${liveIndices.length})`}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(showAllIndices ? liveIndices : liveIndices.slice(0, 6)).map((idxItem) => {
              const isUp = idxItem.avgPct >= 0;
              return (
                <button
                  key={idxItem.code}
                  type="button"
                  onClick={() => onOpenScreenerIndex?.(idxItem.code)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left transition-colors hover:border-emerald-400 dark:border-[#1d2833] dark:bg-[#131b25]/60 dark:hover:border-[#00e08a]/45"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white font-display text-xs font-bold text-emerald-700 shadow-2xs dark:bg-[#131b25] dark:text-[#00e08a]">
                    {idxItem.badge}
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                      {idxItem.code}
                    </strong>
                    <span className="block truncate text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                      {idxItem.name}
                    </span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <strong className="block font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                      {idxItem.liveValue.toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                    <span
                      className={`text-xs font-bold ${
                        isUp ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {idxItem.avgPct.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* v17 Riset Geopolitik CTA Card + Aliran Dana Top Mover */}
        <section className="flex flex-col justify-between gap-4 lg:col-span-5">
          <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 dark:border-[#243140] dark:bg-none dark:bg-[#0e141c] dark:[background-image:linear-gradient(145deg,#131d28,#0d141d)]">
            <div className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
              <Globe className="h-4 w-4 text-emerald-700 dark:text-[#00e08a]" />
              <span>Riset Geopolitik &amp; Makro Dunia</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
              {macro?.worldSummary ||
                'Pantau risiko geopolitik global, tarif dagang, konflik energi, suku bunga The Fed/BI, dan dampaknya ke sektor serta saham di IDX.'}
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenGeopoliticsPage
                  ? onOpenGeopoliticsPage()
                  : onSelectStock(activeStock.ticker, 'geopolitics')
              }
              className="mt-4 w-full rounded-2xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-3 text-center text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105"
            >
              Buka Riset Geopolitik
            </button>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span>Aliran Dana Institusi Terbesar (1W)</span>
              <span className="font-mono">BEI Live</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  topFlowMover &&
                  (onQuickInspect
                    ? onQuickInspect(topFlowMover.ticker)
                    : onSelectStock(topFlowMover.ticker, 'analysis'))
                }
                className="font-display text-xl font-bold text-emerald-700 hover:underline dark:text-[#00e08a]"
              >
                {topFlowMover?.ticker ?? '--'}
              </button>
              {topFlowMover && (
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${
                    topFlowMover.inflow1WB >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {topFlowMover.inflow1WB >= 0 ? '+' : ''}Rp {topFlowMover.inflow1WB.toFixed(1)} M
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-[#8d9aa8]">
              {topFlowMover?.name ?? 'Menunggu pembaruan stream'}
            </div>
          </div>
        </section>
      </div>

      {/* Market Flow & IHSG 20-Day Trend Summary Charts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* IHSG 20-Day Line Chart */}
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 lg:col-span-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                IHSG — Tren {ihsgHistory.length > 0 ? `${ihsgHistory.length} Hari` : '20 Hari'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                Penutupan harian Indeks Harga Saham Gabungan (^JKSE)
              </p>
            </div>
            {ihsgHistory.length >= 2 && (() => {
              const first = ihsgHistory[0].value;
              const last = ihsgHistory[ihsgHistory.length - 1].value;
              const pct = first > 0 ? ((last - first) / first) * 100 : 0;
              return (
                <span
                  className={`font-mono text-xs font-bold tabular-nums ${
                    pct >= 0
                      ? 'text-emerald-700 dark:text-[#00e08a]'
                      : 'text-red-700 dark:text-[#ff5a68]'
                  }`}
                >
                  {pct >= 0 ? '+' : ''}
                  {pct.toFixed(2)}%
                </span>
              );
            })()}
          </div>

          {ihsgHistory.length < 2 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-slate-500 dark:text-[#8d9aa8]">
              Memuat tren historis IHSG...
            </div>
          ) : (() => {
            const vals = ihsgHistory.map((p) => p.value);
            const minV = Math.min(...vals) * 0.996;
            const maxV = Math.max(...vals) * 1.004;
            const rangeV = Math.max(1, maxV - minV);
            const W = 520;
            const H = 200;
            const pad = { top: 14, right: 14, bottom: 24, left: 50 };
            const cw = W - pad.left - pad.right;
            const ch = H - pad.top - pad.bottom;
            const getX = (i: number) => pad.left + (cw * i) / Math.max(1, ihsgHistory.length - 1);
            const getY = (v: number) => pad.top + ch * (1 - (v - minV) / rangeV);
            const pathD = ihsgHistory
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.value).toFixed(1)}`)
              .join(' ');
            const areaD = `${pathD} L ${getX(ihsgHistory.length - 1).toFixed(1)} ${(pad.top + ch).toFixed(1)} L ${pad.left.toFixed(1)} ${(pad.top + ch).toFixed(1)} Z`;

            return (
              <div className="mt-3">
                <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full overflow-visible">
                  {[0, 0.33, 0.66, 1].map((t) => {
                    const y = pad.top + ch * t;
                    const v = Math.round(maxV - rangeV * t);
                    return (
                      <g key={t}>
                        <line
                          x1={pad.left}
                          y1={y}
                          x2={W - pad.right}
                          y2={y}
                          className="stroke-slate-100 dark:stroke-[#1d2833]"
                          strokeWidth={1}
                        />
                        <text
                          x={pad.left - 6}
                          y={y + 3}
                          textAnchor="end"
                          className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                        >
                          {v.toLocaleString('id-ID')}
                        </text>
                      </g>
                    );
                  })}
                  <path d={areaD} fill="#059669" fillOpacity={0.14} className="dark:fill-[#00e08a]" />
                  <path d={pathD} fill="none" stroke="#059669" strokeWidth={2.5} className="dark:stroke-[#00e08a]" />
                  {[0, Math.floor((ihsgHistory.length - 1) / 2), ihsgHistory.length - 1]
                    .filter((idx, i, a) => idx >= 0 && a.indexOf(idx) === i)
                    .map((idx) => (
                      <text
                        key={idx}
                        x={getX(idx)}
                        y={H - 5}
                        textAnchor={idx === 0 ? 'start' : idx === ihsgHistory.length - 1 ? 'end' : 'middle'}
                        className="fill-slate-500 font-mono text-[10px] dark:fill-[#8d9aa8]"
                      >
                        {ihsgHistory[idx].date}
                      </text>
                    ))}
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Bidirectional Net Flow Bar Chart per Stock */}
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 lg:col-span-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                Aliran Dana per Saham Utama (Miliar Rp)
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                Ketuk batang/kode saham untuk melihat grafik &amp; indikator RSI cepat
              </p>
            </div>
          </div>

          {(() => {
            const maxAbs = Math.max(10, ...flowChartStocks.map((s) => Math.abs(s.inflow1WB)));
            return (
              <div className="mt-4">
                <div className="relative flex h-[175px] items-center justify-between gap-1.5 border-y border-slate-100 px-1 dark:border-[#1d2833]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 left-0 top-1/2 h-px bg-slate-300 dark:bg-[#2a3846]"
                  />
                  {flowChartStocks.map((s) => {
                    const pctHalf = Math.min(44, (Math.abs(s.inflow1WB) / maxAbs) * 44);
                    const isPos = s.inflow1WB >= 0;
                    return (
                      <button
                        key={s.ticker}
                        type="button"
                        onClick={() =>
                          onQuickInspect ? onQuickInspect(s.ticker) : onSelectStock(s.ticker, 'analysis')
                        }
                        title={`${s.ticker}: ${isPos ? '+' : ''}Rp ${s.inflow1WB.toFixed(1)} M`}
                        className="group relative flex h-full flex-1 flex-col items-center justify-center rounded transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25]"
                      >
                        <div className="relative h-full w-full flex items-center justify-center">
                          <div
                            style={{
                              height: `${Math.max(4, pctHalf)}%`,
                              bottom: isPos ? '50%' : undefined,
                              top: !isPos ? '50%' : undefined,
                            }}
                            className={`absolute w-3/5 max-w-[26px] rounded-xs transition-opacity group-hover:opacity-85 ${
                              isPos ? 'bg-emerald-600 dark:bg-[#00e08a]' : 'bg-red-600 dark:bg-[#ff5a68]'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1.5 px-1">
                  {flowChartStocks.map((s) => (
                    <button
                      key={s.ticker}
                      type="button"
                      onClick={() =>
                        onQuickInspect ? onQuickInspect(s.ticker) : onSelectStock(s.ticker, 'analysis')
                      }
                      className="flex-1 text-center font-mono text-[10px] font-semibold text-slate-700 hover:text-emerald-700 dark:text-[#eaf1f7] dark:hover:text-[#00e08a]"
                    >
                      <div>{s.ticker}</div>
                      <div
                        className={`text-[9px] tabular-nums ${
                          s.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.inflow1WB >= 0 ? '+' : ''}
                        {s.inflow1WB.toFixed(0)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Main Split: Radar Pasar & Lampu Indikator + Live World Geopolitics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
                Radar Pasar BEI &amp; Lampu Indikator
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
                Sinyal Support/Resisten real-time, Top Gainers, Top Losers, dan Top Inflow
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:border dark:border-[#1d2833] dark:bg-[#060a0f]">
              {[
                { id: 'BREAKOUT_RESISTANCE' as const, label: 'Breakout' },
                { id: 'AT_SUPPORT' as const, label: 'Support' },
                { id: 'TOP_GAINERS' as const, label: 'Gainers' },
                { id: 'TOP_LOSERS' as const, label: 'Losers' },
                { id: 'TOP_INFLOW' as const, label: 'Inflow' },
                { id: 'WALLS' as const, label: 'Order Book' },
                { id: 'BREAKDOWN_SUPPORT' as const, label: 'Breakdown' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRadarMode(tab.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    radarMode === tab.id
                      ? 'bg-emerald-600 text-white shadow-xs dark:bg-[#00e08a] dark:text-[#03130b] dark:font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {radarMode === 'WALLS' ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                    <th className="py-2.5 pr-3">Emiten</th>
                    <th className="py-2.5 px-3 text-right">Harga</th>
                    <th className="py-2.5 px-3 text-right">Tembok Bid</th>
                    <th className="py-2.5 px-3 text-right">Tembok Offer</th>
                    <th className="py-2.5 pl-3 text-right">Tekanan Beli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
                  {radarStocks.map((s) => {
                    const depth = buildOrderbookDepth(s, 15);
                    return (
                      <tr key={s.ticker} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25]">
                        <td className="py-2.5 pr-3">
                          <button
                            type="button"
                            onClick={() => onSelectStock(s.ticker, 'analysis')}
                            className="group text-left"
                          >
                            <div className="font-mono font-bold text-slate-900 group-hover:text-emerald-700 dark:text-[#eaf1f7] dark:group-hover:text-[#00e08a]">
                              {s.ticker}
                            </div>
                            <div className="max-w-[140px] truncate text-xs text-slate-500 dark:text-[#8d9aa8]">
                              {s.subSector}
                            </div>
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                          Rp {s.price.toLocaleString('id-ID')}
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
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                    <th className="py-2.5 pr-3">Emiten</th>
                    <th className="py-2.5 px-3 text-right">Harga</th>
                    <th className="py-2.5 px-3 text-right">1D %</th>
                    <th className="py-2.5 px-3 text-right">Inflow 1W</th>
                    <th className="py-2.5 px-3">Lampu S/R</th>
                    <th className="py-2.5 pl-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
                  {radarStocks.map((s) => (
                    <tr key={s.ticker} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25]">
                      <td className="py-2.5 pr-3">
                        <button
                          type="button"
                          onClick={() => onSelectStock(s.ticker, 'analysis')}
                          className="text-left group"
                        >
                          <div className="font-mono font-bold text-slate-900 group-hover:text-emerald-700 dark:text-[#eaf1f7] dark:group-hover:text-[#00e08a]">
                            {s.ticker}
                          </div>
                          <div className="max-w-[170px] truncate text-xs text-slate-500 dark:text-[#8d9aa8]">
                            {s.subSector}
                          </div>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                        Rp {s.price.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums ${
                          s.changePct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.changePct >= 0 ? '+' : ''}
                        {s.changePct.toFixed(2)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums ${
                          s.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.inflow1WB >= 0 ? '+' : ''}
                        {s.inflow1WB.toFixed(1)}M
                      </td>
                      <td className="py-2.5 px-3">
                        <SupportResistanceLampBadge status={s.lampStatus} compact />
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectStock(s.ticker, 'analysis')}
                          className="text-xs font-bold text-emerald-700 hover:underline whitespace-nowrap dark:text-[#00e08a]"
                        >
                          Analisis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Live World Geopolitics & Macro Pulse */}
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-[#00e08a]" />
                  <span>Geopolitik &amp; Ekonomi Dunia</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  {macro?.updatedAt
                    ? `Diperbarui: ${new Date(macro.updatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} WIB`
                    : 'Memuat pembaruan dunia...'}
                </p>
              </div>
              <button
                type="button"
                onClick={onRefreshMacro}
                disabled={macroLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#2a3846]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${macroLoading ? 'animate-spin' : ''}`} />
                <span>{macroLoading ? 'Memperbarui...' : 'Perbarui'}</span>
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1d2833]">
              {(macro?.geopolitics ?? []).slice(0, 4).map((evt, idx) => (
                <article key={idx} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    <span className="font-semibold text-slate-700 dark:text-[#eaf1f7]">{evt.region}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        evt.severity === 'Tinggi'
                          ? 'font-bold text-red-700 dark:text-[#ff5a68]'
                          : evt.severity === 'Sedang'
                          ? 'font-bold text-amber-700 dark:text-[#ffb020]'
                          : 'font-medium text-emerald-700 dark:text-[#00e08a]'
                      }
                    >
                      Dampak {evt.severity}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    {evt.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">{evt.summary}</p>
                  <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-[#00e08a]">
                    Implikasi BEI: {evt.idxImpact}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {macro?.sources && macro.sources.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-3 dark:border-[#1d2833]">
              <div className="text-xs font-medium text-slate-500 dark:text-[#8d9aa8]">
                Sumber Berita Dunia
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {macro.sources.slice(0, 4).map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline max-w-[220px] truncate dark:text-[#00e08a]"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{src.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* World Commodities Strip + 12 IDX-IC Sector Flows */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
            Komoditas Strategis Dunia &amp; Pengaruh ke BEI
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
            Pergerakan harga komoditas global penggerak utama laba emiten Indonesia
          </p>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1d2833]">
            {(macro?.commodities ?? []).map((c) => (
              <div key={c.symbol} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm dark:text-[#eaf1f7]">{c.name}</span>
                    <span className="ml-2 font-mono text-xs text-slate-500 dark:text-[#8d9aa8]">{c.symbol}</span>
                  </div>
                  <div className="flex items-baseline gap-3 font-mono tabular-nums">
                    <span className="text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">{c.price}</span>
                    <span
                      className={`text-xs font-bold ${
                        c.changePct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {c.changePct >= 0 ? '+' : ''}
                      {c.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-[#8d9aa8]">{c.impactOnIdx}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
            Aliran Dana 1 Minggu Per Sektor BEI
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
            Rotasi modal institusi &amp; asing di seluruh 12 sektor klasifikasi IDX-IC
          </p>
          <div className="mt-4 space-y-3">
            {sectorStats.map((sec) => {
              const maxAbs = Math.max(...sectorStats.map((x) => Math.abs(x.total1WFlow)), 1);
              const barPct = Math.min(100, (Math.abs(sec.total1WFlow) / maxAbs) * 100);
              const isPos = sec.total1WFlow >= 0;
              return (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-[#eaf1f7]">{sec.sector}</span>
                      <span className="text-slate-400 dark:text-[#8d9aa8]">·</span>
                      <span className="text-slate-500 tabular-nums dark:text-[#8d9aa8]">{sec.count} emiten</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span
                        className={
                          sec.avgChange >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }
                      >
                        {sec.avgChange >= 0 ? '+' : ''}
                        {sec.avgChange.toFixed(2)}%
                      </span>
                      <span
                        className={`font-bold ${
                          isPos ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {isPos ? '+' : ''}Rp {sec.total1WFlow.toFixed(0)} M
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#060a0f]">
                    <div
                      className={`h-full rounded-full ${
                        isPos ? 'bg-emerald-600 dark:bg-[#00e08a]' : 'bg-red-500 dark:bg-[#ff5a68]'
                      }`}
                      style={{ width: `${Math.max(4, barPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Continuous Live OJK & BEI Keterbukaan Informasi, Regulasi & Pengawasan */}
      <OjkBeiLivePanel
        data={ojkBei}
        loading={ojkBeiLoading}
        onRefresh={onRefreshOjkBei}
        onSelectStock={(ticker) => onSelectStock(ticker, 'analysis')}
      />
    </div>
  );
}
