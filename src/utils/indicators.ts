import type { CandleBar } from '../types/market';

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface BollingerResult {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

export interface MacdResult {
  macd: IndicatorPoint[];
  signal: IndicatorPoint[];
  histogram: Array<{ time: number; value: number; color: string }>;
}

export interface StochasticResult {
  k: IndicatorPoint[];
  d: IndicatorPoint[];
}

export function calcSMA(candles: CandleBar[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const out: IndicatorPoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
    }
    if (i >= period - 1) {
      out.push({
        time: candles[i].time,
        value: Number((sum / period).toFixed(2)),
      });
    }
  }
  return out;
}

export function calcEMA(candles: CandleBar[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += candles[i].close;
  }
  ema /= period;

  const out: IndicatorPoint[] = [
    { time: candles[period - 1].time, value: Number(ema.toFixed(2)) },
  ];
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    out.push({
      time: candles[i].time,
      value: Number(ema.toFixed(2)),
    });
  }
  return out;
}

export function calcBollingerBands(
  candles: CandleBar[],
  period = 20,
  stdDevMult = 2
): BollingerResult {
  if (candles.length < period) {
    return { upper: [], middle: [], lower: [] };
  }
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const mean = sum / period;
    let sqDiff = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = candles[j].close - mean;
      sqDiff += diff * diff;
    }
    const std = Math.sqrt(sqDiff / period);
    const t = candles[i].time;

    middle.push({ time: t, value: Number(mean.toFixed(2)) });
    upper.push({ time: t, value: Number((mean + stdDevMult * std).toFixed(2)) });
    lower.push({ time: t, value: Number((mean - stdDevMult * std).toFixed(2)) });
  }

  return { upper, middle, lower };
}

export function calcRSI(candles: CandleBar[], period = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];
  const out: IndicatorPoint[] = [];
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gainSum += change;
    else lossSum += Math.abs(change);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  const firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  out.push({ time: candles[period].time, value: Number(firstRsi.toFixed(2)) });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    out.push({ time: candles[i].time, value: Number(rsi.toFixed(2)) });
  }

  return out;
}

export function calcMACD(
  candles: CandleBar[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdResult {
  if (candles.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }
  const fastEma = calcEMA(candles, fastPeriod);
  const slowEma = calcEMA(candles, slowPeriod);
  const fastMap = new Map(fastEma.map((p) => [p.time, p.value]));

  const macdLine: IndicatorPoint[] = [];
  for (const s of slowEma) {
    const f = fastMap.get(s.time);
    if (f !== undefined) {
      macdLine.push({
        time: s.time,
        value: Number((f - s.value).toFixed(2)),
      });
    }
  }

  if (macdLine.length < signalPeriod) {
    return { macd: macdLine, signal: [], histogram: [] };
  }

  const k = 2 / (signalPeriod + 1);
  let sigEma = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sigEma += macdLine[i].value;
  }
  sigEma /= signalPeriod;

  const signal: IndicatorPoint[] = [
    { time: macdLine[signalPeriod - 1].time, value: Number(sigEma.toFixed(2)) },
  ];
  for (let i = signalPeriod; i < macdLine.length; i++) {
    sigEma = macdLine[i].value * k + sigEma * (1 - k);
    signal.push({
      time: macdLine[i].time,
      value: Number(sigEma.toFixed(2)),
    });
  }

  const sigMap = new Map(signal.map((p) => [p.time, p.value]));
  const histogram: Array<{ time: number; value: number; color: string }> = [];
  for (const m of macdLine) {
    const s = sigMap.get(m.time);
    if (s !== undefined) {
      const diff = Number((m.value - s).toFixed(2));
      histogram.push({
        time: m.time,
        value: diff,
        color: diff >= 0 ? 'rgba(13, 148, 136, 0.75)' : 'rgba(220, 38, 38, 0.72)',
      });
    }
  }

  return { macd: macdLine, signal, histogram };
}

export function calcStochastic(
  candles: CandleBar[],
  kPeriod = 14,
  smoothK = 3,
  dPeriod = 3
): StochasticResult {
  if (candles.length < kPeriod + smoothK + dPeriod) {
    return { k: [], d: [] };
  }

  const rawK: IndicatorPoint[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;
    for (let j = i - kPeriod + 1; j <= i; j++) {
      if (candles[j].high > highest) highest = candles[j].high;
      if (candles[j].low < lowest) lowest = candles[j].low;
    }
    const range = highest - lowest;
    const val = range === 0 ? 50 : ((candles[i].close - lowest) / range) * 100;
    rawK.push({ time: candles[i].time, value: Number(val.toFixed(2)) });
  }

  const kLine: IndicatorPoint[] = [];
  for (let i = smoothK - 1; i < rawK.length; i++) {
    let sum = 0;
    for (let j = i - smoothK + 1; j <= i; j++) sum += rawK[j].value;
    kLine.push({ time: rawK[i].time, value: Number((sum / smoothK).toFixed(2)) });
  }

  const dLine: IndicatorPoint[] = [];
  for (let i = dPeriod - 1; i < kLine.length; i++) {
    let sum = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) sum += kLine[j].value;
    dLine.push({ time: kLine[i].time, value: Number((sum / dPeriod).toFixed(2)) });
  }

  return { k: kLine, d: dLine };
}
