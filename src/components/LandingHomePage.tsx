import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  FileText,
  Search,
  Zap,
} from 'lucide-react';
import type {
  CandleBar,
  CandleResponse,
  MacroLiveResponse,
  OjkBeiLiveSyncResponse,
  StockRecord,
} from '../types/market';
import { RealTimeStockTable } from './RealTimeStockTable';

interface LandingHomePageProps {
  stocks: StockRecord[];
  macro: MacroLiveResponse | null;
  ojkBei: OjkBeiLiveSyncResponse | null;
  watchlist?: string[];
  watchlistCount?: number;
  onToggleWatchlist?: (ticker: string) => void;
  onOpenDashboard: (ticker?: string, subTab?: 'overview' | 'analysis' | 'screener' | 'geopolitics') => void;
  onOpenDepth: (ticker?: string) => void;
  onOpenWatchlist: () => void;
  onOpenArticles: () => void;
  onOpenNotifications: () => void;
  onOpenLegal?: () => void;
}

const HERO_WATCHLIST_TICKERS = ['BBCA', 'BBRI', 'TLKM', 'ASII', 'BMRI', 'GOTO', 'ANTM'];

export function LandingHomePage({
  stocks,
  macro,
  ojkBei,
  watchlist = [],
  watchlistCount = 0,
  onToggleWatchlist,
  onOpenDashboard,
  onOpenDepth,
  onOpenWatchlist,
  onOpenArticles,
  onOpenNotifications,
  onOpenLegal,
}: LandingHomePageProps) {
  const [timeframe, setTimeframe] = useState<'1H' | '1M' | '3M' | '1T'>('1M');
  const [dailyCandles, setDailyCandles] = useState<CandleBar[]>([]);
  const [intradayCandles, setIntradayCandles] = useState<CandleBar[]>([]);
  const [topSearch, setTopSearch] = useState('');
  const [topSearchFocused, setTopSearchFocused] = useState(false);

  const topSearchMatches = useMemo(() => {
    const q = topSearch.trim().toUpperCase();
    if (!q) return [];
    return stocks
      .filter((s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q))
      .slice(0, 7);
  }, [topSearch, stocks]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/stocks/IHSG/candles?timeframe=1D')
      .then((res) => (res.ok ? (res.json() as Promise<CandleResponse>) : null))
      .then((data) => {
        if (mounted && data?.candles && data.candles.length > 0) {
          setDailyCandles(data.candles);
        }
      })
      .catch(() => {});

    fetch('/api/stocks/IHSG/candles?timeframe=15m')
      .then((res) => (res.ok ? (res.json() as Promise<CandleResponse>) : null))
      .then((data) => {
        if (mounted && data?.candles && data.candles.length > 0) {
          setIntradayCandles(data.candles);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const ihsgVal = macro?.ihsg.value ?? null;
  const ihsgPct = macro?.ihsg.changePct ?? 0;
  const usdIdr = macro?.usdIdr.value ?? null;
  const usdPct = macro?.usdIdr.changePct ?? 0;

  const advancingCount = useMemo(
    () => stocks.filter((s) => s.changePct > 0).length,
    [stocks]
  );
  const decliningCount = useMemo(
    () => stocks.filter((s) => s.changePct < 0).length,
    [stocks]
  );
  const totalNetFlow1W = useMemo(
    () => stocks.reduce((acc, s) => acc + s.inflow1WB, 0),
    [stocks]
  );

  const heroWatchStocks = useMemo(() => {
    const map = new Map(stocks.map((s) => [s.ticker, s]));
    const picked = HERO_WATCHLIST_TICKERS.map((tk) => map.get(tk)).filter(
      (s): s is StockRecord => Boolean(s)
    );
    return picked.length > 0 ? picked : stocks.slice(0, 7);
  }, [stocks]);

  const tickerItems = useMemo(() => {
    const idxItems = [
      {
        key: 'IHSG',
        symbol: 'IHSG',
        value:
          ihsgVal !== null
            ? ihsgVal.toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '--',
        pct: ihsgPct,
        tickerTarget: null as string | null,
      },
      {
        key: 'USDIDR',
        symbol: 'USD/IDR',
        value: usdIdr !== null ? usdIdr.toLocaleString('id-ID') : '--',
        pct: usdPct,
        tickerTarget: null as string | null,
      },
    ];
    const stockItems = heroWatchStocks.map((s) => ({
      key: s.ticker,
      symbol: s.ticker,
      value: s.price.toLocaleString('id-ID'),
      pct: s.changePct,
      tickerTarget: s.ticker,
    }));
    return [...idxItems, ...stockItems];
  }, [heroWatchStocks, ihsgVal, ihsgPct, usdIdr, usdPct]);

  const chartCandles = useMemo(() => {
    if (timeframe === '1H' && intradayCandles.length >= 10) {
      return intradayCandles.slice(-40);
    }
    if (dailyCandles.length === 0) return [];
    if (timeframe === '1M') return dailyCandles.slice(-30);
    if (timeframe === '3M') return dailyCandles.slice(-65);
    return dailyCandles.slice(-125);
  }, [timeframe, dailyCandles, intradayCandles]);

  const marketCards = [
    {
      label: 'IHSG',
      value:
        ihsgVal !== null
          ? ihsgVal.toLocaleString('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '--',
      sub: `${ihsgPct >= 0 ? '▲ +' : '▼ '}${ihsgPct.toFixed(2).replace('.', ',')}%`,
      isUp: ihsgPct >= 0,
      onClick: () => onOpenDashboard('BBCA', 'overview'),
    },
    {
      label: 'USD/IDR',
      value: usdIdr !== null ? usdIdr.toLocaleString('id-ID') : '--',
      sub: `${usdPct >= 0 ? '▲ +' : '▼ '}${usdPct.toFixed(2).replace('.', ',')}%`,
      isUp: usdPct <= 0,
      onClick: () => onOpenDashboard('BBCA', 'overview'),
    },
    {
      label: 'BREADTH BEI',
      value: `${advancingCount} / ${decliningCount}`,
      sub: `${advancingCount} Naik · ${decliningCount} Turun`,
      isUp: advancingCount >= decliningCount,
      onClick: () => onOpenDashboard('BBCA', 'overview'),
    },
    {
      label: 'NET FLOW 1W',
      value: `${totalNetFlow1W >= 0 ? '+' : ''}Rp ${totalNetFlow1W.toFixed(0)} M`,
      sub: totalNetFlow1W >= 0 ? '▲ Akumulasi Bersih' : '▼ Distribusi Bersih',
      isUp: totalNetFlow1W >= 0,
      onClick: () => onOpenDashboard('BBCA', 'overview'),
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Data Real-Time',
      desc: 'Harga live, Market Depth 15-level, dan peta Tembok Bid/Offer langsung mengikuti fraksi BEI.',
      onClick: () => onOpenDepth('BBCA'),
    },
    {
      icon: BarChart3,
      title: 'Grafik Canggih',
      desc: 'Candlestick TradingView interaktif dengan MA20, EMA50, Bollinger, RSI, MACD, dan multi-timeframe.',
      onClick: () => onOpenDashboard('BBCA', 'overview'),
    },
    {
      icon: Search,
      title: 'Screener Cerdas',
      desc: 'Saring ratusan emiten BEI berdasarkan valuasi PER/PBV, ROE, sinyal teknikal, dan arus dana asing.',
      onClick: () => onOpenDashboard('BBCA', 'screener'),
    },
    {
      icon: Bell,
      title: 'Alert Harga',
      desc: 'Pasang target harga beli atau batas pengaman serta terima sinyal tembus resisten & regulasi OJK/BEI.',
      onClick: () => onOpenNotifications(),
    },
    {
      icon: Briefcase,
      title: `Watchlist (${watchlistCount})`,
      desc: 'Simpan dan pantau saham pilihan Anda lengkap dengan status Lampu Support/Resisten dan sinyal RSI.',
      onClick: () => onOpenWatchlist(),
    },
    {
      icon: FileText,
      title: 'Berita & Analisis',
      desc: 'Riset harian, laporan keuangan 8 kuartal, keterbukaan resmi emiten, dan panduan pasar modal.',
      onClick: () => onOpenArticles(),
    },
  ];

  const pctStr = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2).replace('.', ',')}%`;

  return (
    <div className="relative min-h-screen bg-[#07090d] text-[#e6edf3] overflow-x-hidden">
      {/* Subtle atmospheric glow from ras-terminal reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(900px 500px at 80% -10%, rgba(245,165,36,.12), transparent 60%), radial-gradient(700px 500px at -10% 30%, rgba(22,196,127,.08), transparent 60%)',
        }}
      />

      {/* Live Scrolling Market Ticker */}
      <div className="ticker-wrap relative z-10 overflow-hidden border-b border-[#1e2733] bg-[#0d1117] whitespace-nowrap">
        <div className="ticker-track gap-9 px-4 py-2.5 font-mono text-[12.5px] tabular-nums">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <button
              key={`${t.key}-${i}`}
              type="button"
              onClick={() =>
                t.tickerTarget
                  ? onOpenDashboard(t.tickerTarget, 'analysis')
                  : onOpenDashboard('BBCA', 'overview')
              }
              className="inline-flex items-center gap-1.5 text-left transition-colors hover:text-[#f5a524]"
            >
              <strong className="font-bold text-[#e6edf3]">{t.symbol}</strong>
              <span className="text-[#cbd5e1]">{t.value}</span>
              <span className={t.pct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                {t.pct >= 0 ? '▲' : '▼'} {pctStr(t.pct)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Glass Navigation Bar */}
      <nav className="sticky top-0 z-30 border-b border-[#1e2733] bg-[#07090d]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between gap-6 px-5">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 font-display font-extrabold tracking-wide whitespace-nowrap shrink-0"
          >
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[7px] bg-[#f5a524] font-mono text-[13px] font-extrabold text-[#111]">
              RAS
            </span>
            <span className="text-[17px] text-[#e6edf3]">
              RAS <span className="text-[#f5a524]">Terminal</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm text-[#8b98a9]">
            <a href="#pasar" className="transition-colors hover:text-[#e6edf3] whitespace-nowrap shrink-0">
              Pasar
            </a>
            <a href="#daftar-saham" className="transition-colors hover:text-[#e6edf3] whitespace-nowrap shrink-0">
              Daftar Saham
            </a>
            <a href="#fitur" className="transition-colors hover:text-[#e6edf3] whitespace-nowrap shrink-0">
              Fitur
            </a>
            <button
              type="button"
              onClick={() => onOpenDepth('BBCA')}
              className="transition-colors hover:text-[#e6edf3] whitespace-nowrap shrink-0"
            >
              Kedalaman
            </button>
            <button
              type="button"
              onClick={onOpenArticles}
              className="transition-colors hover:text-[#e6edf3] whitespace-nowrap shrink-0"
            >
              Riset &amp; Edukasi
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative hidden sm:block w-48 lg:w-60">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8b98a9]" />
              <input
                type="text"
                value={topSearch}
                onFocus={() => setTopSearchFocused(true)}
                onBlur={() => setTimeout(() => setTopSearchFocused(false), 160)}
                onChange={(e) => {
                  setTopSearch(e.target.value);
                  setTopSearchFocused(true);
                }}
                placeholder="Cari saham BEI..."
                className="w-full rounded-lg border border-[#1e2733] bg-[#0d1117] py-1.5 pr-3 pl-8 text-xs text-[#e6edf3] placeholder:text-[#8b98a9] focus:border-[#f5a524] focus:outline-none"
              />
              {topSearchFocused && topSearch.trim().length > 0 && (
                <div className="absolute top-full right-0 z-50 mt-1.5 max-h-72 w-72 overflow-y-auto rounded-xl border border-[#1e2733] bg-[#111721] shadow-xl">
                  {topSearchMatches.length === 0 ? (
                    <div className="px-3.5 py-2.5 text-xs text-[#8b98a9]">
                      Saham tidak ditemukan.
                    </div>
                  ) : (
                    topSearchMatches.map((s) => (
                      <button
                        key={s.ticker}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setTopSearch('');
                          setTopSearchFocused(false);
                          onOpenDashboard(s.ticker, 'analysis');
                        }}
                        className="flex w-full items-center justify-between border-b border-[#1e2733]/70 px-3.5 py-2 text-left text-xs last:border-b-0 hover:bg-[#161e2b]"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-mono font-bold text-[#e6edf3]">{s.ticker}</div>
                          <div className="truncate text-[11px] text-[#8b98a9]">{s.name}</div>
                        </div>
                        <div className="shrink-0 text-right font-mono tabular-nums">
                          <div className="font-semibold text-[#e6edf3]">
                            Rp {s.price.toLocaleString('id-ID')}
                          </div>
                          <div className={s.changePct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                            {s.changePct >= 0 ? '+' : ''}
                            {s.changePct.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenDashboard(undefined, 'overview')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f5a524] px-5 py-2.5 text-sm font-semibold text-[#111] transition-all hover:brightness-110 whitespace-nowrap shrink-0"
            >
              <span>Buka Terminal</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="top" className="relative z-10 mx-auto max-w-[1180px] px-5">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 items-center gap-12 pt-12 pb-10 lg:grid-cols-[1fr_1.15fr] lg:pt-[70px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a524]/35 bg-[#f5a524]/10 px-3 py-1 font-mono text-xs text-[#f5a524]">
              <Activity className="h-3.5 w-3.5 text-[#22c55e]" />
              <span>
                IDX · {ojkBei?.marketStatus?.label ? ojkBei.marketStatus.label.toUpperCase() : 'LIVE DATA'}
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(34px,5vw,56px)] leading-[1.08] font-bold tracking-[-1.2px] text-[#e6edf3] [text-wrap:balance]">
              Pantau pasar.
              <br />
              Ambil keputusan <span className="text-[#f5a524]">lebih cepat.</span>
            </h1>

            <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-[#8b98a9]">
              RAS Terminal menghadirkan data saham real-time, grafik canggih, dan analisis cerdas dalam satu layar untuk investor dan trader Indonesia.
            </p>

            <div className="my-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenDashboard('BBCA', 'overview')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#f5a524] px-5 py-2.5 text-sm font-semibold text-[#111] transition-all hover:brightness-110 whitespace-nowrap shrink-0"
              >
                <span>Mulai Sekarang →</span>
              </button>
              <a
                href="#fitur"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#1e2733] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#e6edf3] transition-colors hover:border-[#8b98a9] whitespace-nowrap shrink-0"
              >
                <span>Lihat Fitur</span>
              </a>
            </div>

            <div className="mt-2 flex flex-wrap gap-8">
              <div>
                <b className="block font-mono text-[22px] text-[#e6edf3] tabular-nums">
                  {stocks.length}+
                </b>
                <small className="text-[12.5px] text-[#8b98a9]">Emiten IDX</small>
              </div>
              <div>
                <b className="block font-mono text-[22px] text-[#e6edf3] tabular-nums">15 Lvl</b>
                <small className="text-[12.5px] text-[#8b98a9]">Market Depth</small>
              </div>
              <div>
                <b className="block font-mono text-[22px] text-[#e6edf3] tabular-nums">80+</b>
                <small className="text-[12.5px] text-[#8b98a9]">Indikator teknikal</small>
              </div>
            </div>
          </div>

          {/* Interactive IHSG Terminal Window */}
          <div className="overflow-hidden rounded-[14px] border border-[#1e2733] bg-[#111721] shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(245,165,36,0.06)]">
            <div className="flex items-center justify-between border-b border-[#1e2733] bg-[#0d1117] px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-[#2b3442]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#2b3442]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#2b3442]" />
                <span className="ml-2 font-mono text-xs text-[#8b98a9]">
                  RAS TERMINAL — IHSG
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenDashboard('BBCA', 'overview')}
                className="font-mono text-[11px] font-semibold text-[#f5a524] hover:underline whitespace-nowrap shrink-0"
              >
                Buka Layar Penuh →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.55fr_1fr]">
              {/* Left Chart Box */}
              <div className="border-b border-[#1e2733] p-4 md:border-r md:border-b-0">
                <div className="mb-2 flex items-end justify-between gap-2">
                  <div>
                    <b className="font-mono text-[20px] text-[#e6edf3]">IHSG</b>
                    <small className="block text-xs text-[#8b98a9]">
                      Indeks Harga Saham Gabungan
                    </small>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <b className="block text-[22px] leading-tight text-[#e6edf3]">
                      {ihsgVal !== null
                        ? ihsgVal.toLocaleString('id-ID', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '--'}
                    </b>
                    {ihsgVal !== null && (
                      <span
                        className={`text-sm font-semibold ${
                          ihsgPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                        }`}
                      >
                        {pctStr(ihsgPct)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real IHSG Candlestick + MA7 SVG */}
                <div className="mt-2">
                  {chartCandles.length >= 8 ? (() => {
                    const hi = Math.max(...chartCandles.map((c) => c.high));
                    const lo = Math.min(...chartCandles.map((c) => c.low));
                    const rg = Math.max(1, hi - lo);
                    const W = 440;
                    const H = 205;
                    const y = (v: number) => 8 + ((hi - v) / rg) * (H - 16);
                    const bw = W / chartCandles.length;
                    const maPath = chartCandles
                      .map((_, i) => {
                        const sl = chartCandles.slice(Math.max(0, i - 6), i + 1);
                        const avg = sl.reduce((a, k) => a + k.close, 0) / sl.length;
                        const x = i * bw + bw / 2;
                        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y(avg).toFixed(1)}`;
                      })
                      .join(' ');

                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} className="block h-[210px] w-full">
                        {[1, 2, 3, 4].map((stepIdx) => (
                          <line
                            key={stepIdx}
                            x1={0}
                            x2={W}
                            y1={(H / 5) * stepIdx}
                            y2={(H / 5) * stepIdx}
                            stroke="rgba(139,152,169,0.12)"
                            strokeWidth={1}
                          />
                        ))}
                        {chartCandles.map((k, i) => {
                          const x = i * bw + bw / 2;
                          const col = k.close >= k.open ? '#22c55e' : '#ef4444';
                          const top = y(Math.max(k.open, k.close));
                          const bot = y(Math.min(k.open, k.close));
                          return (
                            <g key={k.time}>
                              <line
                                x1={x}
                                x2={x}
                                y1={y(k.high)}
                                y2={y(k.low)}
                                stroke={col}
                                strokeWidth={1.15}
                              />
                              <rect
                                x={x - bw * 0.32}
                                y={top}
                                width={Math.max(2, bw * 0.64)}
                                height={Math.max(1.5, bot - top)}
                                fill={col}
                              />
                            </g>
                          );
                        })}
                        <path d={maPath} fill="none" stroke="#f5a524" strokeWidth={1.5} />
                      </svg>
                    );
                  })() : (
                    <div className="flex h-[210px] items-center justify-center font-mono text-xs text-[#8b98a9]">
                      Memuat candlestick IHSG (^JKSE)...
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex gap-1.5">
                  {(['1H', '1M', '3M', '1T'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-[5px] border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                        timeframe === tf
                          ? 'border-[#f5a524] bg-[#f5a524] text-[#111]'
                          : 'border-[#1e2733] bg-transparent text-[#8b98a9] hover:text-[#e6edf3]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Watchlist inside Terminal Card */}
              <div className="py-3">
                <h4 className="px-3.5 pb-2 font-mono text-[11px] tracking-[1.2px] text-[#8b98a9]">
                  WATCHLIST
                </h4>
                <div>
                  {heroWatchStocks.map((s) => (
                    <button
                      key={s.ticker}
                      type="button"
                      onClick={() => onOpenDashboard(s.ticker, 'analysis')}
                      className="flex w-full items-center justify-between border-t border-[#1e2733]/60 px-3.5 py-2 text-left font-mono text-[12.5px] transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-[#e6edf3]">{s.ticker}</div>
                        <small className="block truncate font-sans text-[10.5px] text-[#8b98a9]">
                          {s.name}
                        </small>
                      </div>
                      <div className="shrink-0 text-right tabular-nums">
                        <div className="text-[#e6edf3]">{s.price.toLocaleString('id-ID')}</div>
                        <small
                          className={`block font-mono text-[10.5px] ${
                            s.changePct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                          }`}
                        >
                          {pctStr(s.changePct)}
                        </small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARKET OVERVIEW SECTION */}
        <section id="pasar" className="scroll-mt-20 py-16">
          <div className="mx-auto mb-11 max-w-[620px] text-center">
            <span className="font-mono text-xs tracking-[2px] text-[#f5a524]">
              RINGKASAN PASAR
            </span>
            <h2 className="mt-2.5 mb-2 font-display text-[clamp(26px,3.5vw,38px)] font-bold tracking-[-0.6px] text-[#e6edf3]">
              Denyut pasar dalam sekilas
            </h2>
            <p className="text-[#8b98a9]">
              Indeks utama, kurs acuan, dan aliran dana bursa diperbarui terus-menerus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {marketCards.map((mk) => (
              <button
                key={mk.label}
                type="button"
                onClick={mk.onClick}
                className="rounded-xl border border-[#1e2733] bg-[#111721] p-4.5 text-left transition-colors hover:border-[#f5a524]/45"
              >
                <small className="font-mono text-[11.5px] tracking-wider text-[#8b98a9]">
                  {mk.label}
                </small>
                <b className="mt-1.5 mb-0.5 block font-mono text-2xl text-[#e6edf3] tabular-nums">
                  {mk.value}
                </b>
                <span
                  className={`font-mono text-[13px] ${
                    mk.isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}
                >
                  {mk.sub}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* REAL-TIME STOCK DIRECTORY TABLE + INSTANT CHART & RESEARCH */}
        <section id="daftar-saham" className="scroll-mt-20 py-10">
          <div className="mx-auto mb-8 max-w-[680px] text-center">
            <span className="font-mono text-xs tracking-[2px] text-[#f5a524]">
              DAFTAR SAHAM REAL-TIME
            </span>
            <h2 className="mt-2.5 mb-2 font-display text-[clamp(24px,3.2vw,34px)] font-bold tracking-[-0.6px] text-[#e6edf3]">
              Daftar Saham &amp; Harga Live BEI
            </h2>
            <p className="text-sm text-[#8b98a9]">
              Klik nama saham di bawah untuk langsung melihat grafik candlestick real-time, level Support/Resisten, valuasi, dan riset laporan kuartalan maupun AI.
            </p>
          </div>

          <RealTimeStockTable
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={onToggleWatchlist}
            onOpenFullAnalysis={(tk) => onOpenDashboard(tk, 'analysis')}
            onOpenGeopolitics={(tk) => onOpenDashboard(tk, 'geopolitics')}
            onOpenDepth={(tk) => onOpenDepth(tk)}
            forceDark
            defaultLimit={15}
          />
        </section>

        {/* FEATURES SECTION */}
        <section id="fitur" className="scroll-mt-20 py-16">
          <div className="mx-auto mb-11 max-w-[620px] text-center">
            <span className="font-mono text-xs tracking-[2px] text-[#f5a524]">FITUR</span>
            <h2 className="mt-2.5 mb-2 font-display text-[clamp(26px,3.5vw,38px)] font-bold tracking-[-0.6px] text-[#e6edf3]">
              Semua yang Anda butuhkan, tanpa ribet
            </h2>
            <p className="text-[#8b98a9]">
              Dirancang untuk kecepatan dan ketepatan, dari pemula hingga profesional. Ketuk kartu untuk membuka halamannya.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.title}
                  type="button"
                  onClick={f.onClick}
                  className="group rounded-[14px] border border-[#1e2733] bg-[#111721] p-6.5 text-left transition-all hover:-translate-y-1 hover:border-[#f5a524]/45"
                >
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-[10px] bg-[#f5a524]/12 text-[#f5a524]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 flex items-center justify-between text-[17px] font-semibold text-[#e6edf3]">
                    <span>{f.title}</span>
                    <ArrowRight className="h-4 w-4 text-[#8b98a9] transition-transform group-hover:translate-x-1 group-hover:text-[#f5a524]" />
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-[#8b98a9]">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA SECTION */}
        <section id="mulai" className="pt-5 pb-20">
          <div
            className="rounded-[20px] border border-[#1e2733] px-6 py-14 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(245,165,36,.14), rgba(22,196,127,.09))',
            }}
          >
            <h2 className="mb-2.5 font-display text-[clamp(26px,3.5vw,38px)] font-bold text-[#e6edf3]">
              Siap naik level bersama RAS Terminal?
            </h2>
            <p className="mb-6.5 text-[#8b98a9]">
              Langsung akses terminal tanpa perlu login atau mendaftar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenDashboard('BBCA', 'overview')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#f5a524] px-6 py-2.5 text-sm font-semibold text-[#111] transition-all hover:brightness-110 whitespace-nowrap shrink-0"
              >
                <span>Buka Terminal →</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenDepth('BBCA')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#1e2733] bg-[#07090d]/70 px-5 py-2.5 text-sm font-semibold text-[#e6edf3] transition-colors hover:border-[#8b98a9] whitespace-nowrap shrink-0"
              >
                <span>Kedalaman Pasar</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#1e2733] py-9 text-[13px] text-[#8b98a9]">
        <div className="mx-auto max-w-[1180px] px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 font-display font-extrabold tracking-wide text-[#e6edf3]">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[#f5a524] font-mono text-xs font-extrabold text-[#111]">
                RAS
              </span>
              <span>
                RAS <span className="text-[#f5a524]">Terminal</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <span>© 2026 RAS Terminal. Seluruh hak dilindungi.</span>
              {onOpenLegal && (
                <button
                  type="button"
                  onClick={onOpenLegal}
                  className="hover:text-[#e6edf3] hover:underline"
                >
                  Privasi &amp; Syarat
                </button>
              )}
              <a
                href="/market.json"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#e6edf3] hover:underline"
              >
                Feed /market.json
              </a>
              <a href="/html" download="ras-terminal-idx.html" className="hover:text-[#e6edf3] hover:underline">
                Unduh HTML (.html)
              </a>
              <a href="/zip" className="hover:text-[#e6edf3] hover:underline">
                Unduh Kode (.zip)
              </a>
            </div>
          </div>
          <p className="mt-4 max-w-[780px] text-xs opacity-75">
            Disclaimer: Seluruh analisis dan ringkasan pasar disajikan untuk tujuan informasi dan edukasi, bukan ajakan atau jaminan transaksi efek. Keputusan investasi sepenuhnya tanggung jawab Anda.
          </p>
        </div>
      </footer>
    </div>
  );
}
