import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  BarChart3,
  Check,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import type { IdxSector, LampStatus, StockRecord } from '../types/market';
import { ALL_IDX_SECTORS } from '../data/idxUniverse';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';
import {
  computeTechnicalSignal,
  getSignalToneClasses,
  type TechnicalSignalLabel,
} from '../utils/signals';

interface SmartScreenerProps {
  stocks: StockRecord[];
  watchlist?: string[];
  onToggleWatchlist?: (ticker: string) => void;
  onQuickInspect?: (ticker: string) => void;
  onSelectStock: (ticker: string) => void;
  compareTickers?: string[];
  onToggleCompare?: (ticker: string) => void;
  onOpenCompare?: () => void;
  initialIndexTag?: string | null;
}

type SortKey =
  | 'inflow1WB'
  | 'roePct'
  | 'changePct'
  | 'price'
  | 'adtvB'
  | 'rsi14'
  | 'per'
  | 'divYieldPct'
  | 'marketCapT'
  | 'ticker';

type StrategyPreset =
  | 'ALL'
  | 'SMART'
  | 'INFLOW'
  | 'VALUE'
  | 'DIVIDEND'
  | 'GROWTH'
  | 'BULLISH'
  | 'OVERSOLD'
  | 'QUALITY';

const STRATEGY_PRESETS: { id: StrategyPreset; label: string }[] = [
  { id: 'SMART', label: '⚡ Smart Komposit' },
  { id: 'ALL', label: 'Semua' },
  { id: 'INFLOW', label: '💧 Inflow Tertinggi' },
  { id: 'VALUE', label: '💎 Value' },
  { id: 'DIVIDEND', label: '💰 Dividen Tinggi' },
  { id: 'GROWTH', label: '🚀 Growth' },
  { id: 'BULLISH', label: '📈 Bullish' },
  { id: 'OVERSOLD', label: '🪃 Oversold' },
  { id: 'QUALITY', label: '🏆 Kualitas' },
];

export function SmartScreener({
  stocks,
  watchlist = [],
  onToggleWatchlist,
  onQuickInspect,
  onSelectStock,
  compareTickers = [],
  onToggleCompare,
  onOpenCompare,
  initialIndexTag = null,
}: SmartScreenerProps) {
  const [strategy, setStrategy] = useState<StrategyPreset>(initialIndexTag ? 'ALL' : 'SMART');
  const [query, setQuery] = useState('');
  const [indexFilter, setIndexFilter] = useState<string>(initialIndexTag ?? 'ALL');
  const [sectorFilter, setSectorFilter] = useState<'ALL' | IdxSector>('ALL');
  const [lampFilter, setLampFilter] = useState<'ALL' | LampStatus>('ALL');
  const [signalFilter, setSignalFilter] = useState<'ALL' | TechnicalSignalLabel>('ALL');
  const [flowFilter, setFlowFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [sheetOpen, setSheetOpen] = useState(false);

  // Quantitative thresholds
  const [minRoe, setMinRoe] = useState<number>(initialIndexTag ? 0 : 11);
  const [maxDer, setMaxDer] = useState<number>(initialIndexTag ? 3 : 1.5);
  const [minInflow1W, setMinInflow1W] = useState<number>(initialIndexTag ? -999 : 15);
  const [minAdtv, setMinAdtv] = useState<number>(initialIndexTag ? 0 : 5);
  const [maxPer, setMaxPer] = useState<number>(0); // 0 = no limit
  const [minDivYield, setMinDivYield] = useState<number>(0);
  const [requireBullishTech, setRequireBullishTech] = useState<boolean>(!initialIndexTag);

  const [sortKey, setSortKey] = useState<SortKey>('inflow1WB');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(50);

  const [aiInsights, setAiInsights] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const watchlistSet = useMemo(() => new Set(watchlist), [watchlist]);
  const compareSet = useMemo(() => new Set(compareTickers), [compareTickers]);

  const applyStrategy = (next: StrategyPreset) => {
    setStrategy(next);
    setVisibleLimit(50);
    if (next === 'ALL') {
      setMinRoe(0);
      setMaxDer(3);
      setMinInflow1W(-999);
      setMinAdtv(0);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('inflow1WB');
      setSortAsc(false);
    } else if (next === 'SMART') {
      setMinRoe(11);
      setMaxDer(1.5);
      setMinInflow1W(15);
      setMinAdtv(5);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(true);
      setSortKey('inflow1WB');
      setSortAsc(false);
    } else if (next === 'INFLOW') {
      setMinRoe(0);
      setMaxDer(3);
      setMinInflow1W(30);
      setMinAdtv(10);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('inflow1WB');
      setSortAsc(false);
    } else if (next === 'VALUE') {
      setMinRoe(10);
      setMaxDer(1.5);
      setMinInflow1W(-999);
      setMinAdtv(2);
      setMaxPer(12);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('per');
      setSortAsc(true);
    } else if (next === 'DIVIDEND') {
      setMinRoe(8);
      setMaxDer(2);
      setMinInflow1W(-999);
      setMinAdtv(2);
      setMaxPer(0);
      setMinDivYield(4.5);
      setRequireBullishTech(false);
      setSortKey('divYieldPct');
      setSortAsc(false);
    } else if (next === 'GROWTH') {
      setMinRoe(12);
      setMaxDer(1.5);
      setMinInflow1W(0);
      setMinAdtv(5);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('roePct');
      setSortAsc(false);
    } else if (next === 'BULLISH') {
      setMinRoe(0);
      setMaxDer(3);
      setMinInflow1W(5);
      setMinAdtv(5);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(true);
      setSortKey('changePct');
      setSortAsc(false);
    } else if (next === 'OVERSOLD') {
      setMinRoe(0);
      setMaxDer(3);
      setMinInflow1W(-999);
      setMinAdtv(1);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('rsi14');
      setSortAsc(true);
    } else if (next === 'QUALITY') {
      setMinRoe(16);
      setMaxDer(0.7);
      setMinInflow1W(-999);
      setMinAdtv(5);
      setMaxPer(0);
      setMinDivYield(0);
      setRequireBullishTech(false);
      setSortKey('roePct');
      setSortAsc(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();

    const list = stocks.filter((s) => {
      if (
        q &&
        !s.ticker.includes(q) &&
        !s.name.toUpperCase().includes(q) &&
        !s.subSector.toUpperCase().includes(q)
      ) {
        return false;
      }
      if (indexFilter !== 'ALL' && !s.indexTags.includes(indexFilter)) return false;
      if (sectorFilter !== 'ALL' && s.sector !== sectorFilter) return false;
      if (lampFilter !== 'ALL' && s.lampStatus !== lampFilter) return false;
      if (flowFilter === 'IN' && s.inflow1WB <= 0) return false;
      if (flowFilter === 'OUT' && s.inflow1WB >= 0) return false;
      if (signalFilter !== 'ALL' && computeTechnicalSignal(s) !== signalFilter) return false;

      if (strategy === 'OVERSOLD' && s.rsi14 > 45) return false;
      if (strategy === 'GROWTH' && s.epsGrowthPct < 10) return false;

      if (strategy !== 'ALL') {
        if (s.roePct < minRoe) return false;
        if (s.der > maxDer) return false;
        if (s.inflow1WB < minInflow1W) return false;
        if (s.adtvB < minAdtv) return false;
        if (maxPer > 0 && (s.per <= 0 || s.per > maxPer)) return false;
        if (minDivYield > 0 && s.divYieldPct < minDivYield) return false;
        if (requireBullishTech && !s.isTechnicalBullish) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
  }, [
    stocks,
    query,
    indexFilter,
    sectorFilter,
    lampFilter,
    signalFilter,
    flowFilter,
    strategy,
    minRoe,
    maxDer,
    minInflow1W,
    minAdtv,
    maxPer,
    minDivYield,
    requireBullishTech,
    sortKey,
    sortAsc,
  ]);

  const activeFilterCount =
    (indexFilter !== 'ALL' ? 1 : 0) +
    (sectorFilter !== 'ALL' ? 1 : 0) +
    (lampFilter !== 'ALL' ? 1 : 0) +
    (signalFilter !== 'ALL' ? 1 : 0) +
    (flowFilter !== 'ALL' ? 1 : 0) +
    (strategy !== 'ALL' ? 1 : 0);

  const resetAllFilters = () => {
    setIndexFilter('ALL');
    setSectorFilter('ALL');
    setLampFilter('ALL');
    setSignalFilter('ALL');
    setFlowFilter('ALL');
    applyStrategy('ALL');
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'ticker' || key === 'per' || key === 'rsi14');
    }
  };

  const evaluateWithGemini = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/screener/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks: filtered.slice(0, 12) }),
      });
      const json = (await res.json()) as { insights?: string; error?: string };
      if (!res.ok) {
        setAiError(json.error || 'Gagal menjalankan evaluasi screener.');
      } else {
        setAiInsights(json.insights || '');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Kesalahan jaringan.');
    } finally {
      setAiLoading(false);
    }
  };

  const smartMatchTotal = useMemo(
    () => stocks.filter((s) => s.isCompositeScreenerMatch).length,
    [stocks]
  );

  return (
    <div className="space-y-5">
      {/* v17 Screener Hero Card */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-emerald-700 dark:text-[#00e08a]">
              Valuasi • Fundamental • Teknikal ({stocks.length} Emiten BEI)
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Screener Saham
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#8d9aa8]">
              Saring {stocks.length} saham BEI dengan kriteria kuantitatif atau pilih strategi siap pakai ({smartMatchTotal} emiten lolos komposit).
            </p>
          </div>

          <button
            type="button"
            onClick={evaluateWithGemini}
            disabled={aiLoading || filtered.length === 0}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{aiLoading ? 'Mengevaluasi...' : 'Evaluasi Top Picks (AI)'}</span>
          </button>
        </div>

        {/* v17 Horizontal Strategy Chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {STRATEGY_PRESETS.map((p) => {
            const active = strategy === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyStrategy(p.id)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/50 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* v17 Search + Filter Sheet Button */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleLimit(50);
              }}
              placeholder="Cari kode, nama emiten, atau sub-sektor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#00e08a]"
            />
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-emerald-500/45 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-800 transition-colors hover:bg-emerald-100 whitespace-nowrap shrink-0 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/10 dark:text-[#00e08a]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-emerald-600 px-1.5 font-mono text-[10px] font-extrabold text-white dark:bg-[#00e08a] dark:text-[#03130b]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Selectors Row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value as 'ALL' | IdxSector);
              setVisibleLimit(50);
            }}
            aria-label="Filter Sektor IDX"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
          >
            <option value="ALL">Semua 12 Sektor</option>
            {ALL_IDX_SECTORS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          <select
            value={indexFilter}
            onChange={(e) => {
              setIndexFilter(e.target.value);
              setVisibleLimit(50);
            }}
            aria-label="Filter Indeks"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
          >
            <option value="ALL">Semua Indeks</option>
            <option value="LQ45">LQ45</option>
            <option value="IDX30">IDX30</option>
            <option value="IDX80">IDX80</option>
            <option value="KOMPAS100">KOMPAS100</option>
          </select>

          <select
            value={signalFilter}
            onChange={(e) => {
              setSignalFilter(e.target.value as 'ALL' | TechnicalSignalLabel);
              setVisibleLimit(50);
            }}
            aria-label="Filter Sinyal"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
          >
            <option value="ALL">Semua Sinyal</option>
            <option value="Beli">Sinyal: Beli</option>
            <option value="Tahan">Sinyal: Tahan</option>
            <option value="Jual">Sinyal: Jual</option>
          </select>

          <select
            value={flowFilter}
            onChange={(e) => {
              setFlowFilter(e.target.value as 'ALL' | 'IN' | 'OUT');
              setVisibleLimit(50);
            }}
            aria-label="Filter Aliran Dana"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
          >
            <option value="ALL">Semua Arus Dana</option>
            <option value="IN">Inflow (+)</option>
            <option value="OUT">Outflow (-)</option>
          </select>

          <select
            value={lampFilter}
            onChange={(e) => {
              setLampFilter(e.target.value as 'ALL' | LampStatus);
              setVisibleLimit(50);
            }}
            aria-label="Filter Lampu Indikator"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
          >
            <option value="ALL">Semua Lampu S/R</option>
            <option value="BREAKOUT_RESISTANCE">Menembus Resisten</option>
            <option value="AT_SUPPORT">Menyentuh Support</option>
            <option value="BREAKDOWN_SUPPORT">Jebol Support</option>
            <option value="NEUTRAL">Konsolidasi</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-900 dark:border-[#1d2833] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Gemini Screener Insights Output */}
        {aiError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff5a68]">
            {aiError}
          </div>
        )}
        {aiInsights && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-[#00e08a]/35 dark:bg-[#00e08a]/10">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-[#00e08a]">
              <span>Evaluasi Top Picks Smart Screener · Gemini AI</span>
              <button
                type="button"
                onClick={() => setAiInsights('')}
                className="text-slate-500 hover:text-slate-800 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
              >
                Tutup
              </button>
            </div>
            <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-[#eaf1f7]">
              {aiInsights}
            </div>
          </div>
        )}

        {/* v17 Count & Sort Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
          <span>
            <strong className="font-display text-slate-900 dark:text-[#eaf1f7]">
              {Math.min(visibleLimit, filtered.length)}
            </strong>{' '}
            dari <strong className="font-display text-slate-900 dark:text-[#eaf1f7]">{filtered.length}</strong>{' '}
            saham cocok
          </span>

          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7]"
            >
              <option value="inflow1WB">Urut: Inflow 1W</option>
              <option value="roePct">Urut: ROE</option>
              <option value="divYieldPct">Urut: Dividen Yield</option>
              <option value="per">Urut: PER</option>
              <option value="changePct">Urut: Kinerja 1D</option>
              <option value="rsi14">Urut: RSI(14)</option>
              <option value="marketCapT">Urut: Kapitalisasi</option>
              <option value="price">Urut: Harga</option>
              <option value="ticker">Urut: Kode</option>
            </select>
            <button
              type="button"
              onClick={() => setSortAsc((v) => !v)}
              aria-label="Ubah arah urutan"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50 font-bold text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#00e08a]"
            >
              {sortAsc ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* High-Density Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-slate-600 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#8d9aa8]">
                {onToggleWatchlist && <th className="w-8 py-2.5 pl-2 text-center">★</th>}
                <th className="py-2.5 pr-3 pl-2">
                  <button
                    type="button"
                    onClick={() => handleSort('ticker')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Emiten &amp; Sektor</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('price')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Harga</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('changePct')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>1D %</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">Support S1</th>
                <th className="py-2.5 px-2 text-right">Resisten R1</th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('inflow1WB')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Inflow 1W</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('roePct')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>ROE</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('per')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>PER</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('rsi14')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>RSI</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2">Sinyal</th>
                <th className="py-2.5 px-2">Lampu S/R</th>
                <th className="py-2.5 pl-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={onToggleWatchlist ? 13 : 12}
                    className="py-10 text-center text-sm text-slate-500 dark:text-[#8d9aa8]"
                  >
                    Tidak ada emiten yang cocok dengan kombinasi kriteria filter saat ini. Coba longgarkan filter atau pilih Semua.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, visibleLimit).map((s) => {
                  const starred = watchlistSet.has(s.ticker);
                  const inCompare = compareSet.has(s.ticker);
                  const sig = computeTechnicalSignal(s);
                  return (
                    <tr
                      key={s.ticker}
                      onClick={() => (onQuickInspect ? onQuickInspect(s.ticker) : onSelectStock(s.ticker))}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#131b25]"
                    >
                      {onToggleWatchlist && (
                        <td className="py-2.5 pl-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onToggleWatchlist(s.ticker)}
                            aria-label={`${starred ? 'Hapus' : 'Tambah'} ${s.ticker} ke Watchlist`}
                            className="rounded p-1 transition-colors hover:bg-slate-200/70 dark:hover:bg-[#1d2833]"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                starred
                                  ? 'fill-amber-400 text-[#ffb020]'
                                  : 'text-slate-400 dark:text-[#8d9aa8]'
                              }`}
                            />
                          </button>
                        </td>
                      )}
                      <td className="py-2.5 pr-3 pl-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                            {s.ticker}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-[#8d9aa8]">·</span>
                          <span className="max-w-[170px] truncate text-slate-700 dark:text-[#eaf1f7]/80">
                            {s.name}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          {s.sector} · {s.subSector}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                        Rp {s.price.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-mono font-semibold tabular-nums ${
                          s.changePct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.changePct >= 0 ? '+' : ''}
                        {s.changePct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700 tabular-nums dark:text-[#eaf1f7]/80">
                        {s.s1.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700 tabular-nums dark:text-[#eaf1f7]/80">
                        {s.r1.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-mono font-semibold tabular-nums ${
                          s.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.inflow1WB >= 0 ? '+' : ''}
                        {s.inflow1WB.toFixed(1)}M
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-800 tabular-nums dark:text-[#eaf1f7]">
                        {s.roePct.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-700 tabular-nums dark:text-[#eaf1f7]/80">
                        {s.per > 0 ? `${s.per.toFixed(1)}x` : 'Neg'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-800 tabular-nums dark:text-[#eaf1f7]">
                        {s.rsi14.toFixed(0)}
                      </td>
                      <td className={`py-2.5 px-2 font-semibold whitespace-nowrap ${getSignalToneClasses(sig)}`}>
                        {sig}
                      </td>
                      <td className="py-2.5 px-2">
                        <SupportResistanceLampBadge status={s.lampStatus} compact />
                      </td>
                      <td className="py-2.5 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {onToggleCompare && (
                            <button
                              type="button"
                              onClick={() => onToggleCompare(s.ticker)}
                              title={inCompare ? 'Sudah di Banding' : 'Tambah ke Banding'}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${
                                inCompare
                                  ? 'border-emerald-500/45 bg-emerald-50 text-emerald-700 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-400 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#00e08a]'
                              }`}
                            >
                              {inCompare ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              <span>Banding</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectStock(s.ticker)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 dark:bg-[#00e08a] dark:text-[#03130b]"
                          >
                            <BarChart3 className="h-3 w-3" />
                            <span>Grafik</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {visibleLimit < filtered.length ? (
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 60)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:bg-[#1d2833]"
            >
              Muat Lebih Banyak ({filtered.length - visibleLimit} emiten tersisa)
            </button>
          ) : (
            <span />
          )}

          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/45 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/10 dark:text-[#00e08a]"
            >
              <span>Buka Banding ({compareTickers.length} dipilih)</span>
            </button>
          )}
        </div>
      </section>

      {/* v17 Filter Screener Bottom/Center Sheet Modal */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSheetOpen(false);
          }}
        >
          <div className="flex max-h-[86vh] w-full max-w-xl flex-col rounded-t-[24px] border border-slate-200 bg-white p-5 sm:rounded-[24px] dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <strong className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                Parameter Kuantitatif Screener
              </strong>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto py-4 pr-1 text-xs">
              <div>
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-400 dark:text-[#5f6d7a]">
                  Profitabilitas &amp; Risiko
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 dark:text-[#eaf1f7]">
                      <span>Minimal ROE</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                        {minRoe}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      step={1}
                      value={minRoe}
                      onChange={(e) => {
                        if (strategy === 'ALL') setStrategy('SMART');
                        setMinRoe(Number(e.target.value));
                      }}
                      className="mt-1.5 w-full accent-emerald-600 dark:accent-[#00e08a]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 dark:text-[#eaf1f7]">
                      <span>Maksimal DER (Utang / Ekuitas)</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                        {maxDer.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={3.0}
                      step={0.1}
                      value={maxDer}
                      onChange={(e) => {
                        if (strategy === 'ALL') setStrategy('SMART');
                        setMaxDer(Number(e.target.value));
                      }}
                      className="mt-1.5 w-full accent-emerald-600 dark:accent-[#00e08a]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-400 dark:text-[#5f6d7a]">
                  Arus Dana &amp; Likuiditas
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 dark:text-[#eaf1f7]">
                      <span>Minimal Inflow 1 Minggu</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                        {minInflow1W <= -500 ? 'Semua' : `Rp ${minInflow1W} M`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={150}
                      step={5}
                      value={Math.max(-50, minInflow1W)}
                      onChange={(e) => {
                        if (strategy === 'ALL') setStrategy('SMART');
                        setMinInflow1W(Number(e.target.value));
                      }}
                      className="mt-1.5 w-full accent-emerald-600 dark:accent-[#00e08a]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-slate-700 dark:text-[#eaf1f7]">
                      <span>Minimal Likuiditas ADTV</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                        Rp {minAdtv} M
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={minAdtv}
                      onChange={(e) => {
                        if (strategy === 'ALL') setStrategy('SMART');
                        setMinAdtv(Number(e.target.value));
                      }}
                      className="mt-1.5 w-full accent-emerald-600 dark:accent-[#00e08a]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-400 dark:text-[#5f6d7a]">
                  Valuasi &amp; Tren
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-[#eaf1f7]">
                      Maks PER (0 = bebas)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={maxPer}
                      onChange={(e) => setMaxPer(Math.max(0, Number(e.target.value)))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-900 dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-[#eaf1f7]">
                      Min Div. Yield (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={0.5}
                      value={minDivYield}
                      onChange={(e) => setMinDivYield(Math.max(0, Number(e.target.value)))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-900 dark:border-[#1d2833] dark:bg-[#060a0f] dark:text-[#eaf1f7]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRequireBullishTech(!requireBullishTech)}
                  className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                    requireBullishTech
                      ? 'border-emerald-500 bg-emerald-600 text-white dark:border-[#00e08a] dark:bg-[#00e08a] dark:text-[#03130b]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8]'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Wajib Teknikal Bullish</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3 dark:border-[#1d2833]">
              <button
                type="button"
                onClick={resetAllFilters}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2.5 text-xs font-extrabold text-[#03130b]"
              >
                Tampilkan {filtered.length} Saham
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
