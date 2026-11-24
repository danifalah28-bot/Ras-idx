import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Download,
  ExternalLink,
  Globe2,
  Home,
  Layers,
  LineChart,
  MessageSquare,
  Moon,
  Plus,
  Check,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  WifiOff,
} from 'lucide-react';
import { buildFullIdxUniverse } from './data/idxUniverse';
import type {
  CompanyOfficialSyncResponse,
  DailyArticleItem,
  LampStatus,
  MacroLiveResponse,
  MarketNotificationItem,
  OjkBeiLiveSyncResponse,
  PriceAlertRule,
  StockRecord,
} from './types/market';
import { SupportResistanceLampBadge } from './components/SupportResistanceLamp';
import { MarketOverview } from './components/MarketOverview';
import { CompanyAnalysis } from './components/CompanyAnalysis';
import { SmartScreener } from './components/SmartScreener';
import { CompareStocksPage } from './components/CompareStocksPage';
import { DeepGeopoliticsResearch } from './components/DeepGeopoliticsResearch';
import { AnalystChatbot } from './components/AnalystChatbot';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallBanner';
import { NotificationCenter } from './components/NotificationCenter';
import { ArticlesResearchPage } from './components/ArticlesResearchPage';
import { WatchlistPage } from './components/WatchlistPage';
import { LegalModal } from './components/LegalModal';
import { StockQuickDetailModal } from './components/StockQuickDetailModal';
import { RasIdxLogo } from './components/RasIdxLogo';
import { MarketDepthPage } from './components/MarketDepthPage';
import { useOnlineStatus } from './hooks/usePWAInstall';

type ActivePage =
  | 'home'
  | 'screener'
  | 'compare'
  | 'riset'
  | 'news'
  | 'analysis'
  | 'depth'
  | 'watchlist'
  | 'notifications';

const DEFAULT_WATCHLIST = ['BBCA', 'BBRI', 'BMRI', 'ADRO', 'AMMN', 'TLKM'];
const DEFAULT_COMPARE = ['BBCA', 'BBRI', 'BMRI'];
const WATCHLIST_STORAGE_KEY = 'ras_terminal_watchlist';
const COMPARE_STORAGE_KEY = 'ras_terminal_compare';
const DARK_STORAGE_KEY = 'ras_dark';

function resolveInitialPage(): ActivePage {
  if (typeof window === 'undefined') return 'home';
  const hashClean = window.location.hash.replace(/^#/, '').split('/')[0].toLowerCase();
  if (hashClean.startsWith('saham-')) return 'analysis';
  if (hashClean === 'screener') return 'screener';
  if (hashClean === 'banding' || hashClean === 'compare') return 'compare';
  if (hashClean === 'riset' || hashClean === 'geopolitik') return 'riset';
  if (hashClean === 'berita' || hashClean === 'artikel' || hashClean === 'research') return 'news';
  if (hashClean === 'kedalaman' || hashClean === 'depth') return 'depth';
  if (hashClean === 'watchlist') return 'watchlist';
  if (hashClean === 'notifikasi' || hashClean === 'notifications') return 'notifications';
  if (hashClean === 'beranda' || hashClean === 'dashboard') return 'home';

  const pathClean = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const upperPath = pathClean.toUpperCase();
  if (/^[A-Z]{4}$/.test(upperPath)) return 'analysis';

  const params = new URLSearchParams(window.location.search);
  const qTicker = params.get('s')?.toUpperCase();
  if (qTicker && /^[A-Z]{4}$/.test(qTicker)) return 'analysis';

  const pageParam = params.get('page')?.toLowerCase();
  if (pageParam === 'screener' || pathClean === 'screener') return 'screener';
  if (pageParam === 'compare' || pageParam === 'banding' || pathClean === 'banding') return 'compare';
  if (pageParam === 'riset' || pageParam === 'geopolitik') return 'riset';
  if (pageParam === 'articles' || pageParam === 'berita' || pathClean === 'artikel') return 'news';
  if (pageParam === 'depth' || pageParam === 'kedalaman' || pathClean === 'kedalaman') return 'depth';
  if (pageParam === 'watchlist' || pathClean === 'watchlist') return 'watchlist';
  if (pageParam === 'notifications' || pageParam === 'notifikasi') return 'notifications';
  return 'home';
}

function resolveInitialTicker(): string {
  if (typeof window !== 'undefined') {
    const hashClean = window.location.hash.replace(/^#/, '').toLowerCase();
    if (hashClean.startsWith('saham-')) {
      const htk = hashClean.slice(6).toUpperCase();
      if (/^[A-Z]{4}$/.test(htk)) return htk;
    }
    const pathTicker = window.location.pathname.replace(/^\/+|\/+$/g, '').toUpperCase();
    if (/^[A-Z]{4}$/.test(pathTicker)) return pathTicker;
    const qTicker = new URLSearchParams(window.location.search).get('s')?.toUpperCase();
    if (qTicker && /^[A-Z]{4}$/.test(qTicker)) return qTicker;
  }
  return 'BBCA';
}

function sendBrowserPushIfAllowed(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch {
      // Ignore browser notification errors inside restricted iframes
    }
  }
}

export default function App() {
  const [stocks, setStocks] = useState<StockRecord[]>(() => buildFullIdxUniverse());
  const [activePage, setActivePage] = useState<ActivePage>(resolveInitialPage);
  const [activeTicker, setActiveTicker] = useState<string>(resolveInitialTicker);
  const [screenerIndexTag, setScreenerIndexTag] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [legalOpen, setLegalOpen] = useState<boolean>(false);
  const [quickDetailTicker, setQuickDetailTicker] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_STORAGE_KEY, String(darkMode));
    } catch {
      // Ignore storage write issues
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read issues
    }
    return DEFAULT_WATCHLIST;
  });

  const [compareTickers, setCompareTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4);
      }
    } catch {
      // Ignore storage read issues
    }
    return DEFAULT_COMPARE;
  });

  const updateCompareTickers = useCallback((next: string[]) => {
    const clean = Array.from(new Set(next)).slice(0, 4);
    setCompareTickers(clean);
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // Ignore storage write issues
    }
  }, []);

  const toggleCompare = useCallback(
    (ticker: string) => {
      setCompareTickers((prev) => {
        const exists = prev.includes(ticker);
        if (exists) {
          if (prev.length <= 1) {
            showToast('Minimal 1 saham pada panel Banding');
            return prev;
          }
          const next = prev.filter((t) => t !== ticker);
          try {
            localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
          } catch {
            // Ignore storage write issues
          }
          showToast(`${ticker} dihapus dari Banding`);
          return next;
        }
        if (prev.length >= 4) {
          showToast('Maksimal 4 saham untuk dibanding sekaligus');
          return prev;
        }
        const next = [...prev, ticker];
        try {
          localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage write issues
        }
        showToast(`${ticker} ditambahkan ke Banding`);
        return next;
      });
    },
    [showToast]
  );

  // Alerts, Real-Time Notifications & Daily Research Articles State
  const [alerts, setAlerts] = useState<PriceAlertRule[]>([]);
  const [notifications, setNotifications] = useState<MarketNotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => new Set());
  const readNotifIdsRef = useRef<Set<string>>(readNotifIds);
  readNotifIdsRef.current = readNotifIds;
  const alertedPushIdsRef = useRef<Set<string>>(new Set());

  const [articles, setArticles] = useState<DailyArticleItem[]>([]);
  const [articlesLoading, setArticlesLoading] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const toggleWatchlist = useCallback(
    (ticker: string) => {
      setWatchlist((prev) => {
        const exists = prev.includes(ticker);
        const next = exists ? prev.filter((t) => t !== ticker) : [ticker, ...prev];
        try {
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage write issues
        }
        showToast(
          exists ? `${ticker} dihapus dari Watchlist` : `${ticker} ditambahkan ke Watchlist`
        );
        return next;
      });
    },
    [showToast]
  );

  const [macro, setMacro] = useState<MacroLiveResponse | null>(null);
  const [macroLoading, setMacroLoading] = useState<boolean>(false);
  const [ojkBei, setOjkBei] = useState<OjkBeiLiveSyncResponse | null>(null);
  const [ojkBeiLoading, setOjkBeiLoading] = useState<boolean>(false);
  const [officialSync, setOfficialSync] = useState<CompanyOfficialSyncResponse | null>(null);
  const [officialSyncLoading, setOfficialSyncLoading] = useState<boolean>(false);
  const activeTickerRef = useRef<string>(activeTicker);
  activeTickerRef.current = activeTicker;

  // Top instant search dropdown state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const activeStock = useMemo(
    () => stocks.find((s) => s.ticker === activeTicker) ?? stocks[0],
    [stocks, activeTicker]
  );

  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const searchMatches = useMemo(() => {
    const q = searchTerm.trim().toUpperCase();
    if (!q) return stocks.slice(0, 10);
    return stocks
      .filter(
        (s) =>
          s.ticker.includes(q) ||
          s.name.toUpperCase().includes(q) ||
          s.subSector.toUpperCase().includes(q)
      )
      .slice(0, 12);
  }, [stocks, searchTerm]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const json = (await res.json()) as { alerts?: PriceAlertRule[] };
        if (Array.isArray(json.alerts)) {
          setAlerts(json.alerts);
        }
      }
    } catch {
      // Keep existing state on transient error
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/live');
      if (res.ok) {
        const json = (await res.json()) as { notifications?: MarketNotificationItem[] };
        if (Array.isArray(json.notifications)) {
          const readSet = readNotifIdsRef.current;
          for (const item of json.notifications) {
            if (item.kind === 'price_target' && !alertedPushIdsRef.current.has(item.id)) {
              alertedPushIdsRef.current.add(item.id);
              sendBrowserPushIfAllowed(item.title, item.message);
            }
          }
          setNotifications(
            json.notifications.map((n) => ({
              ...n,
              read: readSet.has(n.id),
            }))
          );
        }
      }
    } catch {
      // Keep existing notifications on transient failure
    }
  }, []);

  const loadArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const json = (await res.json()) as { articles?: DailyArticleItem[] };
        if (Array.isArray(json.articles)) {
          setArticles(json.articles);
        }
      }
    } catch {
      // Ignore transient network errors during background sync
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // Initial load from Express backend + post-warmup sync + 30s safety refresh alongside SSE
  useEffect(() => {
    let mounted = true;
    const syncAllStocks = () => {
      fetch('/api/stocks')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { stocks?: StockRecord[] } | null) => {
          if (mounted && data?.stocks && data.stocks.length > 0) {
            setStocks(data.stocks);
          }
        })
        .catch(() => {});
    };

    syncAllStocks();
    const warmupTimer = setTimeout(syncAllStocks, 2_500);
    const periodicTimer = setInterval(syncAllStocks, 30_000);
    return () => {
      mounted = false;
      clearTimeout(warmupTimer);
      clearInterval(periodicTimer);
    };
  }, []);

  // Fetch live single-stock quote when activeTicker changes
  useEffect(() => {
    let mounted = true;
    fetch(`/api/stocks/${encodeURIComponent(activeTicker)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stock?: StockRecord } | null) => {
        if (mounted && data?.stock) {
          setStocks((prev) =>
            prev.map((item) => (item.ticker === data.stock!.ticker ? data.stock! : item))
          );
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activeTicker]);

  // Continuous Real-Time SSE Market Stream (Live Prices + Regulatory + Official Sync + Signals + Alerts)
  useEffect(() => {
    const eventSource = new EventSource('/api/market/stream');
    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          type?: string;
          ticker?: string;
          price?: number;
          changePct?: number;
          lampStatus?: LampStatus;
          lampDetail?: string;
          timestamp?: string;
          updates?: Partial<StockRecord>[];
          data?: OjkBeiLiveSyncResponse | CompanyOfficialSyncResponse;
        };

        if (msg.type === 'tick' && Array.isArray(msg.updates) && msg.updates.length > 0) {
          const updateMap = new Map(msg.updates.map((u) => [u.ticker, u]));
          setStocks((prev) =>
            prev.map((s) => {
              const patch = updateMap.get(s.ticker);
              return patch ? { ...s, ...patch } : s;
            })
          );
        } else if (msg.type === 'regulatory_sync' && msg.data) {
          setOjkBei(msg.data as OjkBeiLiveSyncResponse);
          void loadNotifications();
        } else if (
          msg.type === 'company_official_sync' &&
          msg.ticker === activeTickerRef.current &&
          msg.data
        ) {
          setOfficialSync(msg.data as CompanyOfficialSyncResponse);
        } else if (msg.type === 'signal_alert' && msg.ticker && typeof msg.price === 'number') {
          const isBreakout = msg.lampStatus === 'BREAKOUT_RESISTANCE';
          const title = isBreakout
            ? `${msg.ticker} Tembus Resisten (Rp ${msg.price.toLocaleString('id-ID')})`
            : `${msg.ticker} Jebol Support (Rp ${msg.price.toLocaleString('id-ID')})`;
          const message = `${msg.lampDetail ?? ''} · Perubahan ${(msg.changePct ?? 0) >= 0 ? '+' : ''}${(msg.changePct ?? 0).toFixed(2)}%`;
          const newItem: MarketNotificationItem = {
            id: `sig_${msg.ticker}_${msg.lampStatus}_${msg.timestamp ?? Date.now()}`,
            kind: 'signal',
            title,
            message,
            ticker: msg.ticker,
            timestamp: msg.timestamp || new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => {
            if (prev.some((p) => p.id === newItem.id)) return prev;
            return [newItem, ...prev].slice(0, 30);
          });
          sendBrowserPushIfAllowed(title, message);
        } else if (msg.type === 'alerts_updated') {
          void loadAlerts();
          void loadNotifications();
        }
      } catch {
        // Ignore malformed tick frames
      }
    };
    return () => {
      eventSource.close();
    };
  }, [loadAlerts, loadNotifications]);

  // Continuous Automatic Official Company Website & BEI/OJK Corporate Sync (per activeTicker, every 60s)
  const loadOfficialSync = async (ticker: string, forceRefresh = false) => {
    setOfficialSyncLoading(true);
    try {
      const qs = forceRefresh ? '?refresh=1' : '';
      const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}/official-sync${qs}`);
      if (res.ok) {
        const json = (await res.json()) as CompanyOfficialSyncResponse;
        if (activeTickerRef.current === ticker) {
          setOfficialSync(json);
        }
      }
    } catch {
      // Ignore transient network errors during background sync
    } finally {
      setOfficialSyncLoading(false);
    }
  };

  useEffect(() => {
    setOfficialSync((prev) => (prev?.ticker === activeTicker ? prev : null));
    void loadOfficialSync(activeTicker, false);
    const interval = setInterval(() => {
      void loadOfficialSync(activeTicker, true);
    }, 60_000);
    return () => clearInterval(interval);
  }, [activeTicker]);

  // Continuous World Macro, Geopolitics & Commodity Fetch
  const loadMacro = async (forceRefresh = false, withAi = false) => {
    setMacroLoading(true);
    try {
      const qs = new URLSearchParams();
      if (forceRefresh) qs.set('refresh', '1');
      if (withAi) qs.set('ai', '1');
      const query = qs.toString() ? `?${qs.toString()}` : '';
      const res = await fetch(`/api/macro/live${query}`);
      if (res.ok) {
        const json = (await res.json()) as MacroLiveResponse;
        setMacro(json);
      }
    } catch {
      // Ignore transient network errors during background sync
    } finally {
      setMacroLoading(false);
    }
  };

  // Continuous Automatic OJK & BEI Disclosure Fetch
  const loadOjkBei = async (forceRefresh = false) => {
    setOjkBeiLoading(true);
    try {
      const query = forceRefresh ? '?refresh=1' : '';
      const res = await fetch(`/api/ojk-bei/live${query}`);
      if (res.ok) {
        const json = (await res.json()) as OjkBeiLiveSyncResponse;
        setOjkBei(json);
      }
    } catch {
      // Ignore transient network errors during background sync
    } finally {
      setOjkBeiLoading(false);
    }
  };

  useEffect(() => {
    void loadMacro(false);
    void loadOjkBei(false);
    void loadAlerts();
    void loadNotifications();
    void loadArticles();

    const macroInterval = setInterval(() => {
      void loadMacro(true);
      void loadAlerts();
      void loadNotifications();
      void loadArticles();
    }, 60_000);
    const ojkBeiInterval = setInterval(() => {
      void loadOjkBei(false);
    }, 60_000);
    return () => {
      clearInterval(macroInterval);
      clearInterval(ojkBeiInterval);
    };
  }, [loadAlerts, loadArticles, loadNotifications]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pageToHash = useCallback(
    (page: ActivePage, tickerOverride?: string): string => {
      if (page === 'home') return '#beranda';
      if (page === 'screener') return '#screener';
      if (page === 'compare') return '#banding';
      if (page === 'riset') return '#riset';
      if (page === 'news') return '#berita';
      if (page === 'analysis') return `#saham-${(tickerOverride ?? activeTicker).toLowerCase()}`;
      if (page === 'depth') return '#kedalaman';
      if (page === 'watchlist') return '#watchlist';
      return '#notifikasi';
    },
    [activeTicker]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const hashClean = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hashClean.startsWith('saham-')) {
        const tk = hashClean.slice(6).toUpperCase();
        if (/^[A-Z]{4}$/.test(tk)) {
          setActiveTicker(tk);
          setActivePage('analysis');
          return;
        }
      }
      if (hashClean === 'screener') setActivePage('screener');
      else if (hashClean === 'banding' || hashClean === 'compare') setActivePage('compare');
      else if (hashClean === 'riset' || hashClean === 'geopolitik') setActivePage('riset');
      else if (hashClean === 'berita' || hashClean === 'artikel' || hashClean === 'research') setActivePage('news');
      else if (hashClean === 'kedalaman' || hashClean === 'depth') setActivePage('depth');
      else if (hashClean === 'watchlist') setActivePage('watchlist');
      else if (hashClean === 'notifikasi' || hashClean === 'notifications') setActivePage('notifications');
      else setActivePage('home');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigatePage = useCallback(
    (page: ActivePage, customHash?: string) => {
      if (page === 'screener' && !customHash) {
        setScreenerIndexTag(null);
      }
      setActivePage(page);
      if (typeof window !== 'undefined') {
        const targetHash = customHash ?? pageToHash(page);
        if (window.location.hash !== targetHash) {
          window.history.pushState(null, '', targetHash);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [pageToHash]
  );

  const openStockAnalysis = useCallback(
    (ticker: string) => {
      setActiveTicker(ticker);
      setSearchTerm('');
      setSearchFocused(false);
      navigatePage('analysis', `#saham-${ticker.toLowerCase()}`);
    },
    [navigatePage]
  );

  const handleOpenScreenerWithIndex = useCallback(
    (indexCode?: string) => {
      setScreenerIndexTag(indexCode ?? null);
      navigatePage('screener', '#screener');
    },
    [navigatePage]
  );

  const handleOpenDepth = (ticker?: string) => {
    if (ticker) setActiveTicker(ticker);
    navigatePage('depth', '#kedalaman');
  };

  const handleMarkAllRead = () => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      return next;
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleManualRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const [stocksRes] = await Promise.all([
        fetch('/api/stocks').then((r) =>
          r.ok ? (r.json() as Promise<{ stocks?: StockRecord[] }>) : null
        ),
        loadMacro(true, false),
        loadOjkBei(true),
      ]);
      if (stocksRes?.stocks && stocksRes.stocks.length > 0) {
        setStocks(stocksRes.stocks);
      }
      showToast('Data pasar real-time diperbarui');
    } catch {
      showToast('Gagal memperbarui data, periksa koneksi');
    } finally {
      setRefreshing(false);
    }
  };

  const primaryTabs: {
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'screener', label: 'Screener', icon: SlidersHorizontal },
    { id: 'compare', label: 'Banding', icon: LineChart },
    { id: 'riset', label: 'Riset', icon: Globe2 },
    { id: 'news', label: 'Berita', icon: BookOpen },
  ];

  const pageLabels: Record<ActivePage, string> = {
    home: 'Beranda Pasar BEI',
    screener: 'Smart Screener BEI',
    compare: 'Banding Saham & Sektor',
    riset: 'Riset Geopolitik & Makro',
    news: 'Berita & Riset Harian',
    analysis: `Analisis Emiten ${activeStock.ticker}`,
    depth: `Market Depth ${activeStock.ticker}`,
    watchlist: 'Watchlist Pribadi',
    notifications: 'Pusat Notifikasi & Alert',
  };

  const isInCompare = compareTickers.includes(activeStock.ticker);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#060a0f] dark:text-[#eaf1f7]">
      {/* v17 Sticky Top Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-[#1d2833] dark:bg-[#060a0f]/92">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">
          {/* Zone 1: Brand Emblem */}
          <a
            href="#beranda"
            onClick={(e) => {
              e.preventDefault();
              navigatePage('home');
            }}
            aria-label="RAS.IDX Terminal Beranda"
            className="inline-flex items-center whitespace-nowrap shrink-0"
          >
            <RasIdxLogo size="md" />
          </a>

          {/* Zone 2: v17 Primary 5-Tab Desktop Nav */}
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-[#1d2833] dark:bg-[#0e141c]">
            {primaryTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigatePage(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs dark:bg-[#00e08a] dark:text-[#03130b] dark:font-extrabold'
                      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Terminal Tools & Analis AI CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isOnline && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:border-[#ffb020]/35 dark:bg-[#ffb020]/10 dark:text-[#ffb020]">
                <WifiOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => handleOpenDepth(activeStock.ticker)}
              title="Kedalaman Pasar (Market Depth)"
              className={`hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'depth'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Depth</span>
            </button>

            <button
              type="button"
              onClick={() => navigatePage('watchlist')}
              title="Watchlist Pribadi"
              aria-label="Watchlist Pribadi"
              className={`relative inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs font-semibold transition-colors shrink-0 ${
                activePage === 'watchlist'
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-[#ffb020]/45 dark:bg-[#ffb020]/15 dark:text-[#ffb020]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${watchlist.length > 0 ? 'fill-amber-400 text-amber-500 dark:fill-[#ffb020] dark:text-[#ffb020]' : ''}`} />
              <span className="font-mono text-[11px] tabular-nums">{watchlist.length}</span>
            </button>

            <button
              type="button"
              onClick={() => navigatePage('notifications')}
              title="Pusat Notifikasi & Alert"
              aria-label="Pusat Notifikasi"
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shrink-0 ${
                activePage === 'notifications'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
              }`}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#00e08a] px-1 font-mono text-[9px] font-extrabold text-[#03130b] tabular-nums">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              disabled={refreshing}
              title="Segarkan Data Pasar"
              aria-label="Segarkan Data Pasar"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-3.5 text-xs font-extrabold text-[#03130b] shadow-xs transition-all hover:brightness-110 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analis AI</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main id="top" className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 space-y-5">
        {/* Global Top IDX Stock Search Bar (Instant jump to candlestick chart & research) */}
        <section className="rounded-[20px] border border-slate-200 bg-white p-3.5 sm:p-4 dark:border-[#1d2833] dark:bg-[#0e141c]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div ref={searchBoxRef} className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8d9aa8]" />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder={`Cari dari ${stocks.length} saham BEI (kode atau nama perusahaan)...`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#00e08a] dark:focus:bg-[#0b1219]"
              />

              {searchFocused && (
                <div className="absolute top-full left-0 z-40 mt-1.5 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#1d2833] dark:bg-[#0e141c]">
                  {searchMatches.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-500 dark:text-[#8d9aa8]">
                      Emiten tidak ditemukan. Coba kode atau kata kunci lain.
                    </div>
                  ) : (
                    searchMatches.map((s) => (
                      <button
                        key={s.ticker}
                        type="button"
                        onClick={() => openStockAnalysis(s.ticker)}
                        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left text-xs last:border-b-0 hover:bg-slate-50 dark:border-[#1d2833] dark:hover:bg-[#131b25]"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-[#eaf1f7]">
                              {s.ticker}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-[#131b25] dark:text-[#8d9aa8]">
                              {s.sector}
                            </span>
                          </div>
                          <div className="max-w-[260px] truncate text-slate-600 dark:text-[#8d9aa8]">
                            {s.name}
                          </div>
                        </div>
                        <div className="text-right font-mono tabular-nums shrink-0">
                          <div className="font-semibold text-slate-900 dark:text-[#eaf1f7]">
                            Rp {s.price.toLocaleString('id-ID')}
                          </div>
                          <div
                            className={
                              s.changePct >= 0
                                ? 'text-emerald-700 dark:text-[#00e08a]'
                                : 'text-red-700 dark:text-[#ff5a68]'
                            }
                          >
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

            <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
              {activePage !== 'home' && (
                <button
                  type="button"
                  onClick={() => navigatePage('home')}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#00e08a]/45"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Beranda</span>
                </button>
              )}
              <PWAInstallButton />
            </div>
          </div>
        </section>

        {/* Sub-page breadcrumb when outside the 5 primary tabs */}
        {(activePage === 'analysis' ||
          activePage === 'depth' ||
          activePage === 'watchlist' ||
          activePage === 'notifications') && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-[#8d9aa8]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigatePage('home')}
                className="font-medium hover:text-emerald-700 hover:underline dark:hover:text-[#00e08a]"
              >
                Beranda
              </button>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 dark:text-[#eaf1f7]">
                {pageLabels[activePage]}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-[#00e08a]">
              RAS.IDX Terminal · BEI Real-Time
            </span>
          </div>
        )}

        {/* Single-Stock Live Readout Header — ONLY on Analisis Emiten */}
        {activePage === 'analysis' && (
          <section className="rounded-[20px] border border-slate-200 bg-white p-5 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  <span>{activeStock.sector}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeStock.subSector}</span>
                  <span aria-hidden="true">·</span>
                  <span>Papan {activeStock.board}</span>
                  {activeStock.indexTags.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700 dark:text-[#eaf1f7]">
                        {activeStock.indexTags.join(' / ')}
                      </span>
                    </>
                  )}
                  {officialSync?.officialWebsite && officialSync.ticker === activeStock.ticker && (
                    <>
                      <span aria-hidden="true">·</span>
                      <a
                        href={officialSync.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono font-medium text-emerald-700 hover:underline dark:text-[#00e08a]"
                      >
                        <span>{officialSync.officialDomain || officialSync.officialWebsite}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
                    {activeStock.ticker} — {activeStock.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => toggleWatchlist(activeStock.ticker)}
                    aria-label={
                      watchlist.includes(activeStock.ticker)
                        ? `Hapus ${activeStock.ticker} dari Watchlist`
                        : `Tambah ${activeStock.ticker} ke Watchlist`
                    }
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                      watchlist.includes(activeStock.ticker)
                        ? 'border-amber-200 bg-amber-50 text-amber-500 dark:border-[#ffb020]/45 dark:bg-[#ffb020]/15 dark:text-[#ffb020]'
                        : 'border-slate-200 bg-white text-slate-400 hover:text-amber-500 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#ffb020]'
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        watchlist.includes(activeStock.ticker) ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCompare(activeStock.ticker)}
                    className={`inline-flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-bold transition-colors ${
                      isInCompare
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-[#00e08a]/40 dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#00e08a]/40'
                    }`}
                  >
                    {isInCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{isInCompare ? 'Di Banding' : '+ Banding'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDepth(activeStock.ticker)}
                    className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#00e08a]/40"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Orderbook Depth</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="font-mono tabular-nums">
                  <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Harga Real-Time</div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-bold text-slate-900 dark:text-[#eaf1f7]">
                      Rp {activeStock.price.toLocaleString('id-ID')}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold ${
                        activeStock.changePct >= 0
                          ? 'text-emerald-700 dark:text-[#00e08a]'
                          : 'text-red-700 dark:text-[#ff5a68]'
                      }`}
                    >
                      {activeStock.changePct >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {activeStock.changePct >= 0 ? '+' : ''}
                      {activeStock.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-9 w-px bg-slate-200 dark:bg-[#1d2833]" />

                <div className="font-mono tabular-nums">
                  <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Inflow 1 Minggu</div>
                  <div
                    className={`text-lg font-bold ${
                      activeStock.inflow1WB >= 0
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : 'text-red-700 dark:text-[#ff5a68]'
                    }`}
                  >
                    {activeStock.inflow1WB >= 0 ? '+' : ''}Rp {activeStock.inflow1WB.toFixed(1)} M
                  </div>
                </div>

                <div className="hidden sm:block h-9 w-px bg-slate-200 dark:bg-[#1d2833]" />

                <div>
                  <div className="mb-1 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    Status Lampu Indikator
                  </div>
                  <SupportResistanceLampBadge status={activeStock.lampStatus} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Active Page Views */}
        {activePage === 'home' && (
          <MarketOverview
            activeStock={activeStock}
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            macro={macro}
            macroLoading={macroLoading}
            onRefreshMacro={() => void loadMacro(true, true)}
            ojkBei={ojkBei}
            ojkBeiLoading={ojkBeiLoading}
            onRefreshOjkBei={() => void loadOjkBei(true)}
            onSelectStock={(ticker, tab) => {
              if (tab === 'geopolitics') {
                setActiveTicker(ticker);
                navigatePage('riset', '#riset');
              } else if (tab === 'peers') {
                setActiveTicker(ticker);
                navigatePage('compare', '#banding');
              } else {
                openStockAnalysis(ticker);
              }
            }}
            onQuickInspect={(tk) => setQuickDetailTicker(tk)}
            onOpenGeopoliticsPage={() => navigatePage('riset', '#riset')}
            onOpenScreenerIndex={(idx) => handleOpenScreenerWithIndex(idx)}
            compareTickers={compareTickers}
            onToggleCompare={toggleCompare}
            isDark={darkMode}
          />
        )}

        {activePage === 'screener' && (
          <SmartScreener
            key={screenerIndexTag ?? 'all'}
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            onQuickInspect={(tk) => setQuickDetailTicker(tk)}
            onSelectStock={(ticker) => openStockAnalysis(ticker)}
            compareTickers={compareTickers}
            onToggleCompare={toggleCompare}
            onOpenCompare={() => navigatePage('compare', '#banding')}
            initialIndexTag={screenerIndexTag}
          />
        )}

        {activePage === 'compare' && (
          <CompareStocksPage
            stocks={stocks}
            activeStock={activeStock}
            compareTickers={compareTickers}
            onChangeCompareTickers={updateCompareTickers}
            onOpenStockAnalysis={(tk) => openStockAnalysis(tk)}
          />
        )}

        {activePage === 'riset' && (
          <DeepGeopoliticsResearch
            stock={activeStock}
            stocks={stocks}
            macro={macro}
            macroLoading={macroLoading}
            onRefreshMacro={(withAi) => void loadMacro(true, withAi)}
            onSelectStock={(tk) => openStockAnalysis(tk)}
            onChangeTicker={(tk) => setActiveTicker(tk)}
          />
        )}

        {activePage === 'news' && (
          <ArticlesResearchPage
            articles={articles}
            loading={articlesLoading}
            initialArticleId={selectedArticleId}
            onRefreshArticles={() => void loadArticles()}
            onArticleCreated={(art) => setArticles((prev) => [art, ...prev])}
            onOpenTickerAnalysis={(tk) => openStockAnalysis(tk)}
          />
        )}

        {activePage === 'analysis' && (
          <CompanyAnalysis
            stock={activeStock}
            officialSync={officialSync}
            officialSyncLoading={officialSyncLoading}
            onRefreshOfficialSync={() => void loadOfficialSync(activeStock.ticker, true)}
            onNavigateTab={(tab) => {
              if (tab === 'peers') navigatePage('compare', '#banding');
              else navigatePage('riset', '#riset');
            }}
            isDark={darkMode}
          />
        )}

        {activePage === 'depth' && (
          <MarketDepthPage
            stocks={stocks}
            activeTicker={activeTicker}
            onSelectTicker={(tk) => setActiveTicker(tk)}
            onOpenStockAnalysis={(tk) => openStockAnalysis(tk)}
          />
        )}

        {activePage === 'watchlist' && (
          <WatchlistPage
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            onSelectStock={(tk) => openStockAnalysis(tk)}
            onQuickInspect={(tk) => setQuickDetailTicker(tk)}
            onBrowseScreener={() => navigatePage('screener', '#screener')}
          />
        )}

        {activePage === 'notifications' && (
          <NotificationCenter
            stocks={stocks}
            notifications={notifications}
            alerts={alerts}
            onAlertsChanged={setAlerts}
            onMarkAllRead={handleMarkAllRead}
            onSelectStock={(tk) => openStockAnalysis(tk)}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Quiet Workspace Footer with Offline HTML & Source Code Downloads */}
      <footer className="mt-12 border-t border-slate-200 bg-white pt-6 pb-24 lg:pb-6 dark:border-[#1d2833] dark:bg-[#060a0f]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 dark:text-[#8d9aa8]">
          <div>
            RAS.IDX Terminal · Platform Riset Saham BEI, Likuiditas, Aliran Dana &amp; Makro Geopolitik Global
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/ras-terminal.html"
              download="RAS_IDX_Terminal.html"
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline dark:text-[#00e08a]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh HTML</span>
            </a>
            <a
              href="/android-apk-kit.zip"
              download="ras-idx-android-apk-kit.zip"
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline dark:text-[#00e08a]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Kit APK Android (.zip)</span>
            </a>
            <a
              href="/nusabursa-source.zip"
              download="ras-idx-terminal-source.zip"
              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-emerald-700 hover:underline dark:text-[#8d9aa8] dark:hover:text-[#00e08a]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Kode Sumber (.zip)</span>
            </a>
            <button
              type="button"
              onClick={() => setLegalOpen(true)}
              className="font-medium text-emerald-700 hover:underline dark:text-[#00e08a]"
            >
              Privasi &amp; Syarat
            </button>
          </div>
        </div>
      </footer>

      {/* Fixed 5-Tab Bottom Navigation Bar for Mobile & Tablet */}
      <nav
        aria-label="Navigasi utama mobile"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden dark:border-[#1d2833] dark:bg-[#060a0f]/95"
      >
        <div className="mx-auto grid h-16 max-w-xl grid-cols-5 items-stretch">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigatePage(item.id)}
                className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 px-1 transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-[#00e08a]'
                    : 'text-slate-500 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-600 dark:bg-[#00e08a]"
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-bold leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Multi-turn Gemini Chatbot Drawer */}
      <AnalystChatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        activeStock={activeStock}
      />

      {/* Quick Technical Stock Detail Modal */}
      <StockQuickDetailModal
        stock={
          quickDetailTicker
            ? stocks.find((s) => s.ticker === quickDetailTicker) ?? null
            : null
        }
        isWatched={quickDetailTicker ? watchlist.includes(quickDetailTicker) : false}
        onToggleWatchlist={toggleWatchlist}
        onOpenFullAnalysis={(tk) => openStockAnalysis(tk)}
        onClose={() => setQuickDetailTicker(null)}
      />

      {/* Privacy & Terms Modal */}
      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />

      {/* Transient Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg lg:bottom-6 dark:border-[#00e08a]/40 dark:bg-[#0e141c] dark:text-[#eaf1f7]"
        >
          {toastMessage}
        </div>
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
