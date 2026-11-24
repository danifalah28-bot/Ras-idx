import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Globe2,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import type {
  DeepResearchResult,
  IdxSector,
  QuarterlyResearchResponse,
  StockRecord,
} from '../types/market';
import { ALL_IDX_SECTORS } from '../data/idxUniverse';
import { computeTechnicalSignal, getSignalToneClasses } from '../utils/signals';
import { SupportResistanceLampBadge } from './SupportResistanceLamp';
import { TradingViewCandlestickChart } from './TradingViewCandlestickChart';

interface RealTimeStockTableProps {
  stocks: StockRecord[];
  watchlist?: string[];
  onToggleWatchlist?: (ticker: string) => void;
  compareTickers?: string[];
  onToggleCompare?: (ticker: string) => void;
  initialSelectedTicker?: string | null;
  onOpenFullAnalysis?: (ticker: string) => void;
  onOpenGeopolitics?: (ticker: string) => void;
  onOpenDepth?: (ticker: string) => void;
  isDark?: boolean;
  forceDark?: boolean;
  title?: string;
  subtitle?: string;
  defaultLimit?: number;
}

type TablePreset = 'ALL' | 'LIQUID' | 'GAINERS' | 'LOSERS' | 'INFLOW';
type SortKey = 'adtvB' | 'price' | 'changePct' | 'inflow1WB' | 'roePct' | 'per' | 'marketCapT' | 'ticker';
type PanelSubTab = 'chart_research' | 'quarterly' | 'ai_geopolitics';

export function RealTimeStockTable({
  stocks,
  watchlist = [],
  onToggleWatchlist,
  compareTickers = [],
  onToggleCompare,
  initialSelectedTicker = null,
  onOpenFullAnalysis,
  onOpenGeopolitics,
  onOpenDepth,
  isDark = false,
  forceDark = false,
  title = 'Daftar Saham & Harga Real-Time BEI',
  subtitle = 'Klik nama saham atau kode emiten di tabel untuk langsung menampilkan grafik candlestick real-time beserta riset fundamental, aliran dana, dan teknikal.',
  defaultLimit = 20,
}: RealTimeStockTableProps) {
  const [query, setQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<'ALL' | IdxSector>('ALL');
  const [preset, setPreset] = useState<TablePreset>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('adtvB');
  const [sortAsc, setSortAsc] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(defaultLimit);

  const [selectedTicker, setSelectedTicker] = useState<string | null>(initialSelectedTicker);
  const [panelTab, setPanelTab] = useState<PanelSubTab>('chart_research');

  const prevPricesRef = useRef<Record<string, number>>({});
  const [tickFlashes, setTickFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  const [quarterlyByTicker, setQuarterlyByTicker] = useState<Record<string, QuarterlyResearchResponse>>({});
  const [quarterlyLoading, setQuarterlyLoading] = useState(false);
  const [quarterlyError, setQuarterlyError] = useState('');

  const [aiByTicker, setAiByTicker] = useState<Record<string, DeepResearchResult>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const effectiveDark = forceDark || isDark;
  const watchlistSet = useMemo(() => new Set(watchlist), [watchlist]);
  const compareSet = useMemo(() => new Set(compareTickers), [compareTickers]);

  useEffect(() => {
    const flashes: Record<string, 'up' | 'down'> = {};
    const prev = prevPricesRef.current;
    for (const s of stocks) {
      const oldPrice = prev[s.ticker];
      if (typeof oldPrice === 'number' && oldPrice !== s.price) {
        flashes[s.ticker] = s.price > oldPrice ? 'up' : 'down';
      }
      prev[s.ticker] = s.price;
    }
    if (Object.keys(flashes).length > 0) {
      setTickFlashes(flashes);
      const t = setTimeout(() => setTickFlashes({}), 850);
      return () => clearTimeout(t);
    }
  }, [stocks]);

  const selectedStock = useMemo(
    () => (selectedTicker ? stocks.find((s) => s.ticker === selectedTicker) ?? null : null),
    [selectedTicker, stocks]
  );

  useEffect(() => {
    if (!selectedStock) return;
    if (quarterlyByTicker[selectedStock.ticker]) {
      setQuarterlyError('');
      return;
    }
    let mounted = true;
    setQuarterlyLoading(true);
    setQuarterlyError('');
    fetch(`/api/stocks/${encodeURIComponent(selectedStock.ticker)}/quarterly`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal memuat data laporan kuartalan.');
        return (await res.json()) as QuarterlyResearchResponse;
      })
      .then((json) => {
        if (mounted) {
          setQuarterlyByTicker((prev) => ({ ...prev, [selectedStock.ticker]: json }));
        }
      })
      .catch((err) => {
        if (mounted) {
          setQuarterlyError(err instanceof Error ? err.message : 'Gagal memuat riset kuartalan.');
        }
      })
      .finally(() => {
        if (mounted) setQuarterlyLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedStock?.ticker, quarterlyByTicker]);

  const runInstantAiResearch = async (ticker: string) => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/research/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          focusArea: 'ALL',
          horizon: '12-24M',
        }),
      });
      const json = (await res.json()) as DeepResearchResult & { error?: string };
      if (!res.ok) {
        setAiError(json.error || 'Gagal menjalankan riset AI emiten.');
      } else {
        setAiByTicker((prev) => ({ ...prev, [ticker]: json }));
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Kesalahan jaringan saat riset AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectStockClick = (ticker: string) => {
    setSelectedTicker(ticker);
    setAiError('');
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'ticker');
    }
  };

  const handlePresetChange = (next: TablePreset) => {
    setPreset(next);
    setVisibleLimit(defaultLimit);
    if (next === 'GAINERS') {
      setSortKey('changePct');
      setSortAsc(false);
    } else if (next === 'LOSERS') {
      setSortKey('changePct');
      setSortAsc(true);
    } else if (next === 'INFLOW') {
      setSortKey('inflow1WB');
      setSortAsc(false);
    } else if (next === 'LIQUID') {
      setSortKey('adtvB');
      setSortAsc(false);
    }
  };

  const filteredStocks = useMemo(() => {
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
      if (sectorFilter !== 'ALL' && s.sector !== sectorFilter) return false;
      if (preset === 'GAINERS' && s.changePct <= 0) return false;
      if (preset === 'LOSERS' && s.changePct >= 0) return false;
      if (preset === 'INFLOW' && s.inflow1WB <= 0) return false;
      if (preset === 'LIQUID' && s.adtvB < 25) return false;
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
  }, [stocks, query, sectorFilter, preset, sortKey, sortAsc]);

  const displayedStocks = filteredStocks.slice(0, visibleLimit);

  const lastUpdateTime = useMemo(() => {
    const latest = stocks[0]?.lastUpdated;
    if (!latest) return 'Live Stream';
    const parsed = new Date(latest);
    if (Number.isNaN(parsed.getTime())) return 'Live Stream';
    return `${parsed.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })} WIB`;
  }, [stocks]);

  const selectedQuarterly = selectedStock ? quarterlyByTicker[selectedStock.ticker] : undefined;
  const selectedAi = selectedStock ? aiByTicker[selectedStock.ticker] : undefined;
  const selectedMaxFlow = selectedStock
    ? Math.max(...selectedStock.flowHistory5D.map((v) => Math.abs(v)), 1)
    : 1;

  return (
    <div className={forceDark ? 'dark' : ''}>
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        {/* Header Bar */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-[#1d2833]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
                {title}
              </h2>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-[#00e08a]">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                <span>LIVE · {lastUpdateTime}</span>
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-[#8d9aa8]">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500 tabular-nums dark:text-[#8d9aa8]">
            <span>{filteredStocks.length} Emiten Ditampilkan</span>
            {selectedStock && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-emerald-700 dark:text-[#00e08a]">
                  Aktif: {selectedStock.ticker}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Semua Saham' },
                { id: 'LIQUID', label: 'Terlikuid' },
                { id: 'GAINERS', label: 'Top Gainers' },
                { id: 'LOSERS', label: 'Top Losers' },
                { id: 'INFLOW', label: 'Akumulasi Inflow' },
              ] as { id: TablePreset; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePresetChange(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                  preset === tab.id
                    ? 'border border-emerald-500/45 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleLimit(defaultLimit);
                }}
                placeholder="Cari kode / nama saham..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-900 placeholder-slate-400 focus:border-[#00e08a] focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder-[#8d9aa8]"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value as 'ALL' | IdxSector);
                setVisibleLimit(defaultLimit);
              }}
              aria-label="Filter sektor saham"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-[#00e08a] focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7]"
            >
              <option value="ALL">Semua Sektor BEI</option>
              {ALL_IDX_SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INSTANT CHART + RESEARCH PANEL */}
        {selectedStock && (
          <div
            ref={panelRef}
            className="mt-5 rounded-2xl border border-emerald-400/50 bg-slate-50/70 p-4 sm:p-5 dark:border-[#00e08a]/40 dark:bg-[#0b1219]"
          >
            {/* Selected Stock Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-[#1d2833]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-xl font-extrabold text-slate-900 dark:text-[#eaf1f7]">
                    {selectedStock.ticker}
                  </span>
                  <span className="text-base font-semibold text-slate-800 dark:text-[#cbd5e1]">
                    {selectedStock.name}
                  </span>
                  <SupportResistanceLampBadge status={selectedStock.lampStatus} compact />
                  <span
                    className={`font-mono text-xs font-bold ${getSignalToneClasses(
                      computeTechnicalSignal(selectedStock)
                    )}`}
                  >
                    Sinyal: {computeTechnicalSignal(selectedStock)}
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  <span>{selectedStock.sector}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedStock.subSector}</span>
                  <span aria-hidden="true">·</span>
                  <span>Papan {selectedStock.board}</span>
                  {selectedStock.indexTags.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                        {selectedStock.indexTags.join(' · ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-[#eaf1f7]">
                    Rp {selectedStock.price.toLocaleString('id-ID')}
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      selectedStock.changePct >= 0
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : 'text-red-700 dark:text-[#ff5a68]'
                    }`}
                  >
                    {selectedStock.changePct >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {selectedStock.change >= 0 ? '+' : ''}
                      {selectedStock.change.toLocaleString('id-ID')} (
                      {selectedStock.changePct >= 0 ? '+' : ''}
                      {selectedStock.changePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(selectedStock.ticker)}
                      className={`inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs font-bold transition-colors ${
                        compareSet.has(selectedStock.ticker)
                          ? 'border-emerald-500/45 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#00e08a]/50 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7]'
                      }`}
                    >
                      {compareSet.has(selectedStock.ticker) ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>{compareSet.has(selectedStock.ticker) ? 'Di Banding' : 'Banding'}</span>
                    </button>
                  )}

                  {onToggleWatchlist && (
                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(selectedStock.ticker)}
                      title={
                        watchlistSet.has(selectedStock.ticker)
                          ? 'Hapus dari Watchlist'
                          : 'Simpan ke Watchlist'
                      }
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                        watchlistSet.has(selectedStock.ticker)
                          ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-[#ffb020]/45 dark:bg-[#ffb020]/15 dark:text-[#ffb020]'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-amber-600 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#ffb020]'
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          watchlistSet.has(selectedStock.ticker) ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedTicker(null)}
                    aria-label="Tutup panel grafik dan riset"
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tutup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instant Panel Sub-Navigation Tabs */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-[#1d2833] dark:bg-[#0e141c]">
                <button
                  type="button"
                  onClick={() => setPanelTab('chart_research')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    panelTab === 'chart_research'
                      ? 'bg-emerald-600 text-white dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Grafik &amp; Riset Utama</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPanelTab('quarterly')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    panelTab === 'quarterly'
                      ? 'bg-emerald-600 text-white dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Riset Kuartalan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPanelTab('ai_geopolitics');
                    if (!aiByTicker[selectedStock.ticker] && !aiLoading) {
                      void runInstantAiResearch(selectedStock.ticker);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    panelTab === 'ai_geopolitics'
                      ? 'bg-emerald-600 text-white dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Riset AI &amp; Geopolitik</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onOpenDepth && (
                  <button
                    type="button"
                    onClick={() => onOpenDepth(selectedStock.ticker)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#00e08a]/50 hover:text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#cbd5e1] dark:hover:text-[#00e08a]"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Orderbook Depth</span>
                  </button>
                )}
                {onOpenGeopolitics && (
                  <button
                    type="button"
                    onClick={() => onOpenGeopolitics(selectedStock.ticker)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#00e08a]/50 hover:text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#cbd5e1] dark:hover:text-[#00e08a]"
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    <span>Riset Geopolitik</span>
                  </button>
                )}
                {onOpenFullAnalysis && (
                  <button
                    type="button"
                    onClick={() => onOpenFullAnalysis(selectedStock.ticker)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 py-1.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105"
                  >
                    <span>Buka Analisis Lengkap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-tab 1: Grafik Real-Time + Riset Utama */}
            {panelTab === 'chart_research' && (
              <div className="mt-4 grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <TradingViewCandlestickChart stock={selectedStock} isDark={effectiveDark} />
                </div>

                <div className="space-y-4 xl:col-span-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#1d2833] dark:bg-[#0e141c]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-[#1d2833]">
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                        Riset Fundamental &amp; Valuasi
                      </h3>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-[#00e08a]">
                        Skor Kesehatan: {selectedStock.financialHealthScore}/100
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2.5 font-mono text-xs tabular-nums sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">ROE</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.roePct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">PER</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.per > 0 ? `${selectedStock.per.toFixed(1)}x` : 'Negatif'}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">PBV</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.pbv.toFixed(2)}x
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">DER</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.der.toFixed(2)}x
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">Div. Yield</div>
                        <div className="mt-0.5 text-sm font-bold text-emerald-700 dark:text-[#00e08a]">
                          {selectedStock.divYieldPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">Mkt Cap</div>
                        <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                          Rp {selectedStock.marketCapT.toFixed(1)} T
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#cbd5e1]">
                      <strong>Ringkasan Fundamental:</strong> Laba bersih tahunan Rp{' '}
                      <span className="font-mono font-semibold">{selectedStock.netProfitT.toFixed(2)} T</span> dengan
                      margin bersih{' '}
                      <span className="font-mono font-semibold">{selectedStock.netMarginPct.toFixed(1)}%</span>, EPS YoY{' '}
                      <span
                        className={`font-mono font-semibold ${
                          selectedStock.epsGrowthPct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {selectedStock.epsGrowthPct >= 0 ? '+' : ''}
                        {selectedStock.epsGrowthPct.toFixed(1)}%
                      </span>
                      , serta Free Cash Flow Rp{' '}
                      <span className="font-mono font-semibold">{selectedStock.freeCashFlowT.toFixed(2)} T</span>.
                    </div>
                  </div>

                  {/* Level S/R & Aliran Dana */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#1d2833] dark:bg-[#0e141c]">
                    <h3 className="border-b border-slate-100 pb-2.5 font-display text-sm font-bold text-slate-900 dark:border-[#1d2833] dark:text-[#eaf1f7]">
                      Riset Teknikal S/R &amp; Aliran Dana (5D)
                    </h3>

                    <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-xs tabular-nums">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Support S1</div>
                        <div className="mt-0.5 font-bold text-emerald-700 dark:text-[#00e08a]">
                          {selectedStock.s1.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Resisten R1</div>
                        <div className="mt-0.5 font-bold text-red-700 dark:text-[#ff5a68]">
                          {selectedStock.r1.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">MA 20</div>
                        <div className="mt-0.5 font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.ma20.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">RSI(14)</div>
                        <div className="mt-0.5 font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedStock.rsi14.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Inflow 1D</div>
                        <div
                          className={`mt-0.5 font-bold ${
                            selectedStock.inflow1DB >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }`}
                        >
                          {selectedStock.inflow1DB >= 0 ? '+' : ''}
                          {selectedStock.inflow1DB.toFixed(1)} M
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Inflow 1W</div>
                        <div
                          className={`mt-0.5 font-bold ${
                            selectedStock.inflow1WB >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }`}
                        >
                          {selectedStock.inflow1WB >= 0 ? '+' : ''}
                          {selectedStock.inflow1WB.toFixed(1)} M
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[10px] text-slate-500 dark:text-[#8d9aa8]">Asing 1W</div>
                        <div
                          className={`mt-0.5 font-bold ${
                            selectedStock.foreignFlow1WB >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }`}
                        >
                          {selectedStock.foreignFlow1WB >= 0 ? '+' : ''}
                          {selectedStock.foreignFlow1WB.toFixed(1)} M
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {selectedStock.flowHistory5D.map((val, idx) => {
                        const pct = Math.max(14, Math.round((Math.abs(val) / selectedMaxFlow) * 100));
                        const isPos = val >= 0;
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="flex h-12 w-full items-end justify-center rounded bg-slate-100 p-1 dark:bg-[#131b25]">
                              <div
                                className={`w-full rounded-xs ${
                                  isPos ? 'bg-emerald-600 dark:bg-[#00e08a]' : 'bg-red-500 dark:bg-[#ff5a68]'
                                }`}
                                style={{ height: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`mt-1 font-mono text-[10px] tabular-nums ${
                                isPos
                                  ? 'text-emerald-700 dark:text-[#00e08a]'
                                  : 'text-red-700 dark:text-[#ff5a68]'
                              }`}
                            >
                              {isPos ? '+' : ''}
                              {val.toFixed(0)}M
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="mt-2.5 text-xs text-slate-600 dark:text-[#8d9aa8]">
                      {selectedStock.lampDetail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Riset Keuangan Kuartalan */}
            {panelTab === 'quarterly' && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#1d2833] dark:bg-[#0e141c]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Riset Laporan Keuangan Kuartalan — {selectedStock.ticker}
                  </h3>
                  {selectedQuarterly && (
                    <span className="font-mono text-xs text-slate-500 dark:text-[#8d9aa8]">
                      {selectedQuarterly.quarters.length} Kuartal Terakhir ·{' '}
                      {selectedQuarterly.source === 'live-yahoo' ? 'Live Financial Feed' : 'IDX Model'}
                    </span>
                  )}
                </div>

                {quarterlyLoading && !selectedQuarterly ? (
                  <div className="flex items-center gap-2 py-8 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#00e08a]" />
                    <span>Mengambil laporan kuartalan real-time {selectedStock.ticker}...</span>
                  </div>
                ) : quarterlyError ? (
                  <p className="py-6 text-xs text-red-600 dark:text-[#ff5a68]">{quarterlyError}</p>
                ) : selectedQuarterly ? (
                  <div className="mt-3 space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono tabular-nums">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          Pendapatan YoY
                        </div>
                        <div
                          className={`mt-1 text-sm font-bold ${
                            selectedQuarterly.yoyRevenueGrowthPct >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }`}
                        >
                          {selectedQuarterly.yoyRevenueGrowthPct >= 0 ? '+' : ''}
                          {selectedQuarterly.yoyRevenueGrowthPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          Laba Bersih YoY
                        </div>
                        <div
                          className={`mt-1 text-sm font-bold ${
                            selectedQuarterly.yoyProfitGrowthPct >= 0
                              ? 'text-emerald-700 dark:text-[#00e08a]'
                              : 'text-red-700 dark:text-[#ff5a68]'
                          }`}
                        >
                          {selectedQuarterly.yoyProfitGrowthPct >= 0 ? '+' : ''}
                          {selectedQuarterly.yoyProfitGrowthPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          Tren Margin
                        </div>
                        <div className="mt-1 font-sans text-xs font-bold text-slate-900 dark:text-[#eaf1f7]">
                          {selectedQuarterly.marginTrend}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="font-sans text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          Rasio Kualitas Laba
                        </div>
                        <div className="mt-1 text-sm font-bold text-emerald-700 dark:text-[#00e08a]">
                          {selectedQuarterly.earningsQualityRatio.toFixed(2)}x
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                            <th className="py-2 pr-3">Periode</th>
                            <th className="py-2 px-3 text-right">Pendapatan (T)</th>
                            <th className="py-2 px-3 text-right">Laba Bersih (T)</th>
                            <th className="py-2 px-3 text-right">NPM %</th>
                            <th className="py-2 px-3 text-right">ROE %</th>
                            <th className="py-2 pl-3 text-right">EPS (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono tabular-nums dark:divide-[#1d2833]">
                          {selectedQuarterly.quarters.slice(-6).reverse().map((q) => (
                            <tr key={q.quarter}>
                              <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                                {q.periodLabel}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-700 dark:text-[#cbd5e1]">
                                Rp {q.revenueT.toFixed(2)} T
                              </td>
                              <td
                                className={`py-2 px-3 text-right font-semibold ${
                                  q.netProfitT >= 0
                                    ? 'text-emerald-700 dark:text-[#00e08a]'
                                    : 'text-red-700 dark:text-[#ff5a68]'
                                }`}
                              >
                                Rp {q.netProfitT.toFixed(2)} T
                              </td>
                              <td className="py-2 px-3 text-right text-slate-700 dark:text-[#cbd5e1]">
                                {q.netMarginPct.toFixed(1)}%
                              </td>
                              <td className="py-2 px-3 text-right text-slate-700 dark:text-[#cbd5e1]">
                                {q.roePct.toFixed(1)}%
                              </td>
                              <td className="py-2 pl-3 text-right text-slate-900 dark:text-[#eaf1f7]">
                                {q.epsIdr.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#cbd5e1]">
                      {selectedQuarterly.summary}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Sub-tab 3: Riset AI & Geopolitik */}
            {panelTab === 'ai_geopolitics' && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#1d2833] dark:bg-[#0e141c]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                      Riset AI Prospek &amp; Geopolitik — {selectedStock.ticker}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                      Analisis risiko makro, sensitivitas komoditas &amp; kurs, serta skenario 12–24 bulan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void runInstantAiResearch(selectedStock.ticker)}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 py-1.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105 disabled:opacity-60"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'Menganalisis...' : 'Perbarui Riset AI'}</span>
                  </button>
                </div>

                {aiLoading && !selectedAi ? (
                  <div className="flex items-center gap-2 py-8 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#00e08a]" />
                    <span>Menjalankan riset geopolitik &amp; prospek untuk {selectedStock.ticker}...</span>
                  </div>
                ) : aiError ? (
                  <p className="py-4 text-xs text-red-600 dark:text-[#ff5a68]">{aiError}</p>
                ) : selectedAi ? (
                  <div className="mt-3 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                      <div className="mb-1 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                        Kesimpulan Strategis
                      </div>
                      <p>{selectedAi.executiveVerdict}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="mb-1 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                          Prospek Masa Depan
                        </div>
                        <p>{selectedAi.futureOutlook}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-[#1d2833] dark:bg-[#131b25]">
                        <div className="mb-1 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                          Sensitivitas Geopolitik &amp; Kurs
                        </div>
                        <p>{selectedAi.geopoliticalAnalysis}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    Klik &quot;Perbarui Riset AI&quot; untuk menghasilkan ringkasan riset mendalam.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Real-Time Stock Directory Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                <th className="py-3 pr-3">
                  <button
                    type="button"
                    onClick={() => handleSort('ticker')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#eaf1f7]"
                  >
                    <span>Saham &amp; Emiten</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('price')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#eaf1f7]"
                  >
                    <span>Harga Real-Time</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('changePct')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#eaf1f7]"
                  >
                    <span>1D %</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('inflow1WB')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#eaf1f7]"
                  >
                    <span>Inflow 1W</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('roePct')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-[#eaf1f7]"
                  >
                    <span>ROE / PER</span>
                    <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Sinyal &amp; Lampu S/R</th>
                <th className="py-3 pl-3 text-right">Grafik &amp; Riset</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#1d2833]">
              {displayedStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
                    Tidak ada saham yang cocok dengan pencarian atau filter Anda.
                  </td>
                </tr>
              ) : (
                displayedStocks.map((s) => {
                  const isSelected = selectedTicker === s.ticker;
                  const flash = tickFlashes[s.ticker];
                  const sig = computeTechnicalSignal(s);
                  const inCompare = compareSet.has(s.ticker);

                  return (
                    <tr
                      key={s.ticker}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/75 dark:bg-[#00e08a]/8'
                          : 'hover:bg-slate-50 dark:hover:bg-[#131b25]'
                      }`}
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          {onToggleWatchlist && (
                            <button
                              type="button"
                              onClick={() => onToggleWatchlist(s.ticker)}
                              aria-label={
                                watchlistSet.has(s.ticker)
                                  ? `Hapus ${s.ticker} dari Watchlist`
                                  : `Tambah ${s.ticker} ke Watchlist`
                              }
                              className={`shrink-0 rounded p-1 transition-colors ${
                                watchlistSet.has(s.ticker)
                                  ? 'text-amber-500 dark:text-[#ffb020]'
                                  : 'text-slate-300 hover:text-amber-500 dark:text-[#3d4959] dark:hover:text-[#ffb020]'
                              }`}
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  watchlistSet.has(s.ticker) ? 'fill-current' : ''
                                }`}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectStockClick(s.ticker)}
                            className="group min-w-0 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-display font-bold transition-colors ${
                                  isSelected
                                    ? 'text-emerald-700 dark:text-[#00e08a]'
                                    : 'text-slate-900 group-hover:text-emerald-700 dark:text-[#eaf1f7] dark:group-hover:text-[#00e08a]'
                                }`}
                              >
                                {s.ticker}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400 dark:text-[#8d9aa8]">
                                {s.sector}
                              </span>
                            </div>
                            <div className="max-w-[230px] truncate text-xs font-medium text-slate-700 group-hover:text-slate-900 group-hover:underline dark:text-[#cbd5e1] dark:group-hover:text-[#eaf1f7]">
                              {s.name}
                            </div>
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 font-semibold transition-colors duration-300 ${
                            flash === 'up'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-[#00e08a]/20 dark:text-[#00e08a]'
                              : flash === 'down'
                              ? 'bg-red-100 text-red-800 dark:bg-[#ff5a68]/20 dark:text-[#ff5a68]'
                              : 'text-slate-900 dark:text-[#eaf1f7]'
                          }`}
                        >
                          Rp {s.price.toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums ${
                          s.changePct >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.changePct >= 0 ? '▲ +' : '▼ '}
                        {s.changePct.toFixed(2)}%
                      </td>

                      <td
                        className={`py-2.5 px-3 text-right font-mono font-medium tabular-nums ${
                          s.inflow1WB >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        {s.inflow1WB >= 0 ? '+' : ''}
                        {s.inflow1WB.toFixed(1)} M
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-xs tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-[#eaf1f7]">
                          {s.roePct.toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">
                          PER {s.per > 0 ? `${s.per.toFixed(1)}x` : '-'}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-mono text-xs font-bold ${getSignalToneClasses(sig)}`}>
                            {sig}
                          </span>
                          <SupportResistanceLampBadge status={s.lampStatus} compact />
                        </div>
                      </td>

                      <td className="py-2.5 pl-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {onToggleCompare && (
                            <button
                              type="button"
                              onClick={() => onToggleCompare(s.ticker)}
                              title={inCompare ? 'Hapus dari Banding Saham' : 'Tambah ke Banding Saham'}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors whitespace-nowrap ${
                                inCompare
                                  ? 'border-emerald-500/45 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#00e08a]/50 hover:text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#00e08a]'
                              }`}
                            >
                              {inCompare ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              <span>Banding</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSelectStockClick(s.ticker)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#00e08a] to-[#00b86f] text-[#03130b]'
                                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#00e08a]/50 hover:text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#cbd5e1] dark:hover:text-[#00e08a]'
                            }`}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>{isSelected ? 'Terbuka' : 'Grafik & Riset'}</span>
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

        {/* Pagination / Expand All */}
        {filteredStocks.length > visibleLimit && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
            <span className="text-xs text-slate-500 tabular-nums dark:text-[#8d9aa8]">
              Menampilkan {displayedStocks.length} dari {filteredStocks.length} saham
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 30)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#00e08a]/50 hover:text-emerald-700 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:text-[#00e08a]"
              >
                Tampilkan +30 Lagi
              </button>
              <button
                type="button"
                onClick={() => setVisibleLimit(filteredStocks.length)}
                className="rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 py-1.5 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105"
              >
                Lihat Semua ({filteredStocks.length})
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
