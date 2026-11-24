import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  Copy,
  ExternalLink,
  Globe2,
  Minus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type {
  DeepResearchResult,
  GeopoliticsFocusArea,
  MacroLiveResponse,
  ResearchHorizon,
  StockRecord,
} from '../types/market';

interface DeepGeopoliticsResearchProps {
  stock: StockRecord;
  stocks?: StockRecord[];
  macro: MacroLiveResponse | null;
  macroLoading?: boolean;
  onRefreshMacro?: (withAi: boolean) => void;
  onSelectStock?: (ticker: string) => void;
  onChangeTicker?: (ticker: string) => void;
}

type GeoTheme = 'Semua' | 'Energi & Timur Tengah' | 'Perdagangan' | 'Moneter' | 'Domestik';

const GEO_THEMES: GeoTheme[] = [
  'Semua',
  'Energi & Timur Tengah',
  'Perdagangan',
  'Moneter',
  'Domestik',
];

const FOCUS_OPTIONS: { id: GeopoliticsFocusArea; label: string }[] = [
  { id: 'ALL', label: 'Semua Isu' },
  { id: 'TARIFF_SUPPLY', label: 'Tarif & Rantai Pasok' },
  { id: 'ENERGY_CONFLICT', label: 'Energi & Konflik' },
  { id: 'RATES_FX', label: 'Suku Bunga & Kurs' },
  { id: 'DOWNSTREAM_POLICY', label: 'Hilirisasi RI' },
];

const HORIZON_OPTIONS: { id: ResearchHorizon; label: string }[] = [
  { id: '6-12M', label: '6–12 Bln' },
  { id: '12-24M', label: '12–24 Bln' },
];

const SECTOR_IMPACT_MAP = [
  {
    sector: 'Energi & Batu Bara',
    dir: 'up' as const,
    tickers: ['MEDC', 'ADRO', 'PTBA', 'UNTR'],
    note: 'Harga minyak dan komoditas energi yang tinggi mendukung pendapatan, namun sensitif bila terjadi de-eskalasi mendadak.',
  },
  {
    sector: 'Emas & Logam Mulia',
    dir: 'up' as const,
    tickers: ['ANTM', 'MDKA', 'BRMS'],
    note: 'Permintaan aset lindung nilai cenderung meningkat ketika ketidakpastian geopolitik & volatilitas pasar naik.',
  },
  {
    sector: 'Perbankan Besar',
    dir: 'mix' as const,
    tickers: ['BBCA', 'BBRI', 'BMRI', 'BBNI'],
    note: 'Sensitif terhadap pergerakan kurs Rupiah, arus dana asing (foreign flow), biaya dana, dan arah suku bunga BI/The Fed.',
  },
  {
    sector: 'Properti & Kawasan',
    dir: 'down' as const,
    tickers: ['BSDE', 'CTRA', 'PANI'],
    note: 'Suku bunga acuan yang bertahan ketat menekan valuasi serta ekspektasi daya beli KPR jangka pendek.',
  },
  {
    sector: 'Barang Konsumsi',
    dir: 'down' as const,
    tickers: ['UNVR', 'ICBP', 'INDF'],
    note: 'Kenaikan harga energi, logistik, dan pelemahan Rupiah dapat menekan margin bahan baku impor.',
  },
  {
    sector: 'Telekomunikasi & Infrastruktur',
    dir: 'mix' as const,
    tickers: ['TLKM', 'ISAT', 'EXCL'],
    note: 'Relatif defensif secara pendapatan domestik, tetapi sensitif pada kurs dan beban pembiayaan valas.',
  },
];

function inferThemeFromRegionOrTitle(region: string, title: string): Exclude<GeoTheme, 'Semua'> {
  const txt = `${region} ${title}`.toLowerCase();
  if (/energi|minyak|brent|hormuz|timur tengah|iran|migas|opec/.test(txt)) {
    return 'Energi & Timur Tengah';
  }
  if (/tarif|dagang|ekspor|china|tiongkok|as–china|as-china|rantai pasok|nikel|hilirisasi/.test(txt)) {
    return 'Perdagangan';
  }
  if (/fed|bi-rate|bi rate|bunga|inflasi|kurs|dolar|rupiah|sbn|moneter/.test(txt)) {
    return 'Moneter';
  }
  return 'Domestik';
}

function parsePctNumber(prob: string): number {
  const num = Number.parseFloat(prob.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) && num > 0 ? num : 33;
}

export function DeepGeopoliticsResearch({
  stock,
  stocks = [],
  macro,
  macroLoading = false,
  onRefreshMacro,
  onSelectStock,
  onChangeTicker,
}: DeepGeopoliticsResearchProps) {
  const [researchByKey, setResearchByKey] = useState<Record<string, DeepResearchResult>>({});
  const [focusArea, setFocusArea] = useState<GeopoliticsFocusArea>('ALL');
  const [horizon, setHorizon] = useState<ResearchHorizon>('12-24M');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<GeoTheme>('Semua');

  const activeKey = `${stock.ticker}:${focusArea}:${horizon}`;
  const currentResearch = researchByKey[activeKey];

  const runDeepResearch = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/research/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.ticker,
          focusArea,
          horizon,
          customTopic: customTopic.trim() || undefined,
          force: forceRefresh,
        }),
      });
      const json = (await res.json()) as DeepResearchResult & { error?: string };
      if (!res.ok) {
        setError(json.error || 'Gagal menjalankan riset geopolitik mendalam.');
      } else {
        setResearchByKey((prev) => ({ ...prev, [activeKey]: json }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesalahan jaringan saat riset mendalam.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    setCopied(false);
  }, [stock.ticker, focusArea, horizon]);

  const scenarioBarSegments = useMemo(() => {
    if (!currentResearch?.scenarios?.length) return [];
    const raw = currentResearch.scenarios.map((s) => ({
      name: s.name,
      val: parsePctNumber(s.probability),
      label: s.probability,
    }));
    const total = raw.reduce((acc, r) => acc + r.val, 0) || 100;
    return raw.map((r) => ({
      ...r,
      widthPct: Math.max(12, Math.round((r.val / total) * 100)),
    }));
  }, [currentResearch]);

  const filteredGeoEvents = useMemo(() => {
    const events = macro?.geopolitics ?? [];
    if (selectedTheme === 'Semua') return events;
    return events.filter(
      (evt) => inferThemeFromRegionOrTitle(evt.region, evt.title) === selectedTheme
    );
  }, [macro?.geopolitics, selectedTheme]);

  const quickTickerChoices = useMemo(() => {
    if (stocks.length === 0) return [stock];
    const sorted = [...stocks].sort((a, b) => b.adtvB - a.adtvB).slice(0, 60);
    if (!sorted.some((s) => s.ticker === stock.ticker)) {
      return [stock, ...sorted];
    }
    return sorted;
  }, [stocks, stock]);

  const handleCopyBrief = async () => {
    if (!currentResearch) return;
    const lines = [
      `RISET GEOPOLITIK & MAKRO — ${currentResearch.ticker} (${currentResearch.companyName})`,
      `Horizon: ${currentResearch.horizon ?? horizon} | Fokus: ${FOCUS_OPTIONS.find((f) => f.id === (currentResearch.focusArea ?? focusArea))?.label ?? 'Semua Isu'}`,
      currentResearch.exposureSummary ? `Posisi Eksposur: ${currentResearch.exposureSummary}` : '',
      '',
      `[Prospek Masa Depan]\n${currentResearch.futureOutlook}`,
      '',
      `[Analisis Geopolitik]\n${currentResearch.geopoliticalAnalysis}`,
      '',
      `[Sensitivitas Komoditas & Kurs]\n${currentResearch.commoditySensitivity}`,
      '',
      `[Skenario Probabilistik]\n${currentResearch.scenarios.map((s) => `- ${s.name} (${s.probability} | ${s.targetBias}): ${s.catalyst}`).join('\n')}`,
      '',
      `[Kesimpulan Strategis]\n${currentResearch.executiveVerdict}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked in restricted iframe
    }
  };

  const brentComm = useMemo(() => {
    return macro?.commodities?.find((c) => /brent|crude|oil|minyak/i.test(c.name));
  }, [macro?.commodities]);

  const goldComm = useMemo(() => {
    return macro?.commodities?.find((c) => /gold|emas/i.test(c.name));
  }, [macro?.commodities]);

  return (
    <div className="space-y-6">
      {/* v17 Hero Header + Brief Card */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span className="font-semibold text-emerald-700 dark:text-[#00e08a]">
                Risiko Global · Dampak ke IDX
              </span>
              {macro?.updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Diperbarui{' '}
                    {new Date(macro.updatedAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'Asia/Jakarta',
                    })}{' '}
                    WIB
                  </span>
                </>
              )}
              {macro?.aiSynthesized && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700 dark:text-[#00e08a]">
                    Sintesis AI Live
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Riset Geopolitik &amp; Makro Dunia
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#8d9aa8]">
              Isu global yang menggerakkan pasar saham Indonesia — dari gejolak energi, perdagangan, komoditas, hingga kebijakan suku bunga The Fed &amp; BI.
            </p>
          </div>

          {onRefreshMacro && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onRefreshMacro(false)}
                disabled={macroLoading}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#2a3846]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${macroLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Feed</span>
              </button>
              <button
                type="button"
                onClick={() => onRefreshMacro(true)}
                disabled={macroLoading}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/12 dark:text-[#00e08a] dark:hover:bg-[#00e08a]/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sintesis AI Global</span>
              </button>
            </div>
          )}
        </div>

        {/* v17 Ringkasan Brief Card */}
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-gradient-to-br from-emerald-50/50 to-slate-50 p-4 sm:p-5 dark:border-[#243140] dark:bg-none dark:[background-image:linear-gradient(145deg,#131d28,#0d141d)]">
          <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
            <Compass className="h-4 w-4 text-emerald-700 dark:text-[#00e08a]" />
            <span>Ringkasan Sentimen Global Terkini</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#c4cfda]">
            {macro?.worldSummary ||
              'Mengambil ringkasan sentimen makro dan geopolitik dunia terhadap pasar modal Indonesia (BEI), kurs Rupiah, dan komoditas utama...'}
          </p>
        </div>

        {/* v17 4-Card Live Macro Strip */}
        {macro && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-[15px] border border-slate-200 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div className="text-[11px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                  Indeks IHSG Live
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                  <span className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                    {macro.ihsg.value.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      macro.ihsg.changePct >= 0
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : 'text-red-700 dark:text-[#ff5a68]'
                    }`}
                  >
                    {macro.ihsg.changePct >= 0 ? '+' : ''}
                    {macro.ihsg.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-[#8d9aa8]">
                  Barometer likuiditas ekuitas domestik
                </div>
              </div>

              <div className="rounded-[15px] border border-slate-200 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div className="text-[11px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                  Kurs USD/IDR
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                  <span className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Rp {macro.usdIdr.value.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      macro.usdIdr.changePct <= 0
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : 'text-red-700 dark:text-[#ff5a68]'
                    }`}
                  >
                    {macro.usdIdr.changePct >= 0 ? '+' : ''}
                    {macro.usdIdr.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-[#8d9aa8]">
                  Tekanan nilai tukar &amp; arus modal asing
                </div>
              </div>

              <div className="rounded-[15px] border border-slate-200 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div className="text-[11px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                  BI-Rate &amp; The Fed
                </div>
                <div className="mt-1 font-display text-base font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                  {macro.biRate} / {macro.fedRate}
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-[#8d9aa8]">
                  Selisih suku bunga acuan moneter
                </div>
              </div>

              <div className="rounded-[15px] border border-slate-200 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div className="text-[11px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                  Energi &amp; Emas Dunia
                </div>
                <div className="mt-1 font-display text-sm font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                  {brentComm ? `${brentComm.name.split(' ')[0]} ${brentComm.price}` : 'Komoditas Live'}
                </div>
                <div className="mt-1 text-[10.5px] text-slate-500 dark:text-[#8d9aa8]">
                  {goldComm ? `${goldComm.name}: ${goldComm.price}` : 'Pantau pergerakan komoditas'}
                </div>
              </div>
            </div>

            {/* 6 Live Global Commodities */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {macro.commodities.slice(0, 6).map((c) => (
                <div
                  key={c.symbol}
                  title={c.impactOnIdx}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#1d2833] dark:bg-[#0b1219]"
                >
                  <div className="truncate text-[11px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                    {c.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                    {c.price}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <span
                      className={`font-mono text-[11px] font-bold tabular-nums ${
                        c.changePct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {c.changePct >= 0 ? '+' : ''}
                      {c.changePct.toFixed(2)}%
                    </span>
                    <span className="truncate text-[10px] text-slate-400 dark:text-[#8d9aa8]">
                      {c.affectedSectors[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Live Deep Research per Emiten (High Thinking + Google Search) */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span className="font-mono font-bold text-emerald-700 dark:text-[#00e08a]">
                {stock.ticker}
              </span>
              <span aria-hidden="true">·</span>
              <span>{stock.sector}</span>
              <span aria-hidden="true">·</span>
              <span>High Thinking + Google Search + Live Makro</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-[#eaf1f7]">
              Riset Mendalam Emiten: {stock.ticker} — {stock.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
              Memetakan transmisi isu geopolitik terkini, tarif dagang, suku bunga global, kurs USD/IDR, dan komoditas dunia ke fundamental {stock.ticker} beserta skenario probabilistik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {quickTickerChoices.length > 1 && onChangeTicker && (
              <select
                value={stock.ticker}
                onChange={(e) => onChangeTicker(e.target.value)}
                aria-label="Pilih emiten untuk riset geopolitik"
                className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:border-[#00e08a] focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7]"
              >
                {quickTickerChoices.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} — {s.name.slice(0, 22)}
                  </option>
                ))}
              </select>
            )}

            {currentResearch && (
              <button
                type="button"
                onClick={() => void handleCopyBrief()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#2a3846]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#00e08a]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? 'Tersalin' : 'Salin Ringkasan'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void runDeepResearch(Boolean(currentResearch))}
              disabled={loading}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs sm:text-sm font-extrabold text-[#03130b] transition-all hover:brightness-105 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyusun Riset...</span>
                </>
              ) : (
                <>
                  <Globe2 className="h-4 w-4" />
                  <span>
                    {currentResearch ? 'Perbarui Riset' : `Jalankan Riset ${stock.ticker}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Research Parameters Toolbar */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 xl:flex-row xl:items-center xl:justify-between dark:border-[#1d2833]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFocusArea(opt.id)}
                  className={`min-h-[30px] rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    focusArea === opt.id
                      ? 'bg-emerald-600 text-white shadow-xs dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
              {HORIZON_OPTIONS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHorizon(h.id)}
                  className={`min-h-[30px] rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    horizon === h.id
                      ? 'bg-emerald-600 text-white shadow-xs dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2 xl:max-w-sm">
            <input
              type="text"
              maxLength={160}
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  e.preventDefault();
                  void runDeepResearch(true);
                }
              }}
              placeholder="Sudut khusus (mis: Selat Hormuz / tarif AS)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00e08a] focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff9aa2]">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#1d2833] dark:bg-[#0b1219]">
            <div className="text-xs font-semibold text-slate-800 dark:text-[#eaf1f7]">
              Menyelaraskan data makro langsung, pencarian berita global terkini, dan penalaran High Thinking untuk {stock.ticker}...
            </div>
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[#1d2833]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-[#1d2833]" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-[#1d2833]" />
          </div>
        )}

        {/* Deep Research Output */}
        {!loading && currentResearch && (
          <div className="mt-6 space-y-5 border-t border-slate-100 pt-5 dark:border-[#1d2833]">
            {/* Stance & Meta Summary Strip */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5 dark:border-[#00e08a]/30 dark:bg-[#00e08a]/5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                <span className="font-bold text-emerald-700 dark:text-[#00e08a]">
                  Ringkasan Posisi Eksposur {currentResearch.ticker}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">Horizon {currentResearch.horizon ?? horizon}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {currentResearch.cached ? 'Cache Cepat (15 mnt)' : 'Pencarian Web Langsung'}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-900 dark:text-[#eaf1f7]">
                {currentResearch.exposureSummary || currentResearch.executiveVerdict}
              </p>

              {/* Transmission Channels Matrix */}
              {currentResearch.transmissionChannels &&
                currentResearch.transmissionChannels.length > 0 && (
                  <div className="mt-4 overflow-x-auto border-t border-slate-200/70 pt-4 dark:border-[#1d2833]">
                    <h3 className="mb-2.5 font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                      Matriks Jalur Transmisi Geopolitik ke Fundamental {currentResearch.ticker}
                    </h3>
                    <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 dark:border-[#1d2833] dark:text-[#8d9aa8]">
                          <th className="py-2 pr-4 font-semibold">Jalur Transmisi</th>
                          <th className="px-4 py-2 font-semibold">Arah Dampak</th>
                          <th className="px-4 py-2 font-semibold">Intensitas</th>
                          <th className="py-2 pl-4 font-semibold">Mekanisme Pengaruh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-[#1d2833]">
                        {currentResearch.transmissionChannels.map((ch, idx) => {
                          const isPos = ch.direction === 'Positif';
                          const isNeg = ch.direction === 'Negatif';
                          return (
                            <tr key={idx} className="align-top">
                              <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-[#eaf1f7]">
                                {ch.channel}
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 font-bold ${
                                    isPos
                                      ? 'text-emerald-700 dark:text-[#00e08a]'
                                      : isNeg
                                      ? 'text-red-700 dark:text-[#ff5a68]'
                                      : 'text-amber-700 dark:text-[#ffb020]'
                                  }`}
                                >
                                  {isPos ? (
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  ) : isNeg ? (
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                  ) : (
                                    <Minus className="h-3.5 w-3.5" />
                                  )}
                                  <span>{ch.direction}</span>
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono whitespace-nowrap text-slate-700 dark:text-[#cbd5e1]">
                                {ch.intensity}
                              </td>
                              <td className="py-2.5 pl-4 leading-relaxed text-slate-600 dark:text-[#c4cfda]">
                                {ch.mechanism}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>

            {/* Future Outlook + Geopolitics + Commodity Sensitivity */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 lg:col-span-6 space-y-4 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Prospek Masa Depan Perusahaan ({currentResearch.horizon ?? horizon})
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-[#c4cfda]">
                    {currentResearch.futureOutlook}
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-4 dark:border-[#1d2833]">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Sensitivitas Komoditas Dunia &amp; Nilai Tukar
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-[#c4cfda]">
                    {currentResearch.commoditySensitivity}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 lg:col-span-6 space-y-4 dark:border-[#1d2833] dark:bg-[#131b25]">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Pengaruh Geopolitik &amp; Kebijakan Global Terkini
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-[#c4cfda]">
                    {currentResearch.geopoliticalAnalysis}
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-4 dark:border-[#1d2833]">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    <ShieldAlert className="h-4 w-4 text-amber-700 dark:text-[#ffb020]" />
                    <span>Tantangan Global Utama Terhadap {currentResearch.ticker}</span>
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#c4cfda]">
                    {currentResearch.globalChallenges.map((ch, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums dark:text-[#00e08a]">
                          0{idx + 1}.
                        </span>
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Probabilistic Scenarios */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-[#1d2833] dark:bg-[#131b25]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Pemetaan Skenario Probabilistik
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    Distribusi probabilitas dan pemicu utama berdasarkan kondisi makroekonomi serta fundamental terkini
                  </p>
                </div>
                {scenarioBarSegments.length > 0 && (
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 sm:w-56 dark:bg-[#0b1219]">
                    {scenarioBarSegments.map((seg) => (
                      <div
                        key={seg.name}
                        style={{ width: `${seg.widthPct}%` }}
                        title={`${seg.name}: ${seg.label}`}
                        className={
                          seg.name === 'Bull Case'
                            ? 'bg-emerald-600 dark:bg-[#00e08a]'
                            : seg.name === 'Bear Case'
                            ? 'bg-red-600 dark:bg-[#ff5a68]'
                            : 'bg-amber-500 dark:bg-[#ffb020]'
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {currentResearch.scenarios.map((sc) => {
                  const isBull = sc.name === 'Bull Case';
                  const isBear = sc.name === 'Bear Case';
                  const borderTone = isBull
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-[#00e08a]/35 dark:bg-[#00e08a]/8'
                    : isBear
                    ? 'border-red-200 bg-red-50/40 dark:border-[#ff5a68]/35 dark:bg-[#ff5a68]/8'
                    : 'border-slate-200 bg-white dark:border-[#1d2833] dark:bg-[#0e141c]';
                  const labelTone = isBull
                    ? 'text-emerald-800 dark:text-[#00e08a]'
                    : isBear
                    ? 'text-red-800 dark:text-[#ff5a68]'
                    : 'text-amber-800 dark:text-[#ffb020]';

                  return (
                    <div key={sc.name} className={`rounded-xl border p-4 ${borderTone}`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`font-display text-sm font-bold ${labelTone}`}>{sc.name}</span>
                        <span className="font-mono text-xs font-bold text-slate-900 tabular-nums dark:text-[#eaf1f7]">
                          Prob. {sc.probability}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
                        {sc.targetBias}
                      </div>
                      <div className="mt-3 border-t border-slate-200/70 pt-2.5 text-xs dark:border-[#1d2833]">
                        <div className="font-semibold text-slate-900 dark:text-[#eaf1f7]">Pemicu Utama:</div>
                        <p className="mt-0.5 text-slate-700 dark:text-[#c4cfda]">{sc.catalyst}</p>
                        <div className="mt-2 font-semibold text-slate-900 dark:text-[#eaf1f7]">Proyeksi Dampak:</div>
                        <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-[#8d9aa8]">{sc.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monitoring Triggers & Verdict */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-[#1d2833] dark:bg-[#131b25]">
              {currentResearch.monitoringTriggers && currentResearch.monitoringTriggers.length > 0 && (
                <div className="mb-4 border-b border-slate-200 pb-4 dark:border-[#1d2833]">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Indikator Kunci yang Perlu Dipantau
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {currentResearch.monitoringTriggers.map((tr, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-[#1d2833] dark:bg-[#0e141c]"
                      >
                        <div className="text-xs font-semibold text-slate-900 dark:text-[#eaf1f7]">
                          {tr.indicator}
                        </div>
                        <div className="mt-1 font-mono text-xs font-bold text-emerald-700 tabular-nums dark:text-[#00e08a]">
                          {tr.threshold}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
                          {tr.implication}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                  Kesimpulan Strategis
                </h3>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-[#8d9aa8]">
                  {currentResearch.modelUsed} ·{' '}
                  {new Date(currentResearch.generatedAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Jakarta',
                  })}{' '}
                  WIB
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-[#eaf1f7]">
                {currentResearch.executiveVerdict}
              </p>

              {currentResearch.sources.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-3 dark:border-[#1d2833]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8d9aa8]">
                    Referensi Web Real-Time
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {currentResearch.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-xs items-center gap-1.5 truncate text-xs text-emerald-700 hover:underline dark:text-[#00e08a]"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* v17 Tema Risiko + Expandable Live Geopolitics Issue Cards + Sector Impact Map */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
              Tema Risiko &amp; Radar Geopolitik Live
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
              Ketuk kartu isu untuk membaca jalur transmisi dampak ke Indonesia dan emiten terdampak
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {GEO_THEMES.map((theme) => {
              const active = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-emerald-500/45 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {filteredGeoEvents.length === 0 ? (
            <div className="col-span-full rounded-[20px] border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8]">
              Belum ada sinyal geopolitik pada tema <strong>{selectedTheme}</strong>. Pilih tema &quot;Semua&quot; atau segarkan feed makro.
            </div>
          ) : (
            filteredGeoEvents.map((evt, idx) => {
              const themeTag = inferThemeFromRegionOrTitle(evt.region, evt.title);
              const isHigh = evt.severity === 'Tinggi';
              const isMed = evt.severity === 'Sedang';
              return (
                <details
                  key={`${evt.title}-${idx}`}
                  open={idx < 2}
                  className="group rounded-[18px] border border-slate-200 bg-white overflow-hidden dark:border-[#1d2833] dark:bg-[#0e141c]"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-slate-100 text-emerald-700 dark:bg-[#131b25] dark:text-[#00e08a]">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <small className="block text-[10.5px] font-medium text-slate-500 dark:text-[#8d9aa8]">
                        {evt.region} · {themeTag}
                      </small>
                      <strong className="mt-0.5 block font-display text-sm font-bold leading-snug text-slate-900 dark:text-[#eaf1f7]">
                        {evt.title}
                      </strong>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap shrink-0 ${
                        isHigh
                          ? 'bg-red-100 text-red-700 dark:bg-[#ff5a68]/15 dark:text-[#ff5a68]'
                          : isMed
                          ? 'bg-amber-100 text-amber-800 dark:bg-[#ffb020]/15 dark:text-[#ffb020]'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 dark:text-[#8d9aa8]" />
                  </summary>

                  <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3 dark:border-[#1d2833]">
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-400 dark:text-[#5f6d7a]">
                        Situasi Terkini
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-[#c4cfda]">
                        {evt.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-[0.8px] text-slate-400 dark:text-[#5f6d7a]">
                        Jalur Dampak ke Indonesia &amp; BEI
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-[#c4cfda]">
                        {evt.idxImpact}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(evt.relatedTickers ?? []).slice(0, 6).map((tk) => (
                          <button
                            key={tk}
                            type="button"
                            onClick={() => onSelectStock?.(tk)}
                            className="rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 font-display text-[11px] font-extrabold text-emerald-800 transition-colors hover:border-emerald-500 dark:border-[#00e08a]/35 dark:bg-[#00e08a]/10 dark:text-[#00e08a] dark:hover:border-[#00e08a]"
                          >
                            {tk}
                          </button>
                        ))}
                      </div>

                      {evt.url && /^https?:\/\//i.test(evt.url) && (
                        <a
                          href={evt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-[#00e08a]"
                        >
                          <span>Sumber</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </details>
              );
            })
          )}
        </div>

        {/* v17 Peta Dampak Sektor */}
        <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="border-b border-slate-100 pb-3 dark:border-[#1d2833]">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
              Peta Dampak Sektor BEI
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
              Sensitivitas sektoral bersifat analitis dan edukatif — ketuk kode emiten untuk membuka analisis mendalam
            </p>
          </div>

          <div className="mt-2 divide-y divide-slate-100 dark:divide-[#1d2833]">
            {SECTOR_IMPACT_MAP.map((row) => (
              <div key={row.sector} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-xs font-extrabold ${
                      row.dir === 'up'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                        : row.dir === 'down'
                        ? 'bg-red-100 text-red-700 dark:bg-[#ff5a68]/15 dark:text-[#ff5a68]'
                        : 'bg-amber-100 text-amber-800 dark:bg-[#ffb020]/15 dark:text-[#ffb020]'
                    }`}
                  >
                    {row.dir === 'up' ? '▲' : row.dir === 'down' ? '▼' : '◆'}
                  </div>
                  <div className="sm:w-52 shrink-0">
                    <strong className="block font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                      {row.sector}
                    </strong>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {row.tickers.map((tk) => (
                        <button
                          key={tk}
                          type="button"
                          onClick={() => onSelectStock?.(tk)}
                          className="font-mono text-[11px] font-bold text-emerald-700 hover:underline dark:text-[#00e08a]"
                        >
                          {tk}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="flex-1 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
                  {row.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
