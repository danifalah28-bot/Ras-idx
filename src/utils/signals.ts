import type { StockRecord } from '../types/market';

export type TechnicalSignalLabel = 'Beli' | 'Tahan' | 'Jual';

export function computeTechnicalSignal(stock: StockRecord): TechnicalSignalLabel {
  if (
    stock.lampStatus === 'BREAKDOWN_SUPPORT' ||
    (stock.price < stock.ma20 && stock.inflow1WB < -10) ||
    (stock.rsi14 > 78 && stock.inflow1WB < 0)
  ) {
    return 'Jual';
  }

  if (
    (stock.price > stock.ma20 && stock.inflow1WB > 10 && stock.rsi14 < 74) ||
    (stock.lampStatus === 'BREAKOUT_RESISTANCE' && stock.inflow1WB > 0 && stock.rsi14 <= 76)
  ) {
    return 'Beli';
  }

  return 'Tahan';
}

export function getSignalToneClasses(signal: TechnicalSignalLabel): string {
  switch (signal) {
    case 'Beli':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'Jual':
      return 'text-red-700 dark:text-red-400';
    default:
      return 'text-amber-700 dark:text-amber-400';
  }
}
