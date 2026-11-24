import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Scan,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { CandleBar, CandleResponse, CandleTimeframe, StockRecord } from '../types/market';
import {
  calcBollingerBands,
  calcEMA,
  calcMACD,
  calcRSI,
  calcSMA,
  calcStochastic,
} from '../utils/indicators';

interface TradingViewCandlestickChartProps {
  stock: StockRecord;
  isDark?: boolean;
  headerAction?: React.ReactNode;
}

type RangePreset = 'ALL' | '1M' | '3M' | '6M' | '1Y';

interface HoveredCandleInfo {
  time: number;
  timeLabel: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePct: number;
}

function formatWibTime(unixSec: number, timeframe: CandleTimeframe): string {
  const d = new Date(unixSec * 1000);
  if (timeframe === '15m' || timeframe === '1H') {
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    });
  }
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

function formatVolumeCompact(vol: number): string {
  if (!Number.isFinite(vol) || vol <= 0) return '0';
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return Math.round(vol).toLocaleString('id-ID');
}

export function TradingViewCandlestickChart({
  stock,
  isDark = false,
  headerAction,
}: TradingViewCandlestickChartProps) {
  const isIndex = stock.ticker === 'IHSG' || stock.ticker === '^JKSE';
  const [timeframe, setTimeframe] = useState<CandleTimeframe>('1D');
  const [rangePreset, setRangePreset] = useState<RangePreset>('ALL');
  const [candles, setCandles] = useState<CandleBar[]>([]);
  const [feedSource, setFeedSource] = useState<'live-yahoo' | 'live-idx-stream'>('live-yahoo');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showMa20, setShowMa20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(true);
  const [showBb, setShowBb] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showSupportResistance, setShowSupportResistance] = useState<boolean>(true);
  const [showRsi, setShowRsi] = useState<boolean>(true);
  const [showMacd, setShowMacd] = useState<boolean>(true);
  const [showStoch, setShowStoch] = useState<boolean>(true);

  const [showIndicatorMenu, setShowIndicatorMenu] = useState<boolean>(false);
  const [showOverlayLegend, setShowOverlayLegend] = useState<boolean>(true);
  const [hovered, setHovered] = useState<HoveredCandleInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [paneTopOffsets, setPaneTopOffsets] = useState<number[]>([0]);

  const sectionRef = useRef<HTMLElement>(null);
  const wasNativeFullscreenRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const candlesRef = useRef<CandleBar[]>([]);
  const paneRafRef = useRef<number | null>(null);

  const activeOscillatorCount =
    (showRsi ? 1 : 0) + (showMacd ? 1 : 0) + (showStoch ? 1 : 0);

  const activeIndicatorCount =
    (showMa20 ? 1 : 0) +
    (showEma50 ? 1 : 0) +
    (showBb ? 1 : 0) +
    (showVolume ? 1 : 0) +
    (showSupportResistance ? 1 : 0) +
    (showRsi ? 1 : 0) +
    (showMacd ? 1 : 0) +
    (showStoch ? 1 : 0);

  const allIndicatorsActive = activeIndicatorCount === 8;

  const setAllIndicators = (enabled: boolean) => {
    setShowMa20(enabled);
    setShowEma50(enabled);
    setShowBb(enabled);
    setShowVolume(enabled);
    setShowSupportResistance(enabled);
    setShowRsi(enabled);
    setShowMacd(enabled);
    setShowStoch(enabled);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      const el = sectionRef.current;
      if (el?.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleNativeFullscreenChange = () => {
      if (document.fullscreenElement === sectionRef.current) {
        wasNativeFullscreenRef.current = true;
        setIsFullscreen(true);
      } else if (wasNativeFullscreenRef.current) {
        wasNativeFullscreenRef.current = false;
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleNativeFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleNativeFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const applyRangeWindow = (chart: IChartApi, list: CandleBar[], preset: RangePreset) => {
    if (list.length < 4) return;
    if (preset === 'ALL') {
      chart.timeScale().fitContent();
      return;
    }
    const lastTime = list[list.length - 1].time;
    const lookbackSec =
      preset === '1M'
        ? 30 * 86400
        : preset === '3M'
        ? 90 * 86400
        : preset === '6M'
        ? 180 * 86400
        : 365 * 86400;
    const fromCandidate = Math.max(list[0].time, lastTime - lookbackSec);
    if (fromCandidate >= lastTime) {
      chart.timeScale().fitContent();
      return;
    }
    try {
      chart.timeScale().setVisibleRange({
        from: fromCandidate as UTCTimestamp,
        to: lastTime as UTCTimestamp,
      });
    } catch {
      chart.timeScale().fitContent();
    }
  };

  const syncPaneProportionsAndOffsets = useCallback((chart: IChartApi | null) => {
    if (!chart || chartRef.current !== chart) return;
    let panes: ReturnType<IChartApi['panes']>;
    try {
      panes = chart.panes();
    } catch {
      return;
    }
    if (!panes || panes.length === 0) return;

    const oscCount = panes.length - 1;
    if (oscCount <= 0) {
      panes[0]?.setStretchFactor(1);
    } else if (oscCount === 1) {
      panes[0]?.setStretchFactor(0.75);
      panes[1]?.setStretchFactor(0.25);
    } else if (oscCount === 2) {
      panes[0]?.setStretchFactor(0.64);
      panes[1]?.setStretchFactor(0.18);
      panes[2]?.setStretchFactor(0.18);
    } else {
      panes[0]?.setStretchFactor(0.56);
      panes[1]?.setStretchFactor(0.145);
      panes[2]?.setStretchFactor(0.15);
      panes[3]?.setStretchFactor(0.145);
    }

    if (paneRafRef.current !== null) {
      cancelAnimationFrame(paneRafRef.current);
      paneRafRef.current = null;
    }

    paneRafRef.current = requestAnimationFrame(() => {
      paneRafRef.current = null;
      if (chartRef.current !== chart) return;
      try {
        const currentPanes = chart.panes();
        if (!currentPanes || currentPanes.length === 0) return;
        const nextOffsets: number[] = [0];
        let acc = 0;
        for (let i = 0; i < currentPanes.length - 1; i++) {
          let h = currentPanes[i]?.getHeight() ?? 0;
          if (!h) {
            h = chart.paneSize(i).height ?? 0;
          }
          acc += h + 1;
          nextOffsets.push(acc);
        }
        setPaneTopOffsets((prev) => {
          if (
            prev.length === nextOffsets.length &&
            prev.every((v, i) => Math.abs(v - nextOffsets[i]) < 1.5)
          ) {
            return prev;
          }
          return nextOffsets;
        });
      } catch {
        // Ignore transient measurements if chart is resizing or unmounting
      }
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = containerRef.current;
      const chart = chartRef.current;
      if (!el || !chart) return;
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        chart.applyOptions({
          width: el.clientWidth,
          height: el.clientHeight,
        });
      }
      syncPaneProportionsAndOffsets(chart);
    });
    return () => cancelAnimationFrame(raf);
  }, [isFullscreen, activeOscillatorCount, syncPaneProportionsAndOffsets]);

  const fetchCandles = async (tf: CandleTimeframe, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stocks/${encodeURIComponent(stock.ticker)}/candles?timeframe=${encodeURIComponent(tf)}`
      );
      if (!res.ok) {
        throw new Error('Gagal memuat data candlestick real-time.');
      }
      const data = (await res.json()) as CandleResponse;
      if (Array.isArray(data.candles) && data.candles.length > 0) {
        candlesRef.current = data.candles;
        setCandles(data.candles);
        setFeedSource(data.source);
      }
    } catch (err) {
      if (!silent || candlesRef.current.length === 0) {
        setError(err instanceof Error ? err.message : 'Gagal memuat candlestick.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles(timeframe, false);
    const interval = setInterval(() => {
      fetchCandles(timeframe, true);
    }, 45_000);
    return () => clearInterval(interval);
  }, [stock.ticker, timeframe]);

  const indicatorData = useMemo(() => {
    const ma20 = showMa20 ? calcSMA(candles, 20) : [];
    const ema50 = showEma50 ? calcEMA(candles, 50) : [];
    const bb = showBb ? calcBollingerBands(candles, 20, 2) : { upper: [], middle: [], lower: [] };
    const rsi = showRsi ? calcRSI(candles, 14) : [];
    const macd = showMacd ? calcMACD(candles, 12, 26, 9) : { macd: [], signal: [], histogram: [] };
    const stoch = showStoch ? calcStochastic(candles, 14, 3, 3) : { k: [], d: [] };

    return {
      ma20,
      ema50,
      bb,
      rsi,
      macd,
      stoch,
      ma20Map: new Map(ma20.map((p) => [p.time, p.value])),
      ema50Map: new Map(ema50.map((p) => [p.time, p.value])),
      bbUpperMap: new Map(bb.upper.map((p) => [p.time, p.value])),
      bbLowerMap: new Map(bb.lower.map((p) => [p.time, p.value])),
      rsiMap: new Map(rsi.map((p) => [p.time, p.value])),
      macdMap: new Map(macd.macd.map((p) => [p.time, p.value])),
      sigMap: new Map(macd.signal.map((p) => [p.time, p.value])),
      histMap: new Map(macd.histogram.map((p) => [p.time, p.value])),
      stochKMap: new Map(stoch.k.map((p) => [p.time, p.value])),
      stochDMap: new Map(stoch.d.map((p) => [p.time, p.value])),
    };
  }, [candles, showMa20, showEma50, showBb, showRsi, showMacd, showStoch]);

  const srLevels = useMemo(() => {
    if (candles.length === 0) return { pivot: 0, r1: 0, s1: 0 };
    const refBar = candles.length >= 2 ? candles[candles.length - 2] : candles[candles.length - 1];
    const pivot =
      stock.pivot > 0
        ? stock.pivot
        : Number(((refBar.high + refBar.low + refBar.close) / 3).toFixed(2));
    const r1 =
      stock.r1 > 0
        ? stock.r1
        : Number((2 * pivot - refBar.low).toFixed(2));
    const s1 =
      stock.s1 > 0
        ? stock.s1
        : Number((2 * pivot - refBar.high).toFixed(2));
    return { pivot, r1, s1 };
  }, [candles, stock.pivot, stock.r1, stock.s1]);

  const latestSummary = useMemo<HoveredCandleInfo | null>(() => {
    if (candles.length === 0) return null;
    const last = candles[candles.length - 1];
    const closePrice = stock.price || last.close;
    const changePct =
      last.open > 0 ? Number((((closePrice - last.open) / last.open) * 100).toFixed(2)) : 0;
    return {
      time: last.time,
      timeLabel: formatWibTime(last.time, timeframe),
      open: last.open,
      high: last.high,
      low: last.low,
      close: closePrice,
      volume: last.volume,
      changePct,
    };
  }, [candles, stock.price, timeframe]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || candles.length === 0) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0b1017' : '#FFFFFF' },
        textColor: isDark ? '#98a6b5' : '#475569',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 10.5,
        panes: {
          separatorColor: isDark ? '#1c2633' : '#E2E8F0',
          separatorHoverColor: isDark ? '#3d8bff' : '#94A3B8',
          enableResize: true,
        },
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(28, 38, 51, 0.55)' : '#F1F5F9' },
        horzLines: { color: isDark ? 'rgba(28, 38, 51, 0.55)' : '#F1F5F9' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? '#586677' : '#64748B',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1d2833' : '#0F172A',
        },
        horzLine: {
          color: isDark ? '#586677' : '#64748B',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#1d2833' : '#0F172A',
        },
      },
      localization: {
        locale: 'id-ID',
        timeFormatter: (time: unknown) => {
          if (typeof time === 'number') {
            return formatWibTime(time, timeframe);
          }
          return String(time ?? '');
        },
        priceFormatter: (price: number) =>
          price >= 100 ? Math.round(price).toLocaleString('id-ID') : price.toFixed(2),
      },
      rightPriceScale: {
        minimumWidth: 58,
        borderColor: isDark ? '#1c2633' : '#E2E8F0',
        scaleMargins: {
          top: 0.16,
          bottom: showVolume ? 0.18 : 0.06,
        },
      },
      timeScale: {
        borderColor: isDark ? '#1c2633' : '#E2E8F0',
        timeVisible: timeframe === '15m' || timeframe === '1H',
        secondsVisible: false,
        rightOffset: 5,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // 1. Main Candlestick Series (Pane 0)
    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: '#00e08a',
        downColor: '#ff5a68',
        borderUpColor: '#00e08a',
        borderDownColor: '#ff5a68',
        wickUpColor: '#00e08a',
        wickDownColor: '#ff5a68',
        ...(isIndex
          ? { priceFormat: { type: 'price' as const, precision: 2, minMove: 0.01 } }
          : {}),
      },
      0
    );
    candleSeriesRef.current = candleSeries;

    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // 2. Support / Pivot / Resistance Lines inside Pane 0
    if (showSupportResistance && srLevels.s1 > 0 && srLevels.r1 > 0) {
      candleSeries.createPriceLine({
        price: srLevels.r1,
        color: 'rgba(255, 90, 104, 0.72)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: 'R1',
      });
      candleSeries.createPriceLine({
        price: srLevels.pivot,
        color: 'rgba(141, 154, 168, 0.65)',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
        title: 'Pivot',
      });
      candleSeries.createPriceLine({
        price: srLevels.s1,
        color: 'rgba(0, 224, 138, 0.72)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: 'S1',
      });
    }

    // 3. Volume Overlay inside bottom of Pane 0
    if (showVolume) {
      const volumeSeries = chart.addSeries(
        HistogramSeries,
        {
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
          lastValueVisible: false,
          priceLineVisible: false,
        },
        0
      );
      volumeSeriesRef.current = volumeSeries;
      chart.priceScale('volume', 0).applyOptions({
        scaleMargins: { top: 0.84, bottom: 0 },
      });
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(0, 224, 138, 0.25)' : 'rgba(255, 90, 104, 0.25)',
        }))
      );
    } else {
      volumeSeriesRef.current = null;
    }

    // 4. Overlay Indicators inside Pane 0
    if (showMa20 && indicatorData.ma20.length > 0) {
      const ma20Series = chart.addSeries(
        LineSeries,
        {
          color: '#ffb020',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        0
      );
      ma20Series.setData(
        indicatorData.ma20.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
    }

    if (showEma50 && indicatorData.ema50.length > 0) {
      const ema50Series = chart.addSeries(
        LineSeries,
        {
          color: '#3d8bff',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        0
      );
      ema50Series.setData(
        indicatorData.ema50.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
    }

    if (showBb && indicatorData.bb.upper.length > 0) {
      const bbUpper = chart.addSeries(
        LineSeries,
        {
          color: 'rgba(194, 100, 255, 0.72)',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        0
      );
      const bbBasis = chart.addSeries(
        LineSeries,
        {
          color: 'rgba(141, 154, 168, 0.5)',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        0
      );
      const bbLower = chart.addSeries(
        LineSeries,
        {
          color: 'rgba(194, 100, 255, 0.72)',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        0
      );
      bbUpper.setData(
        indicatorData.bb.upper.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      bbBasis.setData(
        indicatorData.bb.middle.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      bbLower.setData(
        indicatorData.bb.lower.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
    }

    // 5. Stacked Oscillator Sub-Panes (ALL active inside the unified TradingView canvas)
    let nextPaneIndex = 1;

    if (showRsi && indicatorData.rsi.length > 0) {
      const paneIdx = nextPaneIndex++;
      const rsiSeries = chart.addSeries(
        LineSeries,
        {
          color: '#c264ff',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
        },
        paneIdx
      );
      rsiSeries.setData(
        indicatorData.rsi.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      rsiSeries.createPriceLine({
        price: 70,
        color: 'rgba(255, 90, 104, 0.45)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: 'rgba(0, 224, 138, 0.45)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
      });
      chart.priceScale('right', paneIdx).applyOptions({
        minimumWidth: 58,
        scaleMargins: { top: 0.28, bottom: 0.08 },
      });
    }

    if (showMacd && indicatorData.macd.histogram.length > 0) {
      const paneIdx = nextPaneIndex++;
      const histSeries = chart.addSeries(
        HistogramSeries,
        {
          priceLineVisible: false,
          lastValueVisible: false,
        },
        paneIdx
      );
      const macdLineSeries = chart.addSeries(
        LineSeries,
        {
          color: '#3d8bff',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
        },
        paneIdx
      );
      const sigSeries = chart.addSeries(
        LineSeries,
        {
          color: '#ffb020',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        paneIdx
      );
      histSeries.setData(
        indicatorData.macd.histogram.map((pt) => ({
          time: pt.time as UTCTimestamp,
          value: pt.value,
          color: pt.value >= 0 ? 'rgba(0, 224, 138, 0.58)' : 'rgba(255, 90, 104, 0.58)',
        }))
      );
      macdLineSeries.setData(
        indicatorData.macd.macd.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      sigSeries.setData(
        indicatorData.macd.signal.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      chart.priceScale('right', paneIdx).applyOptions({
        minimumWidth: 58,
        scaleMargins: { top: 0.28, bottom: 0.08 },
      });
    }

    if (showStoch && indicatorData.stoch.k.length > 0) {
      const paneIdx = nextPaneIndex++;
      const kSeries = chart.addSeries(
        LineSeries,
        {
          color: '#00e08a',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
        },
        paneIdx
      );
      const dSeries = chart.addSeries(
        LineSeries,
        {
          color: '#ff5a68',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        },
        paneIdx
      );
      kSeries.setData(
        indicatorData.stoch.k.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      dSeries.setData(
        indicatorData.stoch.d.map((pt) => ({ time: pt.time as UTCTimestamp, value: pt.value }))
      );
      kSeries.createPriceLine({
        price: 80,
        color: 'rgba(255, 90, 104, 0.45)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
      });
      kSeries.createPriceLine({
        price: 20,
        color: 'rgba(0, 224, 138, 0.45)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
      });
      chart.priceScale('right', paneIdx).applyOptions({
        minimumWidth: 58,
        scaleMargins: { top: 0.28, bottom: 0.08 },
      });
    }

    applyRangeWindow(chart, candles, rangePreset);
    syncPaneProportionsAndOffsets(chart);

    const candleLookup = new Map(candles.map((c) => [c.time, c]));
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || typeof param.time !== 'number') {
        setHovered(null);
        return;
      }
      const bar = candleLookup.get(param.time);
      if (!bar) {
        setHovered(null);
        return;
      }
      const changePct =
        bar.open > 0 ? Number((((bar.close - bar.open) / bar.open) * 100).toFixed(2)) : 0;
      setHovered({
        time: bar.time,
        timeLabel: formatWibTime(bar.time, timeframe),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
        changePct,
      });
    });

    const handlePointerUp = () => syncPaneProportionsAndOffsets(chart);
    el.addEventListener('pointerup', handlePointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
          syncPaneProportionsAndOffsets(chart);
        }
      }
    });
    resizeObserver.observe(el);

    return () => {
      if (paneRafRef.current !== null) {
        cancelAnimationFrame(paneRafRef.current);
        paneRafRef.current = null;
      }
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      el.removeEventListener('pointerup', handlePointerUp);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [
    candles,
    indicatorData,
    isFullscreen,
    isIndex,
    rangePreset,
    showBb,
    showEma50,
    showMa20,
    showMacd,
    showRsi,
    showStoch,
    showSupportResistance,
    showVolume,
    srLevels.pivot,
    srLevels.r1,
    srLevels.s1,
    syncPaneProportionsAndOffsets,
    timeframe,
  ]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0b1017' : '#FFFFFF' },
        textColor: isDark ? '#98a6b5' : '#475569',
        panes: {
          separatorColor: isDark ? '#1c2633' : '#E2E8F0',
          separatorHoverColor: isDark ? '#3d8bff' : '#94A3B8',
        },
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(28, 38, 51, 0.55)' : '#F1F5F9' },
        horzLines: { color: isDark ? 'rgba(28, 38, 51, 0.55)' : '#F1F5F9' },
      },
      crosshair: {
        vertLine: { labelBackgroundColor: isDark ? '#1d2833' : '#0F172A' },
        horzLine: { labelBackgroundColor: isDark ? '#1d2833' : '#0F172A' },
      },
      rightPriceScale: { borderColor: isDark ? '#1c2633' : '#E2E8F0' },
      timeScale: { borderColor: isDark ? '#1c2633' : '#E2E8F0' },
    });
  }, [isDark]);

  // Real-time SSE live price push directly into the active candlestick
  useEffect(() => {
    const series = candleSeriesRef.current;
    const list = candlesRef.current;
    if (!series || list.length === 0) return;

    const last = list[list.length - 1];
    const nextClose = stock.price;
    const nextHigh = Math.max(last.high, nextClose);
    const nextLow = Math.min(last.low, nextClose);
    last.close = nextClose;
    last.high = nextHigh;
    last.low = nextLow;

    try {
      series.update({
        time: last.time as UTCTimestamp,
        open: last.open,
        high: nextHigh,
        low: nextLow,
        close: nextClose,
      });
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update({
          time: last.time as UTCTimestamp,
          value: last.volume,
          color:
            nextClose >= last.open ? 'rgba(0, 224, 138, 0.28)' : 'rgba(255, 90, 104, 0.28)',
        });
      }
    } catch {
      // Ignore transient chart updates during rebuild
    }
  }, [stock.price, stock.lastUpdated]);

  const activeDisplay = hovered ?? latestSummary;
  const activeTime = activeDisplay?.time;

  const valMa20 =
    activeTime !== undefined
      ? indicatorData.ma20Map.get(activeTime) ?? null
      : indicatorData.ma20.length > 0
      ? indicatorData.ma20[indicatorData.ma20.length - 1].value
      : null;
  const valEma50 =
    activeTime !== undefined
      ? indicatorData.ema50Map.get(activeTime) ?? null
      : indicatorData.ema50.length > 0
      ? indicatorData.ema50[indicatorData.ema50.length - 1].value
      : null;
  const valBbUpper =
    activeTime !== undefined
      ? indicatorData.bbUpperMap.get(activeTime) ?? null
      : indicatorData.bb.upper.length > 0
      ? indicatorData.bb.upper[indicatorData.bb.upper.length - 1].value
      : null;
  const valBbLower =
    activeTime !== undefined
      ? indicatorData.bbLowerMap.get(activeTime) ?? null
      : indicatorData.bb.lower.length > 0
      ? indicatorData.bb.lower[indicatorData.bb.lower.length - 1].value
      : null;
  const valRsi =
    activeTime !== undefined
      ? indicatorData.rsiMap.get(activeTime) ?? null
      : indicatorData.rsi.length > 0
      ? indicatorData.rsi[indicatorData.rsi.length - 1].value
      : null;
  const valMacd =
    activeTime !== undefined
      ? indicatorData.macdMap.get(activeTime) ?? null
      : indicatorData.macd.macd.length > 0
      ? indicatorData.macd.macd[indicatorData.macd.macd.length - 1].value
      : null;
  const valSig =
    activeTime !== undefined
      ? indicatorData.sigMap.get(activeTime) ?? null
      : indicatorData.macd.signal.length > 0
      ? indicatorData.macd.signal[indicatorData.macd.signal.length - 1].value
      : null;
  const valHist =
    activeTime !== undefined
      ? indicatorData.histMap.get(activeTime) ?? null
      : indicatorData.macd.histogram.length > 0
      ? indicatorData.macd.histogram[indicatorData.macd.histogram.length - 1].value
      : null;
  const valStochK =
    activeTime !== undefined
      ? indicatorData.stochKMap.get(activeTime) ?? null
      : indicatorData.stoch.k.length > 0
      ? indicatorData.stoch.k[indicatorData.stoch.k.length - 1].value
      : null;
  const valStochD =
    activeTime !== undefined
      ? indicatorData.stochDMap.get(activeTime) ?? null
      : indicatorData.stoch.d.length > 0
      ? indicatorData.stoch.d[indicatorData.stoch.d.length - 1].value
      : null;

  const fmtPrice = (v: number) =>
    (isIndex ? Number(v.toFixed(2)) : Math.round(v)).toLocaleString('id-ID', {
      maximumFractionDigits: isIndex ? 2 : 0,
    });

  const oscPaneEntries: { key: 'rsi' | 'macd' | 'stoch'; paneIdx: number }[] = [];
  let pCursor = 1;
  if (showRsi && indicatorData.rsi.length > 0) oscPaneEntries.push({ key: 'rsi', paneIdx: pCursor++ });
  if (showMacd && indicatorData.macd.histogram.length > 0) oscPaneEntries.push({ key: 'macd', paneIdx: pCursor++ });
  if (showStoch && indicatorData.stoch.k.length > 0) oscPaneEntries.push({ key: 'stoch', paneIdx: pCursor++ });

  const containerHeightClass = isFullscreen
    ? 'h-full'
    : activeOscillatorCount === 3
    ? 'h-[620px] sm:h-[700px]'
    : activeOscillatorCount === 2
    ? 'h-[540px] sm:h-[620px]'
    : activeOscillatorCount === 1
    ? 'h-[470px] sm:h-[540px]'
    : 'h-[420px] sm:h-[480px]';

  const handleHorizonClick = (preset: RangePreset) => {
    setRangePreset(preset);
    if ((preset === '6M' || preset === '1Y') && (timeframe === '15m' || timeframe === '1H')) {
      setTimeframe('1D');
      return;
    }
    if (chartRef.current && candles.length > 0) {
      applyRangeWindow(chartRef.current, candles, preset);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-[70] flex h-dvh w-screen flex-col overflow-hidden bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-[#0b1017]'
          : 'overflow-hidden rounded-[20px] border border-slate-200 bg-white dark:border-[#1d2833] dark:bg-[#0b1017]'
      }
    >
      {/* TradingView-style Compact Single-Strip Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b border-slate-200 bg-slate-50/90 px-3 py-2 dark:border-[#1c2633] dark:bg-[#0e141c]">
        {/* Left: Symbol + Price + Timeframes */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 pr-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse dark:bg-[#00e08a]" />
            <span className="font-mono text-xs font-extrabold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              {isIndex ? 'IHSG' : stock.ticker}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-800 dark:text-[#eaf1f7]">
              {isIndex ? '' : 'Rp '}
              {stock.price.toLocaleString('id-ID', {
                maximumFractionDigits: isIndex ? 2 : 0,
              })}
            </span>
            <span
              className={`font-mono text-[11px] font-bold tabular-nums ${
                stock.changePct >= 0
                  ? 'text-emerald-700 dark:text-[#00e08a]'
                  : 'text-red-700 dark:text-[#ff5a68]'
              }`}
            >
              {stock.changePct >= 0 ? '+' : ''}
              {stock.changePct.toFixed(2)}%
            </span>
          </div>

          <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-[#1c2633]" />

          {/* Timeframes inline */}
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-200/70 p-0.5 dark:bg-[#060a0f]">
            {(['15m', '1H', '1D', '1W'] as CandleTimeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf);
                  setRangePreset('ALL');
                }}
                className={`rounded-md px-2 py-1 font-mono text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                  timeframe === tf
                    ? 'bg-emerald-600 text-white dark:bg-[#00e08a] dark:text-[#03130b]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Range Horizons inline */}
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-200/70 p-0.5 dark:bg-[#060a0f]">
            {(
              [
                { id: '1M', label: '1B' },
                { id: '3M', label: '3B' },
                { id: '6M', label: '6B' },
                { id: '1Y', label: '1T' },
                { id: 'ALL', label: 'All' },
              ] as { id: RangePreset; label: string }[]
            ).map((rp) => (
              <button
                key={rp.id}
                type="button"
                onClick={() => handleHorizonClick(rp.id)}
                className={`rounded-md px-1.5 py-1 font-mono text-[10.5px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                  rangePreset === rp.id
                    ? 'bg-slate-800 text-white dark:bg-[#131b25] dark:text-[#00e08a]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {rp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Indikator Popover Trigger + Fit + Sync + Fullscreen */}
        <div className="flex flex-wrap items-center gap-1.5">
          {headerAction}

          <button
            type="button"
            onClick={() => setShowIndicatorMenu((v) => !v)}
            className={`inline-flex h-7 items-center gap-1 rounded-lg border px-2 font-mono text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
              showIndicatorMenu
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-[#00e08a] dark:bg-[#00e08a]/15 dark:text-[#00e08a]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-[#1c2633] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#00e08a]/50'
            }`}
            title="Atur indikator di dalam chart"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Indikator ({activeIndicatorCount}/8)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRangePreset('ALL');
              chartRef.current?.timeScale().fitContent();
            }}
            title="Fit seluruh rentang candlestick"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 dark:border-[#1c2633] dark:bg-[#131b25] dark:text-[#eaf1f7]"
          >
            <Scan className="h-3 w-3" />
            <span className="hidden sm:inline">Fit</span>
          </button>

          <button
            type="button"
            onClick={() => fetchCandles(timeframe, false)}
            disabled={loading}
            title="Sinkronkan OHLCV real-time"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#1c2633] dark:bg-[#131b25] dark:text-[#eaf1f7]"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkron</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Keluar layar penuh (Esc)' : 'Layar penuh TradingView'}
            className={`inline-flex h-7 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
              isFullscreen
                ? 'border-emerald-600 bg-emerald-600 text-white dark:border-[#00e08a] dark:bg-[#00e08a] dark:text-[#03130b]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-[#1c2633] dark:bg-[#131b25] dark:text-[#eaf1f7]'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3 w-3" />
                <span>Tutup</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Penuh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unified Live TradingView Chart Viewport — ALL Legends & Indicators INSIDE the Canvas */}
      <div
        className={`relative w-full overflow-hidden bg-white dark:bg-[#0b1017] ${
          isFullscreen ? 'flex-1 min-h-0' : ''
        }`}
      >
        {loading && candles.length === 0 ? (
          <div className={`flex items-center justify-center text-xs text-slate-500 dark:text-[#8d9aa8] ${containerHeightClass}`}>
            Memuat grafik TradingView {stock.ticker}...
          </div>
        ) : error && candles.length === 0 ? (
          <div className={`flex flex-col items-center justify-center gap-2 p-6 text-center text-xs text-red-700 dark:text-[#ff5a68] ${containerHeightClass}`}>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => fetchCandles(timeframe, false)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-800 hover:bg-red-100 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff5a68]"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* TradingView Canvas */}
            <div ref={containerRef} className={`w-full ${containerHeightClass}`} />

            {/* IN-CHART Floating TradingView Legends (Inside Each Pane) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden pr-[64px]">
              {/* Pane 0: OHLCV + Overlay Indicators Legend */}
              {activeDisplay && (
                <div className="absolute top-1.5 left-2 max-w-[calc(100%-10px)] space-y-0.5 font-mono text-[10.5px] leading-tight sm:text-[11px]">
                  <div className="pointer-events-auto inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md bg-white/80 px-1.5 py-0.5 backdrop-blur-xs dark:bg-[#0b1017]/80">
                    <span className="font-bold text-slate-900 dark:text-[#eaf1f7]">
                      {isIndex ? 'IDX:COMPOSITE' : `IDX:${stock.ticker}`} · {timeframe}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#8d9aa8]">
                      {activeDisplay.timeLabel}
                    </span>
                    <span className="text-slate-500 dark:text-[#8d9aa8]">
                      O<span className={activeDisplay.changePct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}>{fmtPrice(activeDisplay.open)}</span>
                    </span>
                    <span className="text-slate-500 dark:text-[#8d9aa8]">
                      H<span className={activeDisplay.changePct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}>{fmtPrice(activeDisplay.high)}</span>
                    </span>
                    <span className="text-slate-500 dark:text-[#8d9aa8]">
                      L<span className={activeDisplay.changePct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}>{fmtPrice(activeDisplay.low)}</span>
                    </span>
                    <span className="text-slate-500 dark:text-[#8d9aa8]">
                      C<span className={activeDisplay.changePct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}>{fmtPrice(activeDisplay.close)}</span>
                      <span className={`ml-1 font-bold ${activeDisplay.changePct >= 0 ? 'text-emerald-700 dark:text-[#00e08a]' : 'text-red-700 dark:text-[#ff5a68]'}`}>
                        ({activeDisplay.changePct >= 0 ? '+' : ''}{activeDisplay.changePct.toFixed(2)}%)
                      </span>
                    </span>
                    {showVolume && (
                      <span className="text-slate-500 dark:text-[#8d9aa8]">
                        Vol <span className="text-slate-800 dark:text-[#eaf1f7]">{formatVolumeCompact(activeDisplay.volume)}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowOverlayLegend((v) => !v)}
                      title={showOverlayLegend ? 'Ringkas daftar indikator' : 'Tampilkan daftar indikator'}
                      className="ml-0.5 inline-flex items-center rounded border border-slate-200 px-1 text-[9.5px] text-slate-600 hover:bg-slate-100 dark:border-[#1c2633] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]"
                    >
                      <ChevronDown className={`h-2.5 w-2.5 transition-transform ${showOverlayLegend ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showOverlayLegend && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {showMa20 && (
                        <button
                          type="button"
                          onClick={() => setShowMa20(false)}
                          className="pointer-events-auto inline-flex items-center gap-1 rounded bg-white/75 px-1.5 py-0.5 backdrop-blur-xs hover:bg-slate-100 dark:bg-[#0b1017]/75 dark:hover:bg-[#131b25]"
                          title="Klik untuk sembunyikan MA20"
                        >
                          <span className="text-slate-600 dark:text-[#98a6b5]">MA 20</span>
                          <span className="font-semibold text-amber-700 dark:text-[#ffb020]">
                            {valMa20 !== null ? fmtPrice(valMa20) : '—'}
                          </span>
                          <Eye className="h-2.5 w-2.5 text-slate-400" />
                        </button>
                      )}
                      {showEma50 && (
                        <button
                          type="button"
                          onClick={() => setShowEma50(false)}
                          className="pointer-events-auto inline-flex items-center gap-1 rounded bg-white/75 px-1.5 py-0.5 backdrop-blur-xs hover:bg-slate-100 dark:bg-[#0b1017]/75 dark:hover:bg-[#131b25]"
                          title="Klik untuk sembunyikan EMA50"
                        >
                          <span className="text-slate-600 dark:text-[#98a6b5]">EMA 50</span>
                          <span className="font-semibold text-blue-700 dark:text-[#3d8bff]">
                            {valEma50 !== null ? fmtPrice(valEma50) : '—'}
                          </span>
                          <Eye className="h-2.5 w-2.5 text-slate-400" />
                        </button>
                      )}
                      {showBb && (
                        <button
                          type="button"
                          onClick={() => setShowBb(false)}
                          className="pointer-events-auto inline-flex items-center gap-1 rounded bg-white/75 px-1.5 py-0.5 backdrop-blur-xs hover:bg-slate-100 dark:bg-[#0b1017]/75 dark:hover:bg-[#131b25]"
                          title="Klik untuk sembunyikan Bollinger Bands"
                        >
                          <span className="text-slate-600 dark:text-[#98a6b5]">BB 20 2</span>
                          <span className="font-semibold text-purple-700 dark:text-[#c264ff]">
                            {valBbUpper !== null && valBbLower !== null
                              ? `${fmtPrice(valBbUpper)}/${fmtPrice(valBbLower)}`
                              : '—'}
                          </span>
                          <Eye className="h-2.5 w-2.5 text-slate-400" />
                        </button>
                      )}
                      {showSupportResistance && srLevels.s1 > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowSupportResistance(false)}
                          className="pointer-events-auto inline-flex items-center gap-1 rounded bg-white/75 px-1.5 py-0.5 backdrop-blur-xs hover:bg-slate-100 dark:bg-[#0b1017]/75 dark:hover:bg-[#131b25]"
                          title="Klik untuk sembunyikan garis S1 / Pivot / R1"
                        >
                          <span className="text-emerald-700 dark:text-[#00e08a]">S1 {fmtPrice(srLevels.s1)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 dark:text-[#98a6b5]">P {fmtPrice(srLevels.pivot)}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-red-700 dark:text-[#ff5a68]">R1 {fmtPrice(srLevels.r1)}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Pane Floating TradingView Legends Positioned Directly Inside Each Sub-Pane */}
              {oscPaneEntries.map(({ key, paneIdx }) => {
                const topPx = paneTopOffsets[paneIdx];
                if (topPx === undefined) return null;

                if (key === 'rsi') {
                  return (
                    <div
                      key="pane-rsi-legend"
                      style={{ top: `${topPx + 4}px` }}
                      className="pointer-events-auto absolute left-2 inline-flex items-center gap-1.5 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-xs dark:bg-[#0b1017]/80"
                    >
                      <span className="font-semibold text-slate-600 dark:text-[#98a6b5]">RSI (14)</span>
                      <span className="font-bold text-purple-700 dark:text-[#c264ff]">
                        {valRsi !== null ? valRsi.toFixed(2) : '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRsi(false)}
                        title="Tutup panel RSI"
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  );
                }

                if (key === 'macd') {
                  return (
                    <div
                      key="pane-macd-legend"
                      style={{ top: `${topPx + 4}px` }}
                      className="pointer-events-auto absolute left-2 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-xs dark:bg-[#0b1017]/80"
                    >
                      <span className="font-semibold text-slate-600 dark:text-[#98a6b5]">MACD (12, 26, 9)</span>
                      <span className="font-bold text-blue-700 dark:text-[#3d8bff]">
                        {valMacd !== null ? valMacd.toFixed(2) : '—'}
                      </span>
                      <span className="font-semibold text-amber-700 dark:text-[#ffb020]">
                        Sig {valSig !== null ? valSig.toFixed(2) : '—'}
                      </span>
                      <span
                        className={`font-semibold ${
                          (valHist ?? 0) >= 0
                            ? 'text-emerald-700 dark:text-[#00e08a]'
                            : 'text-red-700 dark:text-[#ff5a68]'
                        }`}
                      >
                        Hist {valHist !== null ? valHist.toFixed(2) : '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMacd(false)}
                        title="Tutup panel MACD"
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key="pane-stoch-legend"
                    style={{ top: `${topPx + 4}px` }}
                    className="pointer-events-auto absolute left-2 inline-flex items-center gap-2 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-xs dark:bg-[#0b1017]/80"
                  >
                    <span className="font-semibold text-slate-600 dark:text-[#98a6b5]">Stoch (14, 3, 3)</span>
                    <span className="font-bold text-emerald-700 dark:text-[#00e08a]">
                      %K {valStochK !== null ? valStochK.toFixed(2) : '—'}
                    </span>
                    <span className="font-semibold text-red-700 dark:text-[#ff5a68]">
                      %D {valStochD !== null ? valStochD.toFixed(2) : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStoch(false)}
                      title="Tutup panel Stochastic"
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-none absolute bottom-7 right-[68px] hidden sm:block font-mono text-[9.5px] text-slate-400/75 dark:text-[#8d9aa8]/65">
              {feedSource === 'live-yahoo' ? 'OHLCV Live · WIB' : 'Tick BEI · WIB'}
            </div>

            {/* Floating In-Chart Indicators Selector Popover */}
            {showIndicatorMenu && (
              <div className="absolute top-2 right-2 z-30 w-64 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-[#243140] dark:bg-[#0e141c]/95">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#1c2633]">
                  <span className="font-display text-xs font-bold text-slate-900 dark:text-[#eaf1f7]">
                    Indikator TradingView
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAllIndicators(!allIndicatorsActive)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-[#00e08a]/15 dark:text-[#00e08a]"
                    >
                      <Layers className="h-2.5 w-2.5" />
                      {allIndicatorsActive ? 'Reset' : 'Semua'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowIndicatorMenu(false)}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#eaf1f7]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  {(
                    [
                      { label: 'MA (20)', color: '#ffb020', active: showMa20, toggle: () => setShowMa20((v) => !v) },
                      { label: 'EMA (50)', color: '#3d8bff', active: showEma50, toggle: () => setShowEma50((v) => !v) },
                      { label: 'Bollinger Bands (20,2)', color: '#c264ff', active: showBb, toggle: () => setShowBb((v) => !v) },
                      { label: 'Volume Bar', color: '#8d9aa8', active: showVolume, toggle: () => setShowVolume((v) => !v) },
                      { label: 'Support / Pivot / R1', color: '#00e08a', active: showSupportResistance, toggle: () => setShowSupportResistance((v) => !v) },
                      { label: 'RSI (14)', color: '#c264ff', active: showRsi, toggle: () => setShowRsi((v) => !v) },
                      { label: 'MACD (12, 26, 9)', color: '#3d8bff', active: showMacd, toggle: () => setShowMacd((v) => !v) },
                      { label: 'Stochastic (14, 3, 3)', color: '#00e08a', active: showStoch, toggle: () => setShowStoch((v) => !v) },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.toggle}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors ${
                        item.active
                          ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-[#131b25] dark:text-[#eaf1f7]'
                          : 'text-slate-500 hover:bg-slate-50 dark:text-[#8d9aa8] dark:hover:bg-[#131b25]/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.label}</span>
                      </span>
                      {item.active ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-[#00e08a]" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
