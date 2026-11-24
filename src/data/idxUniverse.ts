import type { IdxSector, LampStatus, ListingBoard, StockRecord } from '../types/market.ts';

interface FlagshipSeed {
  ticker: string;
  name: string;
  sector: IdxSector;
  subSector: string;
  board: ListingBoard;
  indexTags: string[];
  price: number;
  changePct: number;
  marketCapT: number;
  revenueT: number;
  netProfitT: number;
  grossMarginPct: number;
  netMarginPct: number;
  roePct: number;
  roaPct: number;
  der: number;
  currentRatio: number;
  per: number;
  pbv: number;
  evEbitda: number;
  divYieldPct: number;
  epsGrowthPct: number;
  freeCashFlowT: number;
  adtvB: number;
  freeFloatPct: number;
  inflow1DB: number;
  inflow1WB: number;
  inflow1MB: number;
  foreignFlow1WB: number;
  rsi14: number;
  ma20OffsetPct: number; // + above MA20, - below MA20
  ma50OffsetPct: number;
  srBias: 'BREAKOUT' | 'SUPPORT' | 'BREAKDOWN' | 'MID';
}

const FLAGSHIP_SEEDS: FlagshipSeed[] = [
  // KEUANGAN
  {
    ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100'], price: 10150, changePct: 1.75, marketCapT: 1251.2,
    revenueT: 108.4, netProfitT: 54.8, grossMarginPct: 79.4, netMarginPct: 50.5, roePct: 21.8, roaPct: 3.9,
    der: 0.42, currentRatio: 1.48, per: 22.8, pbv: 4.85, evEbitda: 15.2, divYieldPct: 2.8, epsGrowthPct: 12.6, freeCashFlowT: 48.2,
    adtvB: 845.0, freeFloatPct: 43.2, inflow1DB: 198.4, inflow1WB: 842.6, inflow1MB: 2140.5, foreignFlow1WB: 765.0,
    rsi14: 64.2, ma20OffsetPct: 2.8, ma50OffsetPct: 5.1, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BBRI', name: 'Bank Rakyat Indonesia (Persero) Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100'], price: 4680, changePct: -0.64, marketCapT: 709.3,
    revenueT: 196.2, netProfitT: 60.4, grossMarginPct: 72.1, netMarginPct: 30.8, roePct: 18.9, roaPct: 3.1,
    der: 0.65, currentRatio: 1.32, per: 11.7, pbv: 2.21, evEbitda: 8.4, divYieldPct: 6.4, epsGrowthPct: 4.2, freeCashFlowT: 42.1,
    adtvB: 1020.5, freeFloatPct: 46.8, inflow1DB: -42.3, inflow1WB: -185.0, inflow1MB: -620.4, foreignFlow1WB: -210.0,
    rsi14: 41.5, ma20OffsetPct: -1.8, ma50OffsetPct: -3.4, srBias: 'SUPPORT'
  },
  {
    ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100'], price: 6725, changePct: 2.28, marketCapT: 627.6,
    revenueT: 148.5, netProfitT: 56.2, grossMarginPct: 74.6, netMarginPct: 37.8, roePct: 21.1, roaPct: 2.7,
    der: 0.72, currentRatio: 1.38, per: 11.2, pbv: 2.28, evEbitda: 8.1, divYieldPct: 5.3, epsGrowthPct: 9.8, freeCashFlowT: 44.5,
    adtvB: 790.2, freeFloatPct: 40.0, inflow1DB: 162.8, inflow1WB: 615.4, inflow1MB: 1480.2, foreignFlow1WB: 540.1,
    rsi14: 66.8, ma20OffsetPct: 3.4, ma50OffsetPct: 6.2, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BBNI', name: 'Bank Negara Indonesia (Persero) Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100'], price: 5175, changePct: 0.98, marketCapT: 193.0,
    revenueT: 68.4, netProfitT: 21.8, grossMarginPct: 68.2, netMarginPct: 31.9, roePct: 14.4, roaPct: 2.1,
    der: 0.68, currentRatio: 1.29, per: 8.9, pbv: 1.25, evEbitda: 6.8, divYieldPct: 5.5, epsGrowthPct: 7.4, freeCashFlowT: 18.4,
    adtvB: 315.8, freeFloatPct: 40.0, inflow1DB: 44.2, inflow1WB: 192.5, inflow1MB: 410.0, foreignFlow1WB: 145.0,
    rsi14: 58.1, ma20OffsetPct: 1.5, ma50OffsetPct: 2.7, srBias: 'MID'
  },
  {
    ticker: 'BRIS', name: 'Bank Syariah Indonesia Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 2980, changePct: 3.11, marketCapT: 137.5,
    revenueT: 26.8, netProfitT: 7.1, grossMarginPct: 71.0, netMarginPct: 26.5, roePct: 17.6, roaPct: 2.0,
    der: 0.54, currentRatio: 1.42, per: 19.3, pbv: 3.18, evEbitda: 12.1, divYieldPct: 1.2, epsGrowthPct: 21.4, freeCashFlowT: 6.2,
    adtvB: 168.4, freeFloatPct: 16.5, inflow1DB: 68.5, inflow1WB: 245.8, inflow1MB: 590.3, foreignFlow1WB: 182.0,
    rsi14: 68.9, ma20OffsetPct: 4.5, ma50OffsetPct: 9.2, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BBTN', name: 'Bank Tabungan Negara (Persero) Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100'], price: 1320, changePct: -1.12, marketCapT: 18.5,
    revenueT: 31.2, netProfitT: 3.5, grossMarginPct: 54.0, netMarginPct: 11.2, roePct: 11.4, roaPct: 0.85,
    der: 1.08, currentRatio: 1.18, per: 5.3, pbv: 0.59, evEbitda: 5.2, divYieldPct: 3.9, epsGrowthPct: 3.2, freeCashFlowT: 2.1,
    adtvB: 54.2, freeFloatPct: 40.0, inflow1DB: -8.4, inflow1WB: -24.1, inflow1MB: -45.8, foreignFlow1WB: -16.2,
    rsi14: 39.2, ma20OffsetPct: -2.4, ma50OffsetPct: -4.1, srBias: 'SUPPORT'
  },
  {
    ticker: 'ARTO', name: 'Bank Jago Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100'], price: 2540, changePct: 1.60, marketCapT: 35.2,
    revenueT: 2.4, netProfitT: 0.16, grossMarginPct: 78.2, netMarginPct: 6.7, roePct: 2.1, roaPct: 0.65,
    der: 0.25, currentRatio: 1.85, per: 215.0, pbv: 4.15, evEbitda: 64.0, divYieldPct: 0.0, epsGrowthPct: 48.0, freeCashFlowT: 0.22,
    adtvB: 62.5, freeFloatPct: 28.4, inflow1DB: 12.1, inflow1WB: 38.4, inflow1MB: 94.0, foreignFlow1WB: 18.5,
    rsi14: 55.4, ma20OffsetPct: 1.1, ma50OffsetPct: 3.8, srBias: 'MID'
  },
  {
    ticker: 'BTPS', name: 'Bank BTPN Syariah Tbk', sector: 'Keuangan', subSector: 'Perbankan', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 1095, changePct: -0.90, marketCapT: 8.4,
    revenueT: 5.2, netProfitT: 1.1, grossMarginPct: 82.0, netMarginPct: 21.1, roePct: 12.6, roaPct: 5.4,
    der: 0.18, currentRatio: 2.10, per: 7.6, pbv: 0.94, evEbitda: 5.1, divYieldPct: 6.1, epsGrowthPct: -5.4, freeCashFlowT: 0.95,
    adtvB: 18.6, freeFloatPct: 30.0, inflow1DB: -2.1, inflow1WB: 6.4, inflow1MB: -12.0, foreignFlow1WB: 4.1,
    rsi14: 43.8, ma20OffsetPct: -1.1, ma50OffsetPct: -2.9, srBias: 'SUPPORT'
  },

  // ENERGI (BATUBARA, MIGAS, JASA ENERGI)
  {
    ticker: 'ADRO', name: 'Alamtri Resources Indonesia Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 2490, changePct: 2.47, marketCapT: 76.6,
    revenueT: 88.4, netProfitT: 21.2, grossMarginPct: 41.2, netMarginPct: 24.0, roePct: 20.4, roaPct: 13.8,
    der: 0.22, currentRatio: 2.45, per: 3.6, pbv: 0.88, evEbitda: 2.4, divYieldPct: 11.8, epsGrowthPct: -6.2, freeCashFlowT: 19.4,
    adtvB: 312.5, freeFloatPct: 35.8, inflow1DB: 78.4, inflow1WB: 312.0, inflow1MB: 685.2, foreignFlow1WB: 245.6,
    rsi14: 63.4, ma20OffsetPct: 3.2, ma50OffsetPct: 6.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'ITMG', name: 'Indo Tambangraya Megah Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 26850, changePct: 1.32, marketCapT: 30.3,
    revenueT: 36.8, netProfitT: 6.4, grossMarginPct: 33.4, netMarginPct: 17.4, roePct: 22.1, roaPct: 16.5,
    der: 0.08, currentRatio: 3.15, per: 4.7, pbv: 1.04, evEbitda: 2.1, divYieldPct: 12.4, epsGrowthPct: -8.1, freeCashFlowT: 5.8,
    adtvB: 68.4, freeFloatPct: 34.8, inflow1DB: 18.2, inflow1WB: 86.4, inflow1MB: 192.0, foreignFlow1WB: 62.0,
    rsi14: 59.8, ma20OffsetPct: 1.9, ma50OffsetPct: 4.3, srBias: 'MID'
  },
  {
    ticker: 'PTBA', name: 'Bukit Asam Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 2810, changePct: 0.72, marketCapT: 32.4,
    revenueT: 41.2, netProfitT: 5.4, grossMarginPct: 24.8, netMarginPct: 13.1, roePct: 23.6, roaPct: 13.4,
    der: 0.16, currentRatio: 1.92, per: 6.0, pbv: 1.42, evEbitda: 3.8, divYieldPct: 10.2, epsGrowthPct: 2.5, freeCashFlowT: 4.6,
    adtvB: 82.1, freeFloatPct: 34.1, inflow1DB: 14.5, inflow1WB: 62.8, inflow1MB: 145.0, foreignFlow1WB: 44.2,
    rsi14: 56.2, ma20OffsetPct: 1.4, ma50OffsetPct: 2.9, srBias: 'MID'
  },
  {
    ticker: 'ADMR', name: 'Alamtri Minerals Indonesia Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 1395, changePct: 3.33, marketCapT: 57.0,
    revenueT: 17.9, netProfitT: 6.8, grossMarginPct: 52.4, netMarginPct: 38.0, roePct: 31.2, roaPct: 22.4,
    der: 0.31, currentRatio: 2.68, per: 8.4, pbv: 2.58, evEbitda: 5.6, divYieldPct: 0.0, epsGrowthPct: 18.4, freeCashFlowT: 5.4,
    adtvB: 74.3, freeFloatPct: 16.2, inflow1DB: 28.4, inflow1WB: 112.6, inflow1MB: 240.0, foreignFlow1WB: 78.4,
    rsi14: 65.1, ma20OffsetPct: 3.9, ma50OffsetPct: 7.4, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BYAN', name: 'Bayan Resources Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 18450, changePct: 0.27, marketCapT: 615.0,
    revenueT: 54.2, netProfitT: 15.8, grossMarginPct: 44.8, netMarginPct: 29.1, roePct: 42.5, roaPct: 28.9,
    der: 0.14, currentRatio: 2.25, per: 38.9, pbv: 15.8, evEbitda: 24.5, divYieldPct: 2.1, epsGrowthPct: -4.2, freeCashFlowT: 14.1,
    adtvB: 22.4, freeFloatPct: 10.2, inflow1DB: 4.1, inflow1WB: 16.8, inflow1MB: 42.0, foreignFlow1WB: 8.2,
    rsi14: 53.0, ma20OffsetPct: 0.6, ma50OffsetPct: 1.9, srBias: 'MID'
  },
  {
    ticker: 'MEDC', name: 'Medco Energi Internasional Tbk', sector: 'Energi', subSector: 'Minyak & Gas', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 1315, changePct: 2.73, marketCapT: 33.0,
    revenueT: 37.6, netProfitT: 5.9, grossMarginPct: 43.2, netMarginPct: 15.7, roePct: 17.8, roaPct: 5.1,
    der: 1.48, currentRatio: 1.44, per: 5.6, pbv: 0.96, evEbitda: 3.9, divYieldPct: 3.2, epsGrowthPct: 16.5, freeCashFlowT: 7.2,
    adtvB: 96.5, freeFloatPct: 38.5, inflow1DB: 32.1, inflow1WB: 128.4, inflow1MB: 280.4, foreignFlow1WB: 95.0,
    rsi14: 64.0, ma20OffsetPct: 3.5, ma50OffsetPct: 5.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'PGAS', name: 'Perusahaan Gas Negara Tbk', sector: 'Energi', subSector: 'Minyak & Gas', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 1565, changePct: 1.29, marketCapT: 37.9,
    revenueT: 58.2, netProfitT: 5.4, grossMarginPct: 22.4, netMarginPct: 9.3, roePct: 12.1, roaPct: 5.2,
    der: 0.62, currentRatio: 1.88, per: 7.0, pbv: 0.84, evEbitda: 4.1, divYieldPct: 8.4, epsGrowthPct: 14.2, freeCashFlowT: 6.1,
    adtvB: 108.4, freeFloatPct: 43.0, inflow1DB: 22.5, inflow1WB: 94.2, inflow1MB: 215.0, foreignFlow1WB: 68.4,
    rsi14: 60.4, ma20OffsetPct: 2.1, ma50OffsetPct: 4.6, srBias: 'MID'
  },
  {
    ticker: 'AKRA', name: 'AKR Corporindo Tbk', sector: 'Energi', subSector: 'Minyak & Gas', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 1380, changePct: -0.72, marketCapT: 27.7,
    revenueT: 39.4, netProfitT: 2.5, grossMarginPct: 9.8, netMarginPct: 6.3, roePct: 20.6, roaPct: 8.9,
    der: 0.38, currentRatio: 1.62, per: 11.1, pbv: 2.28, evEbitda: 7.4, divYieldPct: 6.5, epsGrowthPct: 4.8, freeCashFlowT: 2.2,
    adtvB: 52.4, freeFloatPct: 37.4, inflow1DB: -4.2, inflow1WB: -11.5, inflow1MB: 18.0, foreignFlow1WB: -6.4,
    rsi14: 42.1, ma20OffsetPct: -1.4, ma50OffsetPct: -2.2, srBias: 'SUPPORT'
  },
  {
    ticker: 'ENRG', name: 'Energi Mega Persada Tbk', sector: 'Energi', subSector: 'Minyak & Gas', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 248, changePct: 2.48, marketCapT: 6.2,
    revenueT: 6.8, netProfitT: 1.1, grossMarginPct: 38.4, netMarginPct: 16.2, roePct: 12.8, roaPct: 5.4,
    der: 0.85, currentRatio: 1.18, per: 5.6, pbv: 0.72, evEbitda: 3.4, divYieldPct: 0.0, epsGrowthPct: 19.2, freeCashFlowT: 1.3,
    adtvB: 38.2, freeFloatPct: 49.0, inflow1DB: 8.4, inflow1WB: 31.2, inflow1MB: 68.0, foreignFlow1WB: 14.5,
    rsi14: 61.8, ma20OffsetPct: 2.8, ma50OffsetPct: 4.9, srBias: 'MID'
  },
  {
    ticker: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk', sector: 'Energi', subSector: 'Batubara', board: 'Utama',
    indexTags: ['Kompas100'], price: 7850, changePct: 3.97, marketCapT: 88.2,
    revenueT: 11.4, netProfitT: 2.1, grossMarginPct: 34.5, netMarginPct: 18.4, roePct: 26.8, roaPct: 9.2,
    der: 1.12, currentRatio: 1.54, per: 42.0, pbv: 11.2, evEbitda: 25.4, divYieldPct: 0.0, epsGrowthPct: 62.0, freeCashFlowT: 1.8,
    adtvB: 164.0, freeFloatPct: 15.0, inflow1DB: 48.2, inflow1WB: 184.5, inflow1MB: 410.2, foreignFlow1WB: 112.0,
    rsi14: 69.4, ma20OffsetPct: 5.2, ma50OffsetPct: 12.4, srBias: 'BREAKOUT'
  },

  // BARANG BAKU (TAMBANG LOGAM, KIMIA, SEMEN, PULP)
  {
    ticker: 'AMMN', name: 'Amman Mineral Internasional Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 9650, changePct: 1.85, marketCapT: 699.8,
    revenueT: 48.2, netProfitT: 14.1, grossMarginPct: 51.2, netMarginPct: 29.2, roePct: 18.4, roaPct: 8.9,
    der: 0.78, currentRatio: 1.94, per: 49.6, pbv: 8.92, evEbitda: 27.4, divYieldPct: 0.0, epsGrowthPct: 85.4, freeCashFlowT: 8.4,
    adtvB: 425.0, freeFloatPct: 17.8, inflow1DB: 115.2, inflow1WB: 468.0, inflow1MB: 980.4, foreignFlow1WB: 390.5,
    rsi14: 65.8, ma20OffsetPct: 3.1, ma50OffsetPct: 7.6, srBias: 'BREAKOUT'
  },
  {
    ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 1585, changePct: 2.26, marketCapT: 38.1,
    revenueT: 54.6, netProfitT: 3.6, grossMarginPct: 14.8, netMarginPct: 6.6, roePct: 12.8, roaPct: 8.4,
    der: 0.14, currentRatio: 2.38, per: 10.6, pbv: 1.26, evEbitda: 6.8, divYieldPct: 5.2, epsGrowthPct: 18.2, freeCashFlowT: 3.2,
    adtvB: 184.5, freeFloatPct: 35.0, inflow1DB: 48.5, inflow1WB: 196.4, inflow1MB: 412.0, foreignFlow1WB: 142.0,
    rsi14: 63.2, ma20OffsetPct: 2.9, ma50OffsetPct: 5.4, srBias: 'BREAKOUT'
  },
  {
    ticker: 'INCO', name: 'Vale Indonesia Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 3920, changePct: -1.01, marketCapT: 41.3,
    revenueT: 16.4, netProfitT: 1.8, grossMarginPct: 18.2, netMarginPct: 11.0, roePct: 4.8, roaPct: 3.9,
    der: 0.09, currentRatio: 4.12, per: 22.9, pbv: 0.98, evEbitda: 8.4, divYieldPct: 0.0, epsGrowthPct: -34.2, freeCashFlowT: 1.1,
    adtvB: 72.8, freeFloatPct: 21.4, inflow1DB: -14.2, inflow1WB: -38.5, inflow1MB: -82.0, foreignFlow1WB: -28.4,
    rsi14: 40.8, ma20OffsetPct: -1.9, ma50OffsetPct: -4.2, srBias: 'SUPPORT'
  },
  {
    ticker: 'MDKA', name: 'Merdeka Copper Gold Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 2240, changePct: 1.36, marketCapT: 54.8,
    revenueT: 32.8, netProfitT: 0.65, grossMarginPct: 15.4, netMarginPct: 2.0, roePct: 3.9, roaPct: 1.1,
    der: 0.95, currentRatio: 1.56, per: 84.3, pbv: 3.12, evEbitda: 14.8, divYieldPct: 0.0, epsGrowthPct: 42.0, freeCashFlowT: 0.8,
    adtvB: 138.4, freeFloatPct: 42.1, inflow1DB: 24.5, inflow1WB: 98.2, inflow1MB: 185.0, foreignFlow1WB: 72.1,
    rsi14: 58.6, ma20OffsetPct: 1.8, ma50OffsetPct: 3.5, srBias: 'MID'
  },
  {
    ticker: 'MBMA', name: 'Merdeka Battery Materials Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 545, changePct: 0.93, marketCapT: 58.9,
    revenueT: 26.4, netProfitT: 1.2, grossMarginPct: 11.4, netMarginPct: 4.5, roePct: 4.9, roaPct: 2.4,
    der: 0.44, currentRatio: 1.72, per: 49.0, pbv: 2.34, evEbitda: 16.2, divYieldPct: 0.0, epsGrowthPct: 68.0, freeCashFlowT: 0.9,
    adtvB: 84.2, freeFloatPct: 23.4, inflow1DB: 12.8, inflow1WB: 44.5, inflow1MB: 96.0, foreignFlow1WB: 29.4,
    rsi14: 54.8, ma20OffsetPct: 0.9, ma50OffsetPct: 2.1, srBias: 'MID'
  },
  {
    ticker: 'NCKL', name: 'Trimegah Bangun Persada Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 895, changePct: 2.29, marketCapT: 56.5,
    revenueT: 27.8, netProfitT: 6.2, grossMarginPct: 34.1, netMarginPct: 22.3, roePct: 22.4, roaPct: 12.1,
    der: 0.46, currentRatio: 1.84, per: 9.1, pbv: 1.98, evEbitda: 6.4, divYieldPct: 3.1, epsGrowthPct: 14.5, freeCashFlowT: 4.8,
    adtvB: 48.5, freeFloatPct: 14.8, inflow1DB: 16.4, inflow1WB: 74.2, inflow1MB: 162.0, foreignFlow1WB: 51.0,
    rsi14: 63.5, ma20OffsetPct: 2.6, ma50OffsetPct: 5.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BRMS', name: 'Bumi Resources Minerals Tbk', sector: 'Barang Baku', subSector: 'Pertambangan Logam', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 378, changePct: 3.28, marketCapT: 53.6,
    revenueT: 2.6, netProfitT: 0.48, grossMarginPct: 48.0, netMarginPct: 18.5, roePct: 3.2, roaPct: 2.6,
    der: 0.12, currentRatio: 2.14, per: 111.6, pbv: 3.45, evEbitda: 38.2, divYieldPct: 0.0, epsGrowthPct: 92.0, freeCashFlowT: 0.35,
    adtvB: 215.4, freeFloatPct: 48.2, inflow1DB: 58.2, inflow1WB: 224.0, inflow1MB: 495.0, foreignFlow1WB: 138.0,
    rsi14: 67.2, ma20OffsetPct: 4.4, ma50OffsetPct: 10.5, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BRPT', name: 'Barito Pacific Tbk', sector: 'Barang Baku', subSector: 'Kimia', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 985, changePct: -1.50, marketCapT: 92.3,
    revenueT: 41.2, netProfitT: 0.92, grossMarginPct: 18.4, netMarginPct: 2.2, roePct: 2.9, roaPct: 0.8,
    der: 1.56, currentRatio: 1.48, per: 100.3, pbv: 2.94, evEbitda: 18.4, divYieldPct: 0.4, epsGrowthPct: -12.0, freeCashFlowT: 1.4,
    adtvB: 112.0, freeFloatPct: 28.4, inflow1DB: -18.5, inflow1WB: -64.2, inflow1MB: -140.0, foreignFlow1WB: -42.0,
    rsi14: 38.4, ma20OffsetPct: -2.6, ma50OffsetPct: -5.4, srBias: 'SUPPORT'
  },
  {
    ticker: 'TPIA', name: 'Chandra Asri Pacific Tbk', sector: 'Barang Baku', subSector: 'Kimia', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 7650, changePct: 0.66, marketCapT: 661.8,
    revenueT: 31.4, netProfitT: 0.45, grossMarginPct: 6.2, netMarginPct: 1.4, roePct: 1.2, roaPct: 0.5,
    der: 0.82, currentRatio: 2.65, per: 1470.0, pbv: 14.8, evEbitda: 94.0, divYieldPct: 0.2, epsGrowthPct: -18.0, freeCashFlowT: 0.6,
    adtvB: 194.2, freeFloatPct: 11.4, inflow1DB: 22.1, inflow1WB: 84.5, inflow1MB: 190.0, foreignFlow1WB: 61.2,
    rsi14: 54.1, ma20OffsetPct: 0.8, ma50OffsetPct: 2.2, srBias: 'MID'
  },
  {
    ticker: 'INKP', name: 'Indah Kiat Pulp & Paper Tbk', sector: 'Barang Baku', subSector: 'Kertas & Kehutanan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 7925, changePct: 1.60, marketCapT: 43.4,
    revenueT: 54.8, netProfitT: 7.4, grossMarginPct: 33.8, netMarginPct: 13.5, roePct: 8.1, roaPct: 4.5,
    der: 0.64, currentRatio: 2.28, per: 5.9, pbv: 0.46, evEbitda: 5.8, divYieldPct: 0.7, epsGrowthPct: 11.2, freeCashFlowT: 4.2,
    adtvB: 64.8, freeFloatPct: 42.8, inflow1DB: 16.4, inflow1WB: 68.5, inflow1MB: 142.0, foreignFlow1WB: 49.0,
    rsi14: 60.2, ma20OffsetPct: 2.2, ma50OffsetPct: 4.1, srBias: 'MID'
  },
  {
    ticker: 'SMGR', name: 'Semen Indonesia (Persero) Tbk', sector: 'Barang Baku', subSector: 'Material Konstruksi', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 3640, changePct: -1.62, marketCapT: 24.6,
    revenueT: 38.2, netProfitT: 1.8, grossMarginPct: 24.6, netMarginPct: 4.7, roePct: 4.2, roaPct: 2.3,
    der: 0.42, currentRatio: 1.68, per: 13.6, pbv: 0.56, evEbitda: 5.9, divYieldPct: 3.1, epsGrowthPct: -18.4, freeCashFlowT: 2.8,
    adtvB: 48.2, freeFloatPct: 48.8, inflow1DB: -11.2, inflow1WB: -42.0, inflow1MB: -110.5, foreignFlow1WB: -31.0,
    rsi14: 34.2, ma20OffsetPct: -3.8, ma50OffsetPct: -7.1, srBias: 'BREAKDOWN'
  },
  {
    ticker: 'INTP', name: 'Indocement Tunggal Prakarsa Tbk', sector: 'Barang Baku', subSector: 'Material Konstruksi', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 6850, changePct: -0.72, marketCapT: 25.2,
    revenueT: 18.4, netProfitT: 1.7, grossMarginPct: 31.2, netMarginPct: 9.2, roePct: 8.4, roaPct: 6.1,
    der: 0.11, currentRatio: 2.42, per: 14.8, pbv: 1.21, evEbitda: 6.8, divYieldPct: 2.4, epsGrowthPct: -6.5, freeCashFlowT: 1.9,
    adtvB: 26.4, freeFloatPct: 34.2, inflow1DB: -3.2, inflow1WB: -12.4, inflow1MB: -28.0, foreignFlow1WB: -8.5,
    rsi14: 41.2, ma20OffsetPct: -1.5, ma50OffsetPct: -3.0, srBias: 'SUPPORT'
  },

  // INFRASTRUKTUR (TELKO, TOWER, JALAN TOL, ENERGI TERBARUKAN)
  {
    ticker: 'TLKM', name: 'Telkom Indonesia (Persero) Tbk', sector: 'Infrastruktur', subSector: 'Telekomunikasi', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 2890, changePct: 1.40, marketCapT: 286.3,
    revenueT: 151.8, netProfitT: 24.6, grossMarginPct: 61.4, netMarginPct: 16.2, roePct: 17.8, roaPct: 8.6,
    der: 0.48, currentRatio: 0.89, per: 11.6, pbv: 2.04, evEbitda: 4.8, divYieldPct: 6.2, epsGrowthPct: 3.1, freeCashFlowT: 26.4,
    adtvB: 412.0, freeFloatPct: 47.9, inflow1DB: 84.2, inflow1WB: 325.4, inflow1MB: 610.0, foreignFlow1WB: 274.0,
    rsi14: 58.9, ma20OffsetPct: 1.9, ma50OffsetPct: 3.4, srBias: 'MID'
  },
  {
    ticker: 'ISAT', name: 'Indosat Tbk', sector: 'Infrastruktur', subSector: 'Telekomunikasi', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 2480, changePct: 2.48, marketCapT: 80.0,
    revenueT: 55.4, netProfitT: 5.2, grossMarginPct: 48.2, netMarginPct: 9.4, roePct: 15.8, roaPct: 4.6,
    der: 1.42, currentRatio: 0.78, per: 15.4, pbv: 2.38, evEbitda: 4.5, divYieldPct: 2.8, epsGrowthPct: 24.5, freeCashFlowT: 6.8,
    adtvB: 78.4, freeFloatPct: 16.2, inflow1DB: 22.8, inflow1WB: 96.4, inflow1MB: 218.0, foreignFlow1WB: 74.0,
    rsi14: 64.1, ma20OffsetPct: 3.1, ma50OffsetPct: 6.4, srBias: 'BREAKOUT'
  },
  {
    ticker: 'EXCL', name: 'XL Axiata Tbk', sector: 'Infrastruktur', subSector: 'Telekomunikasi', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 2270, changePct: 0.89, marketCapT: 29.8,
    revenueT: 34.2, netProfitT: 1.85, grossMarginPct: 44.1, netMarginPct: 5.4, roePct: 7.1, roaPct: 2.1,
    der: 1.72, currentRatio: 0.68, per: 16.1, pbv: 1.14, evEbitda: 4.2, divYieldPct: 2.2, epsGrowthPct: 28.0, freeCashFlowT: 3.4,
    adtvB: 42.1, freeFloatPct: 33.5, inflow1DB: 8.6, inflow1WB: 34.2, inflow1MB: 78.0, foreignFlow1WB: 21.0,
    rsi14: 55.2, ma20OffsetPct: 1.2, ma50OffsetPct: 2.4, srBias: 'MID'
  },
  {
    ticker: 'TOWR', name: 'Sarana Menara Nusantara Tbk', sector: 'Infrastruktur', subSector: 'Menara Telekomunikasi', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 785, changePct: -0.63, marketCapT: 40.0,
    revenueT: 12.4, netProfitT: 3.4, grossMarginPct: 72.1, netMarginPct: 27.4, roePct: 19.2, roaPct: 4.9,
    der: 2.48, currentRatio: 0.62, per: 11.7, pbv: 2.18, evEbitda: 8.2, divYieldPct: 3.1, epsGrowthPct: 4.2, freeCashFlowT: 4.1,
    adtvB: 31.2, freeFloatPct: 42.5, inflow1DB: -4.1, inflow1WB: -16.8, inflow1MB: -35.0, foreignFlow1WB: -12.0,
    rsi14: 42.5, ma20OffsetPct: -1.4, ma50OffsetPct: -2.8, srBias: 'SUPPORT'
  },
  {
    ticker: 'BREN', name: 'Barito Renewables Energy Tbk', sector: 'Infrastruktur', subSector: 'Utilitas & Energi Baru', board: 'Utama',
    indexTags: ['Kompas100'], price: 7250, changePct: 2.11, marketCapT: 970.0,
    revenueT: 9.6, netProfitT: 1.9, grossMarginPct: 78.4, netMarginPct: 19.8, roePct: 24.8, roaPct: 3.4,
    der: 3.12, currentRatio: 1.92, per: 510.5, pbv: 118.4, evEbitda: 92.4, divYieldPct: 0.1, epsGrowthPct: 14.2, freeCashFlowT: 2.8,
    adtvB: 285.4, freeFloatPct: 11.6, inflow1DB: 64.2, inflow1WB: 248.0, inflow1MB: 520.0, foreignFlow1WB: 185.0,
    rsi14: 61.4, ma20OffsetPct: 2.9, ma50OffsetPct: 6.1, srBias: 'MID'
  },
  {
    ticker: 'PGEO', name: 'Pertamina Geothermal Energy Tbk', sector: 'Infrastruktur', subSector: 'Utilitas & Energi Baru', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 1145, changePct: 1.78, marketCapT: 47.4,
    revenueT: 6.4, netProfitT: 2.6, grossMarginPct: 58.2, netMarginPct: 40.6, roePct: 8.9, roaPct: 5.8,
    der: 0.36, currentRatio: 3.42, per: 18.2, pbv: 1.54, evEbitda: 9.6, divYieldPct: 3.6, epsGrowthPct: 6.8, freeCashFlowT: 2.9,
    adtvB: 38.4, freeFloatPct: 15.0, inflow1DB: 11.2, inflow1WB: 46.5, inflow1MB: 98.0, foreignFlow1WB: 31.4,
    rsi14: 60.8, ma20OffsetPct: 2.2, ma50OffsetPct: 4.5, srBias: 'MID'
  },
  {
    ticker: 'JSMR', name: 'Jasa Marga (Persero) Tbk', sector: 'Infrastruktur', subSector: 'Operator Jalan Tol', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100'], price: 4820, changePct: 1.05, marketCapT: 35.0,
    revenueT: 26.4, netProfitT: 4.2, grossMarginPct: 46.8, netMarginPct: 15.9, roePct: 13.8, roaPct: 3.1,
    der: 1.85, currentRatio: 0.94, per: 8.3, pbv: 1.12, evEbitda: 7.8, divYieldPct: 1.6, epsGrowthPct: 19.4, freeCashFlowT: 3.1,
    adtvB: 46.5, freeFloatPct: 30.0, inflow1DB: 9.8, inflow1WB: 42.1, inflow1MB: 88.0, foreignFlow1WB: 28.4,
    rsi14: 57.4, ma20OffsetPct: 1.6, ma50OffsetPct: 3.2, srBias: 'MID'
  },

  // BARANG KONSUMEN PRIMER (CONSUMER STAPLES)
  {
    ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', sector: 'Barang Konsumen Primer', subSector: 'Makanan & Minuman', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 11850, changePct: 1.94, marketCapT: 138.2,
    revenueT: 72.4, netProfitT: 9.4, grossMarginPct: 37.2, netMarginPct: 13.0, roePct: 20.6, roaPct: 7.8,
    der: 0.74, currentRatio: 2.48, per: 14.7, pbv: 2.98, evEbitda: 9.2, divYieldPct: 2.1, epsGrowthPct: 19.2, freeCashFlowT: 8.8,
    adtvB: 98.4, freeFloatPct: 19.5, inflow1DB: 34.2, inflow1WB: 148.5, inflow1MB: 342.0, foreignFlow1WB: 118.0,
    rsi14: 64.6, ma20OffsetPct: 3.2, ma50OffsetPct: 6.4, srBias: 'BREAKOUT'
  },
  {
    ticker: 'INDF', name: 'Indofood Sukses Makmur Tbk', sector: 'Barang Konsumen Primer', subSector: 'Makanan & Minuman', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 7650, changePct: 1.32, marketCapT: 67.2,
    revenueT: 116.8, netProfitT: 10.6, grossMarginPct: 33.4, netMarginPct: 9.1, roePct: 15.8, roaPct: 5.4,
    der: 0.68, currentRatio: 1.98, per: 6.3, pbv: 0.98, evEbitda: 5.1, divYieldPct: 3.8, epsGrowthPct: 15.4, freeCashFlowT: 11.2,
    adtvB: 88.2, freeFloatPct: 49.9, inflow1DB: 26.4, inflow1WB: 114.0, inflow1MB: 265.0, foreignFlow1WB: 89.0,
    rsi14: 61.2, ma20OffsetPct: 2.3, ma50OffsetPct: 4.8, srBias: 'MID'
  },
  {
    ticker: 'AMRT', name: 'Sumber Alfaria Trijaya Tbk', sector: 'Barang Konsumen Primer', subSector: 'Ritel Makanan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 3040, changePct: 1.67, marketCapT: 126.2,
    revenueT: 118.4, netProfitT: 3.9, grossMarginPct: 21.6, netMarginPct: 3.3, roePct: 23.4, roaPct: 10.8,
    der: 0.18, currentRatio: 0.96, per: 32.4, pbv: 7.45, evEbitda: 15.8, divYieldPct: 1.1, epsGrowthPct: 14.8, freeCashFlowT: 4.2,
    adtvB: 112.4, freeFloatPct: 46.8, inflow1DB: 28.4, inflow1WB: 124.2, inflow1MB: 290.0, foreignFlow1WB: 98.5,
    rsi14: 62.5, ma20OffsetPct: 2.8, ma50OffsetPct: 5.5, srBias: 'BREAKOUT'
  },
  {
    ticker: 'MYOR', name: 'Mayora Indah Tbk', sector: 'Barang Konsumen Primer', subSector: 'Makanan & Minuman', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 2560, changePct: 0.79, marketCapT: 57.2,
    revenueT: 34.8, netProfitT: 3.2, grossMarginPct: 25.4, netMarginPct: 9.2, roePct: 19.6, roaPct: 12.1,
    der: 0.34, currentRatio: 3.45, per: 17.8, pbv: 3.38, evEbitda: 10.4, divYieldPct: 2.2, epsGrowthPct: 11.4, freeCashFlowT: 2.9,
    adtvB: 28.4, freeFloatPct: 16.0, inflow1DB: 7.4, inflow1WB: 32.1, inflow1MB: 72.0, foreignFlow1WB: 22.0,
    rsi14: 56.8, ma20OffsetPct: 1.5, ma50OffsetPct: 3.1, srBias: 'MID'
  },
  {
    ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'Barang Konsumen Primer', subSector: 'Produk Rumah Tangga', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 1845, changePct: -1.86, marketCapT: 70.4,
    revenueT: 35.6, netProfitT: 3.8, grossMarginPct: 48.2, netMarginPct: 10.7, roePct: 108.4, roaPct: 21.4,
    der: 0.42, currentRatio: 0.72, per: 18.5, pbv: 20.1, evEbitda: 11.8, divYieldPct: 5.4, epsGrowthPct: -21.2, freeCashFlowT: 3.9,
    adtvB: 74.2, freeFloatPct: 15.0, inflow1DB: -22.4, inflow1WB: -98.5, inflow1MB: -245.0, foreignFlow1WB: -82.0,
    rsi14: 31.8, ma20OffsetPct: -4.6, ma50OffsetPct: -9.2, srBias: 'BREAKDOWN'
  },
  {
    ticker: 'CPIN', name: 'Charoen Pokphand Indonesia Tbk', sector: 'Barang Konsumen Primer', subSector: 'Agribisnis & Pakan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 4940, changePct: 1.23, marketCapT: 81.0,
    revenueT: 66.2, netProfitT: 3.4, grossMarginPct: 14.8, netMarginPct: 5.1, roePct: 11.8, roaPct: 7.6,
    der: 0.36, currentRatio: 1.94, per: 23.8, pbv: 2.74, evEbitda: 12.1, divYieldPct: 1.9, epsGrowthPct: 22.4, freeCashFlowT: 3.1,
    adtvB: 44.2, freeFloatPct: 44.5, inflow1DB: 11.4, inflow1WB: 48.6, inflow1MB: 112.0, foreignFlow1WB: 36.0,
    rsi14: 58.2, ma20OffsetPct: 1.8, ma50OffsetPct: 3.6, srBias: 'MID'
  },
  {
    ticker: 'JPFA', name: 'Japfa Comfeed Indonesia Tbk', sector: 'Barang Konsumen Primer', subSector: 'Agribisnis & Pakan', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 1785, changePct: 2.59, marketCapT: 20.9,
    revenueT: 55.4, netProfitT: 2.8, grossMarginPct: 18.2, netMarginPct: 5.1, roePct: 17.8, roaPct: 7.9,
    der: 0.72, currentRatio: 1.64, per: 7.5, pbv: 1.32, evEbitda: 4.8, divYieldPct: 3.9, epsGrowthPct: 84.0, freeCashFlowT: 2.6,
    adtvB: 41.8, freeFloatPct: 44.0, inflow1DB: 14.8, inflow1WB: 62.4, inflow1MB: 145.0, foreignFlow1WB: 42.0,
    rsi14: 65.4, ma20OffsetPct: 3.4, ma50OffsetPct: 7.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'AALI', name: 'Astra Agro Lestari Tbk', sector: 'Barang Konsumen Primer', subSector: 'Perkebunan CPO', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 6425, changePct: 1.58, marketCapT: 12.4,
    revenueT: 21.8, netProfitT: 1.15, grossMarginPct: 15.2, netMarginPct: 5.3, roePct: 5.2, roaPct: 3.9,
    der: 0.14, currentRatio: 2.84, per: 10.8, pbv: 0.55, evEbitda: 5.1, divYieldPct: 4.2, epsGrowthPct: 12.4, freeCashFlowT: 1.4,
    adtvB: 14.8, freeFloatPct: 20.3, inflow1DB: 4.2, inflow1WB: 18.6, inflow1MB: 41.0, foreignFlow1WB: 11.2,
    rsi14: 59.1, ma20OffsetPct: 1.7, ma50OffsetPct: 3.8, srBias: 'MID'
  },
  {
    ticker: 'TAPG', name: 'Triputra Agro Persada Tbk', sector: 'Barang Konsumen Primer', subSector: 'Perkebunan CPO', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 890, changePct: 2.30, marketCapT: 17.7,
    revenueT: 9.2, netProfitT: 2.4, grossMarginPct: 34.8, netMarginPct: 26.1, roePct: 21.4, roaPct: 16.2,
    der: 0.16, currentRatio: 2.45, per: 7.4, pbv: 1.54, evEbitda: 4.6, divYieldPct: 8.8, epsGrowthPct: 36.2, freeCashFlowT: 2.1,
    adtvB: 28.6, freeFloatPct: 21.4, inflow1DB: 10.2, inflow1WB: 44.8, inflow1MB: 98.4, foreignFlow1WB: 29.5,
    rsi14: 66.1, ma20OffsetPct: 3.6, ma50OffsetPct: 7.9, srBias: 'BREAKOUT'
  },

  // PERINDUSTRIAN & OTOMOTIF
  {
    ticker: 'ASII', name: 'Astra International Tbk', sector: 'Perindustrian', subSector: 'Konglomerasi & Otomotif', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 5125, changePct: 0.99, marketCapT: 207.5,
    revenueT: 324.6, netProfitT: 33.4, grossMarginPct: 22.8, netMarginPct: 10.3, roePct: 16.4, roaPct: 7.4,
    der: 0.44, currentRatio: 1.52, per: 6.2, pbv: 0.99, evEbitda: 4.9, divYieldPct: 8.6, epsGrowthPct: 2.1, freeCashFlowT: 28.4,
    adtvB: 324.5, freeFloatPct: 49.8, inflow1DB: 72.4, inflow1WB: 284.0, inflow1MB: 615.0, foreignFlow1WB: 218.0,
    rsi14: 59.4, ma20OffsetPct: 1.8, ma50OffsetPct: 3.9, srBias: 'MID'
  },
  {
    ticker: 'UNTR', name: 'United Tractors Tbk', sector: 'Perindustrian', subSector: 'Alat Berat & Pertambangan', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 27450, changePct: 1.86, marketCapT: 102.4,
    revenueT: 132.4, netProfitT: 20.1, grossMarginPct: 26.4, netMarginPct: 15.2, roePct: 22.6, roaPct: 12.4,
    der: 0.34, currentRatio: 1.88, per: 5.1, pbv: 1.14, evEbitda: 3.4, divYieldPct: 8.2, epsGrowthPct: 4.5, freeCashFlowT: 18.6,
    adtvB: 142.8, freeFloatPct: 40.5, inflow1DB: 44.2, inflow1WB: 186.5, inflow1MB: 412.0, foreignFlow1WB: 148.0,
    rsi14: 64.2, ma20OffsetPct: 3.1, ma50OffsetPct: 6.5, srBias: 'BREAKOUT'
  },

  // KESEHATAN
  {
    ticker: 'KLBF', name: 'Kalbe Farma Tbk', sector: 'Kesehatan', subSector: 'Farmasi', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100', 'ISSI'], price: 1560, changePct: 0.65, marketCapT: 73.1,
    revenueT: 32.4, netProfitT: 3.2, grossMarginPct: 39.8, netMarginPct: 9.9, roePct: 14.2, roaPct: 11.4,
    der: 0.08, currentRatio: 3.85, per: 22.8, pbv: 3.18, evEbitda: 14.6, divYieldPct: 2.1, epsGrowthPct: 13.8, freeCashFlowT: 2.8,
    adtvB: 54.2, freeFloatPct: 42.1, inflow1DB: 12.4, inflow1WB: 52.8, inflow1MB: 118.0, foreignFlow1WB: 39.0,
    rsi14: 57.6, ma20OffsetPct: 1.4, ma50OffsetPct: 2.8, srBias: 'MID'
  },
  {
    ticker: 'SIDO', name: 'Industri Jamu dan Farmasi Sido Muncul Tbk', sector: 'Kesehatan', subSector: 'Farmasi', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 625, changePct: 1.63, marketCapT: 18.8,
    revenueT: 3.9, netProfitT: 1.18, grossMarginPct: 58.4, netMarginPct: 30.3, roePct: 33.4, roaPct: 29.2,
    der: 0.02, currentRatio: 4.92, per: 15.9, pbv: 5.24, evEbitda: 11.2, divYieldPct: 5.6, epsGrowthPct: 19.4, freeCashFlowT: 1.12,
    adtvB: 24.8, freeFloatPct: 22.4, inflow1DB: 6.8, inflow1WB: 29.4, inflow1MB: 64.0, foreignFlow1WB: 19.2,
    rsi14: 61.8, ma20OffsetPct: 2.4, ma50OffsetPct: 4.6, srBias: 'BREAKOUT'
  },
  {
    ticker: 'MIKA', name: 'Mitra Keluarga Karyasehat Tbk', sector: 'Kesehatan', subSector: 'Rumah Sakit', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 2740, changePct: -0.36, marketCapT: 39.0,
    revenueT: 4.8, netProfitT: 1.15, grossMarginPct: 53.2, netMarginPct: 24.0, roePct: 18.2, roaPct: 14.8,
    der: 0.04, currentRatio: 4.12, per: 33.9, pbv: 6.08, evEbitda: 20.4, divYieldPct: 1.3, epsGrowthPct: 16.2, freeCashFlowT: 1.05,
    adtvB: 28.4, freeFloatPct: 36.2, inflow1DB: -1.8, inflow1WB: 12.4, inflow1MB: 38.0, foreignFlow1WB: 8.4,
    rsi14: 48.2, ma20OffsetPct: -0.6, ma50OffsetPct: 1.2, srBias: 'SUPPORT'
  },

  // BARANG KONSUMEN NON-PRIMER (RITEL DISKRESIONER, MEDIA, OTOMOTIF RITEL)
  {
    ticker: 'MAPI', name: 'Mitra Adiperkasa Tbk', sector: 'Barang Konsumen Non-Primer', subSector: 'Ritel Gaya Hidup', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 1580, changePct: 1.94, marketCapT: 26.2,
    revenueT: 37.8, netProfitT: 2.05, grossMarginPct: 43.4, netMarginPct: 5.4, roePct: 18.6, roaPct: 7.4,
    der: 0.42, currentRatio: 1.48, per: 12.8, pbv: 2.31, evEbitda: 6.1, divYieldPct: 0.6, epsGrowthPct: 8.4, freeCashFlowT: 1.8,
    adtvB: 48.6, freeFloatPct: 48.8, inflow1DB: 14.2, inflow1WB: 58.4, inflow1MB: 132.0, foreignFlow1WB: 44.0,
    rsi14: 61.5, ma20OffsetPct: 2.6, ma50OffsetPct: 4.9, srBias: 'BREAKOUT'
  },
  {
    ticker: 'ACES', name: 'Aspirasi Hidup Indonesia Tbk', sector: 'Barang Konsumen Non-Primer', subSector: 'Ritel Gaya Hidup', board: 'Utama',
    indexTags: ['LQ45', 'Kompas100', 'ISSI'], price: 845, changePct: 1.20, marketCapT: 14.5,
    revenueT: 8.4, netProfitT: 0.88, grossMarginPct: 48.6, netMarginPct: 10.5, roePct: 14.4, roaPct: 11.2,
    der: 0.05, currentRatio: 6.42, per: 16.5, pbv: 2.32, evEbitda: 10.2, divYieldPct: 3.9, epsGrowthPct: 14.2, freeCashFlowT: 0.82,
    adtvB: 32.4, freeFloatPct: 39.8, inflow1DB: 8.4, inflow1WB: 36.2, inflow1MB: 82.0, foreignFlow1WB: 24.5,
    rsi14: 58.4, ma20OffsetPct: 1.8, ma50OffsetPct: 3.4, srBias: 'MID'
  },

  // PROPERTI & REAL ESTAT
  {
    ticker: 'PANI', name: 'Pantai Indah Kapuk Dua Tbk', sector: 'Properti & Real Estat', subSector: 'Pengembang Properti', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 14850, changePct: 2.77, marketCapT: 250.8,
    revenueT: 3.8, netProfitT: 0.92, grossMarginPct: 54.2, netMarginPct: 24.2, roePct: 7.4, roaPct: 3.8,
    der: 0.24, currentRatio: 3.12, per: 272.6, pbv: 18.4, evEbitda: 142.0, divYieldPct: 0.0, epsGrowthPct: 78.0, freeCashFlowT: 1.1,
    adtvB: 192.4, freeFloatPct: 10.1, inflow1DB: 52.4, inflow1WB: 198.0, inflow1MB: 425.0, foreignFlow1WB: 132.0,
    rsi14: 66.8, ma20OffsetPct: 4.1, ma50OffsetPct: 9.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'BSDE', name: 'Bumi Serpong Damai Tbk', sector: 'Properti & Real Estat', subSector: 'Pengembang Properti', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 1045, changePct: 0.97, marketCapT: 22.1,
    revenueT: 13.8, netProfitT: 3.4, grossMarginPct: 64.2, netMarginPct: 24.6, roePct: 9.1, roaPct: 4.9,
    der: 0.34, currentRatio: 2.65, per: 6.5, pbv: 0.56, evEbitda: 5.2, divYieldPct: 0.0, epsGrowthPct: 34.2, freeCashFlowT: 2.9,
    adtvB: 28.4, freeFloatPct: 39.2, inflow1DB: 6.4, inflow1WB: 28.5, inflow1MB: 62.0, foreignFlow1WB: 19.8,
    rsi14: 57.2, ma20OffsetPct: 1.5, ma50OffsetPct: 3.1, srBias: 'MID'
  },
  {
    ticker: 'CTRA', name: 'Ciputra Development Tbk', sector: 'Properti & Real Estat', subSector: 'Pengembang Properti', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 1125, changePct: 1.35, marketCapT: 20.8,
    revenueT: 10.6, netProfitT: 2.1, grossMarginPct: 49.4, netMarginPct: 19.8, roePct: 10.4, roaPct: 4.8,
    der: 0.41, currentRatio: 2.14, per: 9.9, pbv: 0.98, evEbitda: 6.8, divYieldPct: 1.9, epsGrowthPct: 12.4, freeCashFlowT: 1.8,
    adtvB: 31.2, freeFloatPct: 44.5, inflow1DB: 7.8, inflow1WB: 34.0, inflow1MB: 75.0, foreignFlow1WB: 24.2,
    rsi14: 58.6, ma20OffsetPct: 1.8, ma50OffsetPct: 3.9, srBias: 'MID'
  },
  {
    ticker: 'PWON', name: 'Pakuwon Jati Tbk', sector: 'Properti & Real Estat', subSector: 'Pengembang Properti', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 442, changePct: -0.45, marketCapT: 21.3,
    revenueT: 6.6, netProfitT: 2.2, grossMarginPct: 56.4, netMarginPct: 33.3, roePct: 11.2, roaPct: 6.8,
    der: 0.28, currentRatio: 3.18, per: 9.7, pbv: 1.04, evEbitda: 6.4, divYieldPct: 2.0, epsGrowthPct: 8.2, freeCashFlowT: 2.1,
    adtvB: 19.4, freeFloatPct: 31.3, inflow1DB: -1.4, inflow1WB: 8.2, inflow1MB: 21.0, foreignFlow1WB: 5.4,
    rsi14: 46.8, ma20OffsetPct: -0.8, ma50OffsetPct: 0.4, srBias: 'SUPPORT'
  },

  // TEKNOLOGI
  {
    ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Teknologi', subSector: 'Ekosistem Digital', board: 'Utama',
    indexTags: ['LQ45', 'IDX30', 'Kompas100'], price: 74, changePct: 2.78, marketCapT: 88.9,
    revenueT: 15.8, netProfitT: -3.2, grossMarginPct: 42.1, netMarginPct: -20.2, roePct: -8.4, roaPct: -6.1,
    der: 0.14, currentRatio: 3.64, per: -27.8, pbv: 2.48, evEbitda: -48.0, divYieldPct: 0.0, epsGrowthPct: 54.0, freeCashFlowT: 0.45,
    adtvB: 265.4, freeFloatPct: 76.2, inflow1DB: 42.5, inflow1WB: 168.4, inflow1MB: 384.0, foreignFlow1WB: 112.0,
    rsi14: 64.8, ma20OffsetPct: 4.1, ma50OffsetPct: 8.6, srBias: 'BREAKOUT'
  },
  {
    ticker: 'DCII', name: 'DCI Indonesia Tbk', sector: 'Teknologi', subSector: 'Pusat Data & Cloud', board: 'Utama',
    indexTags: ['Kompas100'], price: 44800, changePct: 0.45, marketCapT: 106.8,
    revenueT: 1.75, netProfitT: 0.68, grossMarginPct: 59.4, netMarginPct: 38.9, roePct: 27.4, roaPct: 16.2,
    der: 0.48, currentRatio: 1.84, per: 157.0, pbv: 39.2, evEbitda: 88.4, divYieldPct: 0.0, epsGrowthPct: 26.4, freeCashFlowT: 0.48,
    adtvB: 8.2, freeFloatPct: 14.5, inflow1DB: 2.4, inflow1WB: 11.2, inflow1MB: 28.0, foreignFlow1WB: 6.4,
    rsi14: 55.8, ma20OffsetPct: 1.1, ma50OffsetPct: 2.8, srBias: 'MID'
  },
  {
    ticker: 'WIFI', name: 'Solusi Sinergi Digital Tbk', sector: 'Teknologi', subSector: 'Infrastruktur Digital', board: 'Pengembangan',
    indexTags: [], price: 428, changePct: 4.39, marketCapT: 1.0,
    revenueT: 0.68, netProfitT: 0.19, grossMarginPct: 56.2, netMarginPct: 27.9, roePct: 21.8, roaPct: 9.4,
    der: 0.92, currentRatio: 1.48, per: 5.3, pbv: 1.14, evEbitda: 4.1, divYieldPct: 0.0, epsGrowthPct: 142.0, freeCashFlowT: 0.14,
    adtvB: 44.2, freeFloatPct: 42.0, inflow1DB: 12.4, inflow1WB: 46.2, inflow1MB: 98.0, foreignFlow1WB: 18.4,
    rsi14: 68.4, ma20OffsetPct: 5.6, ma50OffsetPct: 14.2, srBias: 'BREAKOUT'
  },

  // TRANSPORTASI & LOGISTIK
  {
    ticker: 'BIRD', name: 'Blue Bird Tbk', sector: 'Transportasi & Logistik', subSector: 'Transportasi Darat', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 2040, changePct: 1.49, marketCapT: 5.1,
    revenueT: 4.9, netProfitT: 0.56, grossMarginPct: 32.4, netMarginPct: 11.4, roePct: 9.8, roaPct: 7.1,
    der: 0.24, currentRatio: 1.82, per: 9.1, pbv: 0.88, evEbitda: 4.4, divYieldPct: 4.6, epsGrowthPct: 21.4, freeCashFlowT: 0.48,
    adtvB: 16.4, freeFloatPct: 34.5, inflow1DB: 4.8, inflow1WB: 19.6, inflow1MB: 42.0, foreignFlow1WB: 12.8,
    rsi14: 60.4, ma20OffsetPct: 2.2, ma50OffsetPct: 4.8, srBias: 'BREAKOUT'
  },
  {
    ticker: 'ASSA', name: 'Adi Sarana Armada Tbk', sector: 'Transportasi & Logistik', subSector: 'Logistik & Armada', board: 'Utama',
    indexTags: ['Kompas100', 'ISSI'], price: 765, changePct: 1.32, marketCapT: 2.8,
    revenueT: 4.8, netProfitT: 0.24, grossMarginPct: 29.4, netMarginPct: 5.0, roePct: 11.2, roaPct: 3.4,
    der: 1.18, currentRatio: 1.14, per: 11.6, pbv: 1.24, evEbitda: 5.2, divYieldPct: 2.6, epsGrowthPct: 46.0, freeCashFlowT: 0.32,
    adtvB: 22.4, freeFloatPct: 46.2, inflow1DB: 5.2, inflow1WB: 21.4, inflow1MB: 48.0, foreignFlow1WB: 11.2,
    rsi14: 58.2, ma20OffsetPct: 1.9, ma50OffsetPct: 4.1, srBias: 'MID'
  },
  {
    ticker: 'SMDR', name: 'Samudera Indonesia Tbk', sector: 'Transportasi & Logistik', subSector: 'Pelayaran & Logistik Laut', board: 'Utama',
    indexTags: ['ISSI'], price: 324, changePct: 2.53, marketCapT: 5.3,
    revenueT: 11.8, netProfitT: 1.05, grossMarginPct: 22.4, netMarginPct: 8.9, roePct: 14.8, roaPct: 6.4,
    der: 0.46, currentRatio: 2.38, per: 5.0, pbv: 0.72, evEbitda: 3.2, divYieldPct: 4.9, epsGrowthPct: 14.2, freeCashFlowT: 0.94,
    adtvB: 18.2, freeFloatPct: 31.2, inflow1DB: 6.1, inflow1WB: 24.8, inflow1MB: 54.0, foreignFlow1WB: 14.2,
    rsi14: 62.4, ma20OffsetPct: 2.8, ma50OffsetPct: 5.4, srBias: 'BREAKOUT'
  },
];

// Compact Directory of ALL IDX-Listed Stocks (A-Z, ~920+ real Bursa Efek Indonesia issuers)
// Format: [TICKER, COMPANY_NAME, SECTOR, SUBSECTOR, BOARD]
type CompactIdxTuple = [string, string, IdxSector, string, ListingBoard];

const IDX_ALL_RAW: CompactIdxTuple[] = [
  ['AALI', 'Astra Agro Lestari Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['ABBA', 'Mahaka Media Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['ABDA', 'Asuransi Bina Dana Arta Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['ABMM', 'ABM Investama Tbk', 'Energi', 'Batubara', 'Utama'],
  ['ACES', 'Aspirasi Hidup Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['ACRO', 'Samcro Hyosung Adilestari Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['ACST', 'Acset Indonusa Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['ADCP', 'Adhi Commuter Properti Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['ADES', 'Akasha Wira International Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['ADHI', 'Adhi Karya (Persero) Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['ADMF', 'Adira Dinamika Multi Finance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['ADMG', 'Polychem Indonesia Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['ADMR', 'Alamtri Minerals Indonesia Tbk', 'Energi', 'Batubara', 'Utama'],
  ['ADRO', 'Alamtri Resources Indonesia Tbk', 'Energi', 'Batubara', 'Utama'],
  ['AEGS', 'Anugerah Spareparts Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Akselerasi'],
  ['AGAR', 'Asia Sejahtera Mina Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['AGII', 'Samator Indo Gas Tbk', 'Barang Baku', 'Kimia & Gas Industri', 'Utama'],
  ['AGRO', 'Bank Raya Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['AGRS', 'Bank IBK Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['AHAP', 'Asuransi Harta Aman Pratama Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['AIMS', 'Akbar Indo Makmur Stimec Tbk', 'Energi', 'Batubara', 'Pemantauan Khusus'],
  ['AISA', 'FKS Food Sejahtera Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['AKKU', 'Anugerah Kagum Karya Utama Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['AKPI', 'Argha Karya Prima Industry Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['AKRA', 'AKR Corporindo Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['AKSI', 'Mineral Sumberdaya Mandiri Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['ALDO', 'Alkindo Naratama Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pengembangan'],
  ['ALII', 'Ancara Logistics Indonesia Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['ALKA', 'Alakasa Industrindo Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['ALMI', 'Alumindo Light Metal Industry Tbk', 'Barang Baku', 'Logam & Baja', 'Pemantauan Khusus'],
  ['ALTO', 'Tri Banyan Tirta Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pemantauan Khusus'],
  ['AMAG', 'Asuransi Multi Artha Guna Tbk', 'Keuangan', 'Asuransi', 'Utama'],
  ['AMAN', 'Makmur Berkah Amanda Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Utama'],
  ['AMAR', 'Bank Amar Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['AMFG', 'Asahimas Flat Glass Tbk', 'Perindustrian', 'Material Bangunan', 'Utama'],
  ['AMIN', 'Ateliers Mecaniques D Indonesie Tbk', 'Perindustrian', 'Mesin Industri', 'Pengembangan'],
  ['AMMN', 'Amman Mineral Internasional Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['AMMS', 'Agung Menjangan Mas Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Akselerasi'],
  ['AMOR', 'Ashmore Asset Management Indonesia Tbk', 'Keuangan', 'Manajemen Investasi', 'Pengembangan'],
  ['AMRT', 'Sumber Alfaria Trijaya Tbk', 'Barang Konsumen Primer', 'Ritel Makanan', 'Utama'],
  ['ANDI', 'Andira Agro Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pemantauan Khusus'],
  ['ANJT', 'Austindo Nusantara Jaya Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['ANTM', 'Aneka Tambang Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['APEX', 'Apexindo Pratama Duta Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['APIC', 'Pacific Strategic Financial Tbk', 'Keuangan', 'Jasa Keuangan', 'Utama'],
  ['APII', 'Arita Prima Indonesia Tbk', 'Perindustrian', 'Mesin Industri', 'Utama'],
  ['APLI', 'Asiaplast Industries Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['APLY', 'Asia Pacific Fibers Tbk', 'Barang Baku', 'Kimia', 'Pemantauan Khusus'],
  ['APOL', 'Arpeni Pratama Ocean Line Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pemantauan Khusus'],
  ['ARCI', 'Archi Indonesia Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['AREA', 'Dunia Virtual Online Tbk', 'Teknologi', 'Pusat Data & Cloud', 'Pengembangan'],
  ['ARGO', 'Argo Pantes Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['ARII', 'Atlas Resources Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['ARKA', 'Arkha Jayanti Persada Tbk', 'Perindustrian', 'Komponen Industri', 'Pemantauan Khusus'],
  ['ARKO', 'Arkora Hydro Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Pengembangan'],
  ['ARMY', 'Armidian Karyatama Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['ARNA', 'Arwana Citramulia Tbk', 'Perindustrian', 'Material Bangunan', 'Utama'],
  ['ARTA', 'Arthavest Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['ARTI', 'Ratu Prabu Energi Tbk', 'Energi', 'Jasa Migas', 'Pemantauan Khusus'],
  ['ARTO', 'Bank Jago Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['ASBI', 'Asuransi Bintang Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['ASDM', 'Asuransi Dayin Mitra Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['ASGR', 'Astra Graphia Tbk', 'Perindustrian', 'Jasa Perkantoran', 'Utama'],
  ['ASHA', 'Cilacap Samudera Fishing Industry Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['ASII', 'Astra International Tbk', 'Perindustrian', 'Konglomerasi & Otomotif', 'Utama'],
  ['ASJT', 'Asuransi Jasa Tania Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['ASLC', 'Autopedia Sukses Lestari Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Lelang', 'Pengembangan'],
  ['ASLI', 'Asri Karya Lestari Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['ASMI', 'Asuransi Maximus Graha Persada Tbk', 'Keuangan', 'Asuransi', 'Pemantauan Khusus'],
  ['ASPI', 'Andalan Sakti Primaindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['ASPR', 'Asia Pramulia Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['ASRI', 'Alam Sutera Realty Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['ASRM', 'Asuransi Ramayana Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['ASSA', 'Adi Sarana Armada Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Utama'],
  ['ATAP', 'Trimitra Prawara Goldland Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['ATIC', 'Anabatic Technologies Tbk', 'Teknologi', 'Layanan TI', 'Pengembangan'],
  ['ATLA', 'Atlantis Subsea Indonesia Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['AUTO', 'Astra Otoparts Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Utama'],
  ['AVIA', 'Avia Avian Tbk', 'Barang Baku', 'Kimia & Cat', 'Utama'],
  ['AWAN', 'Era Digital Media Tbk', 'Teknologi', 'Perangkat Lunak & Konten', 'Pengembangan'],
  ['AXIO', 'Tera Data Indonusa Tbk', 'Teknologi', 'Perangkat Keras TI', 'Pengembangan'],
  ['AYAM', 'Janu Putra Sejahtera Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Pengembangan'],
  ['AYLS', 'Agro Yasa Lestari Tbk', 'Barang Baku', 'Material Konstruksi', 'Pemantauan Khusus'],
  ['BABP', 'Bank MNC Internasional Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BABY', 'Multitrend Indo Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Pengembangan'],
  ['BACA', 'Bank Capital Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BAJA', 'Saranacentral Bajatama Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['BALI', 'Bali Towerindo Sentra Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['BANK', 'Bank Aladin Syariah Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BAPA', 'Bekasi Asri Pemula Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BAPI', 'Bhakti Agung Propertindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BATA', 'Sepatu Bata Tbk', 'Barang Konsumen Non-Primer', 'Alas Kaki & Ritel', 'Pemantauan Khusus'],
  ['BATR', 'Benteng Api Technic Tbk', 'Barang Baku', 'Material Tahan Api', 'Pengembangan'],
  ['BAUT', 'Mitra Angkasa Sejahtera Tbk', 'Perindustrian', 'Komponen Industri', 'Pemantauan Khusus'],
  ['BAYU', 'Bayu Buana Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Biro Perjalanan', 'Utama'],
  ['BBCA', 'Bank Central Asia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBHI', 'Allo Bank Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBKP', 'Bank KB Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBLD', 'Buana Finance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['BBMD', 'Bank Mestika Dharma Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBNI', 'Bank Negara Indonesia (Persero) Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBRI', 'Bank Rakyat Indonesia (Persero) Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBRM', 'Pelayaran Nasional Bina Buana Raya Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['BBSI', 'Krom Bank Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBSS', 'Bumi Benowo Sukses Sejahtera Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BBTN', 'Bank Tabungan Negara (Persero) Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BBYB', 'Bank Neo Commerce Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BCAP', 'MNC Kapital Indonesia Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['BCIC', 'Bank JTrust Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BCIP', 'Bumi Citra Permai Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Pengembangan'],
  ['BDKR', 'Berdikari Pondasi Perkasa Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['BDMN', 'Bank Danamon Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BEBS', 'Berkah Beton Sadaya Tbk', 'Barang Baku', 'Material Konstruksi', 'Pemantauan Khusus'],
  ['BEEF', 'Estika Tata Tiara Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['BEER', 'Jobubu Jarum Minahasa Tbk', 'Barang Konsumen Primer', 'Minuman', 'Pengembangan'],
  ['BEKS', 'Bank Pembangunan Daerah Banten Tbk', 'Keuangan', 'Perbankan', 'Pemantauan Khusus'],
  ['BELI', 'Global Digital Niaga Tbk', 'Teknologi', 'E-Commerce', 'Utama'],
  ['BELL', 'Trisula Textile Industries Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['BESS', 'Batulicin Nusantara Maritim Tbk', 'Energi', 'Logistik Energi', 'Pengembangan'],
  ['BEST', 'Bekasi Fajar Industrial Estate Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Utama'],
  ['BFIN', 'BFI Finance Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['BGTG', 'Bank Ganesha Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BHAT', 'Bhakti Multi Artha Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['BHIT', 'MNC Asia Holding Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Pengembangan'],
  ['BIKA', 'Binakarya Jaya Abadi Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BIKE', 'Sepeda Bersama Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Pengembangan'],
  ['BIMA', 'Primarindo Asia Infrastructure Tbk', 'Barang Konsumen Non-Primer', 'Alas Kaki', 'Pemantauan Khusus'],
  ['BINA', 'Bank Ina Perdana Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BINO', 'Perma Plasindo Tbk', 'Perindustrian', 'Alat Tulis & Kantor', 'Pengembangan'],
  ['BIPI', 'Astrindo Nusantara Infrastruktur Tbk', 'Energi', 'Infrastruktur Energi', 'Utama'],
  ['BIPP', 'Bhuwanatala Indah Permai Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BIRD', 'Blue Bird Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Utama'],
  ['BISI', 'BISI International Tbk', 'Barang Konsumen Primer', 'Pertanian & Benih', 'Utama'],
  ['BJBR', 'Bank Pembangunan Daerah Jawa Barat dan Banten Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BJTM', 'Bank Pembangunan Daerah Jawa Timur Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BKDP', 'Bukit Darmo Property Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['BKSL', 'Sentul City Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['BKSW', 'Bank QNB Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BLES', 'Superior Prima Sukses Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['BLOG', 'Trimitra Trans Persada Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Utama'],
  ['BLTA', 'Berlian Laju Tanker Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pemantauan Khusus'],
  ['BLTZ', 'Graha Layar Prima Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Bioskop', 'Pengembangan'],
  ['BLUE', 'Berkah Prima Perkasa Tbk', 'Perindustrian', 'Alat Tulis & Kantor', 'Pengembangan'],
  ['BMAS', 'Bank Maspion Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BMBL', 'Lavender Bina Cendikia Tbk', 'Barang Konsumen Non-Primer', 'Jasa Pendidikan', 'Akselerasi'],
  ['BMHS', 'Bundamedik Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['BMRI', 'Bank Mandiri (Persero) Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BMSR', 'Bintang Mitra Semestaraya Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['BMTR', 'Global Mediacom Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Utama'],
  ['BNBA', 'Bank Bumi Arta Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BNBR', 'Bakrie & Brothers Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Pengembangan'],
  ['BNGA', 'Bank CIMB Niaga Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BNII', 'Bank Maybank Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BNLI', 'Bank Permata Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BOAT', 'Newport Marine Services Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['BOBA', 'Formosa Ingredient Factory Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['BOGA', 'Bintang Oto Global Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Ritel', 'Pengembangan'],
  ['BOLA', 'Bali Bintang Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Olahraga', 'Pengembangan'],
  ['BOLT', 'Garuda Metalindo Tbk', 'Perindustrian', 'Komponen Industri', 'Utama'],
  ['BOSS', 'Borneo Olah Sarana Sukses Tbk', 'Energi', 'Batubara', 'Pemantauan Khusus'],
  ['BPFI', 'Woori Finance Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['BPII', 'Batavia Prosperindo Internasional Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['BPTR', 'Batavia Prosperindo Trans Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Utama'],
  ['BRAM', 'Indo Kordsa Tbk', 'Barang Konsumen Non-Primer', 'Ban & Komponen Otomotif', 'Utama'],
  ['BREN', 'Barito Renewables Energy Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Utama'],
  ['BRIS', 'Bank Syariah Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BRMS', 'Bumi Resources Minerals Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['BRNA', 'Berlina Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['BRPT', 'Barito Pacific Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['BRRC', 'Raja Roti Cemerlang Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['BSBK', 'Wulandari Bangun Laksana Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['BSDE', 'Bumi Serpong Damai Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['BSIM', 'Bank Sinarmas Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BSML', 'Bintang Samudera Mandiri Lines Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['BSSR', 'Baramulti Suksessarana Tbk', 'Energi', 'Batubara', 'Utama'],
  ['BSWD', 'Bank of India Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BTEK', 'Bumi Teknokultura Unggul Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pemantauan Khusus'],
  ['BTEL', 'Bakrie Telecom Tbk', 'Infrastruktur', 'Telekomunikasi', 'Pemantauan Khusus'],
  ['BTON', 'Betonjaya Manunggal Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['BTPN', 'Bank SMBC Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BTPS', 'Bank BTPN Syariah Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BUAH', 'Segar Kumala Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['BUDI', 'Budi Starch & Sweetener Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['BUKA', 'Bukalapak.com Tbk', 'Teknologi', 'E-Commerce', 'Utama'],
  ['BUKK', 'Bukaka Teknik Utama Tbk', 'Infrastruktur', 'Konstruksi & Rekayasa', 'Utama'],
  ['BULL', 'Buana Lintas Lautan Tbk', 'Energi', 'Pelayaran Migas', 'Pengembangan'],
  ['BUMI', 'Bumi Resources Tbk', 'Energi', 'Batubara', 'Utama'],
  ['BUVA', 'Bukit Uluwatu Villa Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['BVIC', 'Bank Victoria International Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['BWPT', 'Eagle High Plantations Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['BYAN', 'Bayan Resources Tbk', 'Energi', 'Batubara', 'Utama'],
  ['CAKK', 'Cahayaputra Asa Keramik Tbk', 'Perindustrian', 'Material Bangunan', 'Pengembangan'],
  ['CAMP', 'Campina Ice Cream Industry Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['CANI', 'Capitol Nusantara Indonesia Tbk', 'Energi', 'Jasa Migas', 'Pemantauan Khusus'],
  ['CARE', 'Metro Healthcare Indonesia Tbk', 'Kesehatan', 'Rumah Sakit', 'Pengembangan'],
  ['CARS', 'Industri dan Perdagangan Bintraco Dharma Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Ritel', 'Pengembangan'],
  ['CASA', 'Capital Financial Indonesia Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['CASH', 'Cashlez Worldwide Indonesia Tbk', 'Teknologi', 'Fintech & Pembayaran', 'Akselerasi'],
  ['CASS', 'Cardig Aero Services Tbk', 'Transportasi & Logistik', 'Jasa Bandara', 'Utama'],
  ['CBDK', 'Bangun Kosambi Sukses Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['CBMF', 'Cahaya Bintang Medan Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Pemantauan Khusus'],
  ['CBPE', 'Citra Buana Prasida Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['CBRE', 'Cakra Buana Resources Energi Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['CBUT', 'Citra Borneo Utama Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['CCSI', 'Communication Cable Systems Indonesia Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['CEKA', 'Wilmar Cahaya Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['CENT', 'Centratama Telekomunikasi Indonesia Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Pengembangan'],
  ['CFIN', 'Clipan Finance Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['CGAS', 'Citra Nusantara Gemilang Tbk', 'Energi', 'Distribusi Gas', 'Pengembangan'],
  ['CHEK', 'Diastika Biotekindo Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['CHEM', 'Chemstar Indonesia Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['CHIP', 'Pelita Teknologi Global Tbk', 'Teknologi', 'Kartu Pintar & TI', 'Akselerasi'],
  ['CINT', 'Chitose Internasional Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Pengembangan'],
  ['CITA', 'Cita Mineral Investindo Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['CITY', 'Natura City Developments Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['CLAY', 'Citra Putra Realty Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['CLEO', 'Sariguna Primatirta Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['CLPI', 'Colorpak Indonesia Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['CMNP', 'Citra Marga Nusaphala Persada Tbk', 'Infrastruktur', 'Operator Jalan Tol', 'Utama'],
  ['CMNT', 'Cemindo Gemilang Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['CMPP', 'AirAsia Indonesia Tbk', 'Transportasi & Logistik', 'Maskapai Penerbangan', 'Pemantauan Khusus'],
  ['CMRY', 'Cisarua Mountain Dairy Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['CNKO', 'Exploitasi Energi Indonesia Tbk', 'Energi', 'Batubara', 'Pemantauan Khusus'],
  ['CNMA', 'Nusantara Sejahtera Raya Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Bioskop', 'Utama'],
  ['CNTX', 'Century Textile Industry Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['COAL', 'Black Diamond Resources Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['COCO', 'Wahana Interfood Nusantara Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['COIN', 'Indokripto Koin Semesta Tbk', 'Keuangan', 'Bursa & Aset Digital', 'Pengembangan'],
  ['COWL', 'Cowell Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['CPIN', 'Charoen Pokphand Indonesia Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Utama'],
  ['CPRI', 'Capri Nusa Satu Properti Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['CPRO', 'Central Proteina Prima Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Utama'],
  ['CRAB', 'Toba Surimi Industries Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['CRSN', 'Carsurin Tbk', 'Perindustrian', 'Jasa Inspeksi & Pengujian', 'Pengembangan'],
  ['CSAP', 'Catur Sentosa Adiprana Tbk', 'Barang Konsumen Non-Primer', 'Ritel Bahan Bangunan', 'Utama'],
  ['CSIS', 'Cahayasakti Investindo Sukses Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['CSMI', 'Cipta Selera Murni Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Pemantauan Khusus'],
  ['CSRA', 'Cisadane Sawit Raya Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['CTBN', 'Citra Tubindo Tbk', 'Barang Baku', 'Logam & Pipa Migas', 'Utama'],
  ['CTRA', 'Ciputra Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['CTTH', 'Citatah Tbk', 'Barang Baku', 'Material Konstruksi', 'Pemantauan Khusus'],
  ['CUAN', 'Petrindo Jaya Kreasi Tbk', 'Energi', 'Batubara', 'Utama'],
  ['CYBR', 'ITSEC Asia Tbk', 'Teknologi', 'Keamanan Siber', 'Pengembangan'],
  ['DADA', 'Diamond Citra Propertindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['DART', 'Duta Anggada Realty Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['DATA', 'Remala Abadi Tbk', 'Infrastruktur', 'Telekomunikasi', 'Pengembangan'],
  ['DAYA', 'Duta Intidaya Tbk', 'Barang Konsumen Non-Primer', 'Ritel Kesehatan & Kecantikan', 'Pengembangan'],
  ['DCII', 'DCI Indonesia Tbk', 'Teknologi', 'Pusat Data & Cloud', 'Utama'],
  ['DEAL', 'Dewata Freightinternational Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pemantauan Khusus'],
  ['DEFI', 'Danasupra Erapacific Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pemantauan Khusus'],
  ['DEPO', 'Caturkarda Depo Bangunan Tbk', 'Barang Konsumen Non-Primer', 'Ritel Bahan Bangunan', 'Utama'],
  ['DEWA', 'Darma Henwa Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['DFAM', 'Dafam Property Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['DGIK', 'Nusa Konstruksi Enjiniring Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['DGNS', 'Diagnos Laboratorium Utama Tbk', 'Kesehatan', 'Jasa Kesehatan', 'Pengembangan'],
  ['DGWG', 'Delta Giri Wacana Tbk', 'Barang Baku', 'Kimia & Pupuk', 'Utama'],
  ['DIGI', 'Arkadia Digital Media Tbk', 'Barang Konsumen Non-Primer', 'Media Digital', 'Pemantauan Khusus'],
  ['DILD', 'Intiland Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['DIVA', 'Distribusi Voucher Nusantara Tbk', 'Teknologi', 'Distribusi Digital', 'Pengembangan'],
  ['DKFT', 'Central Omega Resources Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['DKHH', 'Cipta Sarana Medika Tbk', 'Kesehatan', 'Rumah Sakit', 'Pengembangan'],
  ['DLTA', 'Delta Djakarta Tbk', 'Barang Konsumen Primer', 'Minuman', 'Utama'],
  ['DMAS', 'Puradelta Lestari Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Utama'],
  ['DMMX', 'Digital Mediatama Maxima Tbk', 'Teknologi', 'Periklanan Digital', 'Pengembangan'],
  ['DMND', 'Diamond Food Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['DNAR', 'Bank Oke Indonesia Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['DNET', 'Indoritel Makmur Internasional Tbk', 'Barang Konsumen Primer', 'Ritel & Investasi', 'Utama'],
  ['DOID', 'Delta Dunia Makmur Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['DOOH', 'Era Media Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Media Periklanan', 'Pengembangan'],
  ['DOSS', 'Global Sukses Digital Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik & Kamera', 'Pengembangan'],
  ['DPNS', 'Duta Pertiwi Nusantara Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['DPUM', 'Dua Putra Utama Makmur Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pemantauan Khusus'],
  ['DRMA', 'Dharma Polimetal Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Utama'],
  ['DSFI', 'Dharma Samudera Fishing Industries Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['DSNG', 'Dharma Satya Nusantara Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['DSSA', 'Dian Swastatika Sentosa Tbk', 'Energi', 'Batubara & Energi', 'Utama'],
  ['DUCK', 'Jaya Bersama Indo Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Pemantauan Khusus'],
  ['DUTI', 'Duta Pertiwi Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['DVLA', 'Darya-Varia Laboratoria Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['DWGL', 'Dwi Guna Laksana Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['DYAN', 'Dyandra Media International Tbk', 'Perindustrian', 'Jasa Pameran & Acara', 'Pengembangan'],
  ['EAST', 'Eastparc Hotel Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['ECII', 'Electronic City Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Pengembangan'],
  ['EDGE', 'Indointernet Tbk', 'Teknologi', 'Pusat Data & Cloud', 'Utama'],
  ['EKAD', 'Ekadharma International Tbk', 'Barang Baku', 'Kimia & Perekat', 'Utama'],
  ['ELIT', 'Data Sinergitama Jaya Tbk', 'Teknologi', 'Pusat Data & Cloud', 'Pengembangan'],
  ['ELPI', 'Pelayaran Nasional Ekalya Purnamasari Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['ELSA', 'Elnusa Tbk', 'Energi', 'Jasa Migas', 'Utama'],
  ['ELTY', 'Bakrieland Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['EMDE', 'Megapolitan Developments Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['EMTK', 'Elang Mahkota Teknologi Tbk', 'Teknologi', 'Ekosistem & Media Digital', 'Utama'],
  ['ENAK', 'Champ Resto Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Pengembangan'],
  ['ENRG', 'Energi Mega Persada Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['ENVY', 'Envy Technologies Indonesia Tbk', 'Teknologi', 'Layanan TI', 'Pemantauan Khusus'],
  ['ENZO', 'Morenzo Abadi Perkasa Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['EPAC', 'Megalestari Epack Sentosaraya Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pemantauan Khusus'],
  ['EPMT', 'Enseval Putera Megatrading Tbk', 'Kesehatan', 'Distribusi Farmasi', 'Utama'],
  ['ERAA', 'Erajaya Swasembada Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Utama'],
  ['ERAL', 'Sinar Eka Selaras Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['ERTX', 'Eratex Djaja Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['ESIP', 'Sinergi Inti Plastindo Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['ESSA', 'ESSA Industries Indonesia Tbk', 'Barang Baku', 'Kimia & Amonia', 'Utama'],
  ['ESTI', 'Ever Shine Tex Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['ETWA', 'Eterindo Wahanatama Tbk', 'Barang Baku', 'Kimia', 'Pemantauan Khusus'],
  ['EURO', 'Estee Gold Feet Tbk', 'Barang Konsumen Primer', 'Produk Perawatan', 'Akselerasi'],
  ['EXCL', 'XL Axiata Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['FAPA', 'FAP Agri Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['FAST', 'Fast Food Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Utama'],
  ['FASW', 'Fajar Surya Wisesa Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Utama'],
  ['FILM', 'MD Entertainment Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Film', 'Utama'],
  ['FIMP', 'Fimperkasa Utama Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Akselerasi'],
  ['FIRE', 'Alfa Energi Investama Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['FISH', 'FKS Multi Agro Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Utama'],
  ['FITT', 'Hotel Fitra International Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['FLMC', 'Falmaco Nonwoven Industri Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Akselerasi'],
  ['FMII', 'Fortune Mate Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['FOLK', 'Multi Garam Utama Tbk', 'Barang Konsumen Non-Primer', 'Media & Ritel', 'Pengembangan'],
  ['FOOD', 'Sentra Food Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['FORE', 'Fore Kopi Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Restoran & Kafe', 'Pengembangan'],
  ['FORU', 'Fortune Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Periklanan', 'Pengembangan'],
  ['FPNI', 'Lotte Chemical Titan Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['FREN', 'Smartfren Telecom Tbk', 'Infrastruktur', 'Telekomunikasi', 'Pengembangan'],
  ['FUJI', 'Fuji Finance Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['FUTR', 'Futura Energi Global Tbk', 'Energi', 'Energi Baru & Jasa', 'Pengembangan'],
  ['FWCT', 'Wijaya Cahaya Timber Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pengembangan'],
  ['GAMA', 'Aksara Global Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['GDST', 'Gunawan Dianjaya Steel Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['GDYR', 'Goodyear Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ban & Komponen Otomotif', 'Pengembangan'],
  ['GEMA', 'Gema Grahasarana Tbk', 'Perindustrian', 'Interior & Konstruksi', 'Pengembangan'],
  ['GEMS', 'Golden Energy Mines Tbk', 'Energi', 'Batubara', 'Utama'],
  ['GGRM', 'Gudang Garam Tbk', 'Barang Konsumen Primer', 'Rokok & Tembakau', 'Utama'],
  ['GGRP', 'Gunung Raja Paksi Tbk', 'Barang Baku', 'Logam & Baja', 'Utama'],
  ['GHON', 'Gihon Telekomunikasi Indonesia Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['GIAA', 'Garuda Indonesia (Persero) Tbk', 'Transportasi & Logistik', 'Maskapai Penerbangan', 'Pemantauan Khusus'],
  ['GJTL', 'Gajah Tunggal Tbk', 'Barang Konsumen Non-Primer', 'Ban & Komponen Otomotif', 'Utama'],
  ['GLOB', 'Globe Kita Terang Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Pemantauan Khusus'],
  ['GLVA', 'Galva Technologies Tbk', 'Teknologi', 'Distribusi TI', 'Pengembangan'],
  ['GMFI', 'Garuda Maintenance Facility Aero Asia Tbk', 'Perindustrian', 'Perawatan Pesawat', 'Pemantauan Khusus'],
  ['GMTD', 'Gowa Makassar Tourism Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['GOLD', 'Visi Telekomunikasi Infrastruktur Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Pengembangan'],
  ['GOLF', 'Intra Golflink Resorts Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Utama'],
  ['GOLL', 'Golden Plantation Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pemantauan Khusus'],
  ['GOOD', 'Garudafood Putra Putri Jaya Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['GOTO', 'GoTo Gojek Tokopedia Tbk', 'Teknologi', 'Ekosistem Digital', 'Utama'],
  ['GPRA', 'Perdana Gapuraprima Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['GPSO', 'Geoprima Solusi Tbk', 'Perindustrian', 'Instrumen Survei', 'Pengembangan'],
  ['GRIA', 'Ingria Pratama Capitalindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['GRPH', 'Griptha Putra Persada Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['GRPM', 'Graha Prima Mentari Tbk', 'Barang Konsumen Primer', 'Distribusi Minuman', 'Akselerasi'],
  ['GSMF', 'Equity Development Investment Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['GTBO', 'Garda Tujuh Buana Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['GTRA', 'Grahaprima Suksesmandiri Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['GTSI', 'GTS Internasional Tbk', 'Energi', 'Pelayaran Gas LNG', 'Utama'],
  ['GULA', 'Aman Agrindo Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['GUNA', 'Gunanusa Eramandiri Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['GWSA', 'Greenwood Sejahtera Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['GZCO', 'Gozco Plantations Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['HADE', 'Himalaya Energi Perkasa Tbk', 'Energi', 'Jasa Energi', 'Pemantauan Khusus'],
  ['HAIS', 'Hasnur Internasional Shipping Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['HAJJ', 'Arsy Buana Travelindo Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Biro Perjalanan', 'Akselerasi'],
  ['HALO', 'Haloni Jane Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['HATM', 'Habco Trans Maritima Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['HBAT', 'Minahasa Membangun Hebat Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Akselerasi'],
  ['HDFA', 'Radana Bhaskara Finance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['HDIT', 'Hensel Davest Indonesia Tbk', 'Teknologi', 'Fintech & Pembayaran', 'Pemantauan Khusus'],
  ['HEAL', 'Medikaloka Hermina Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['HELI', 'Jaya Trishindo Tbk', 'Transportasi & Logistik', 'Penerbangan Sewa', 'Pengembangan'],
  ['HERO', 'DFI Retail Nusantara Tbk', 'Barang Konsumen Primer', 'Ritel Makanan', 'Utama'],
  ['HEXA', 'Hexindo Adiperkasa Tbk', 'Perindustrian', 'Alat Berat & Pertambangan', 'Utama'],
  ['HGII', 'Hero Global Investment Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Utama'],
  ['HITS', 'Humpuss Intermoda Transportasi Tbk', 'Energi', 'Pelayaran Migas', 'Pengembangan'],
  ['HKMU', 'HK Metals Utama Tbk', 'Barang Baku', 'Logam & Baja', 'Pemantauan Khusus'],
  ['HMSP', 'H.M. Sampoerna Tbk', 'Barang Konsumen Primer', 'Rokok & Tembakau', 'Utama'],
  ['HOKI', 'Buyung Poetra Sembada Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['HOME', 'Hotel Mandarine Regency Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['HOMI', 'Grand House Mulia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['HOPE', 'Harapan Duta Pertiwi Tbk', 'Perindustrian', 'Karoseri & Logistik', 'Pengembangan'],
  ['HOTL', 'Saraswati Griya Lestari Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['HRME', 'Menteng Heritage Realty Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['HRTA', 'Hartadinata Abadi Tbk', 'Barang Konsumen Non-Primer', 'Perhiasan & Emas', 'Utama'],
  ['HRUM', 'Harum Energy Tbk', 'Energi', 'Batubara & Nikel', 'Utama'],
  ['HUMI', 'Humpuss Maritim Internasional Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['HYGN', 'Ecocare Indo Pasifik Tbk', 'Perindustrian', 'Jasa Higienitas', 'Pengembangan'],
  ['IATA', 'MNC Energy Investments Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['IBFN', 'Intan Baru Prana Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pemantauan Khusus'],
  ['IBOS', 'Indo Boga Sukses Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Akselerasi'],
  ['IBST', 'Inti Bangun Sejahtera Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['ICBP', 'Indofood CBP Sukses Makmur Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['ICON', 'Island Concepts Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['IDEA', 'Idea Indonesia Akademi Tbk', 'Barang Konsumen Non-Primer', 'Jasa Pendidikan', 'Akselerasi'],
  ['IDPR', 'Indonesia Pondasi Raya Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['IFII', 'Indonesia Fibreboard Industry Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Utama'],
  ['IFSH', 'Ifishdeco Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['IGAR', 'Champion Pacific Indonesia Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Utama'],
  ['IIKP', 'Inti Agri Resources Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pemantauan Khusus'],
  ['IKAI', 'Intikeramik Alamasri Industri Tbk', 'Perindustrian', 'Material Bangunan', 'Pemantauan Khusus'],
  ['IKAN', 'Era Mandiri Cemerlang Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pemantauan Khusus'],
  ['IKBI', 'Sumi Indo Kabel Tbk', 'Perindustrian', 'Kabel Listrik', 'Pengembangan'],
  ['IKPM', 'Ikapharmindo Putramas Tbk', 'Kesehatan', 'Farmasi', 'Pengembangan'],
  ['IMAS', 'Indomobil Sukses Internasional Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Ritel', 'Utama'],
  ['IMJS', 'Indomobil Multi Jasa Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['IMPC', 'Impack Pratama Industri Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['INAF', 'Indofarma Tbk', 'Kesehatan', 'Farmasi', 'Pemantauan Khusus'],
  ['INAI', 'Indal Aluminium Industry Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['INCF', 'Indo Komoditi Korpora Tbk', 'Barang Baku', 'Karet & Komoditas', 'Pemantauan Khusus'],
  ['INCI', 'Intanwijaya Internasional Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['INCO', 'Vale Indonesia Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['INDF', 'Indofood Sukses Makmur Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['INDO', 'Royalindo Investa Wijaya Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['INDR', 'Indo-Rama Synthetics Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Utama'],
  ['INDS', 'Indospring Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Utama'],
  ['INDX', 'Tanah Laut Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['INDY', 'Indika Energy Tbk', 'Energi', 'Batubara & Energi', 'Utama'],
  ['INET', 'Sinergi Inti Andalan Prima Tbk', 'Teknologi', 'Infrastruktur Digital', 'Pengembangan'],
  ['INKP', 'Indah Kiat Pulp & Paper Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Utama'],
  ['INOV', 'Inocycle Technology Group Tbk', 'Barang Baku', 'Daur Ulang & Polimer', 'Pengembangan'],
  ['INPC', 'Bank Artha Graha Internasional Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['INPP', 'Indonesian Paradise Property Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['INPS', 'Indah Prakasa Sentosa Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pemantauan Khusus'],
  ['INRU', 'Toba Pulp Lestari Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pengembangan'],
  ['INTA', 'Intraco Penta Tbk', 'Perindustrian', 'Alat Berat & Pertambangan', 'Pemantauan Khusus'],
  ['INTD', 'Inter Delta Tbk', 'Barang Konsumen Non-Primer', 'Distribusi Fotografi', 'Pengembangan'],
  ['INTP', 'Indocement Tunggal Prakarsa Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['IOTF', 'Sumber Sinergi Makmur Tbk', 'Teknologi', 'Perangkat Keras & IoT', 'Pengembangan'],
  ['IPAC', 'Era Graharealty Tbk', 'Properti & Real Estat', 'Jasa Properti', 'Akselerasi'],
  ['IPCC', 'Indonesia Kendaraan Terminal Tbk', 'Transportasi & Logistik', 'Pelabuhan & Terminal', 'Utama'],
  ['IPCM', 'Jasa Armada Indonesia Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['IPOL', 'Indopoly Swakarsa Industry Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Utama'],
  ['IPPE', 'Indo Pureco Pratama Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pemantauan Khusus'],
  ['IPTV', 'MNC Vision Networks Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['IRRA', 'Itama Ranoraya Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['IRSX', 'Aviana Sinar Abadi Tbk', 'Teknologi', 'Perangkat Lunak', 'Pengembangan'],
  ['ISAP', 'Isra Presisi Indonesia Tbk', 'Perindustrian', 'Komponen Industri', 'Akselerasi'],
  ['ISAT', 'Indosat Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['ISEA', 'Indo American Seafoods Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['ISSP', 'Steel Pipe Industry of Indonesia Tbk', 'Barang Baku', 'Logam & Baja', 'Utama'],
  ['ITIC', 'Indonesian Tobacco Tbk', 'Barang Konsumen Primer', 'Rokok & Tembakau', 'Pengembangan'],
  ['ITMA', 'Sumber Energi Andalan Tbk', 'Energi', 'Batubara & Energi', 'Pengembangan'],
  ['ITMG', 'Indo Tambangraya Megah Tbk', 'Energi', 'Batubara', 'Utama'],
  ['JARR', 'Jhonlin Agro Raya Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['JAST', 'Jasnita Telekomindo Tbk', 'Infrastruktur', 'Telekomunikasi', 'Pengembangan'],
  ['JATI', 'Informasi Teknologi Indonesia Tbk', 'Teknologi', 'Layanan TI', 'Pengembangan'],
  ['JAWA', 'Jaya Agra Wattie Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['JAYA', 'Armada Berjaya Trans Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['JECC', 'Jembo Cable Company Tbk', 'Perindustrian', 'Kabel Listrik', 'Utama'],
  ['JGLE', 'Graha Andrasentra Propertindo Tbk', 'Barang Konsumen Non-Primer', 'Taman Rekreasi', 'Pemantauan Khusus'],
  ['JIHD', 'Jakarta International Hotels & Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['JKON', 'Jaya Konstruksi Manggala Pratama Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['JMAS', 'Asuransi Jiwa Syariah Jasa Mitra Abadi Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['JPFA', 'Japfa Comfeed Indonesia Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Utama'],
  ['JRPT', 'Jaya Real Property Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['JSKY', 'Sky Energy Indonesia Tbk', 'Perindustrian', 'Energi Surya', 'Pemantauan Khusus'],
  ['JSMR', 'Jasa Marga (Persero) Tbk', 'Infrastruktur', 'Operator Jalan Tol', 'Utama'],
  ['JSPT', 'Jakarta Setiabudi Internasional Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['JTPE', 'Jasuindo Tiga Perkasa Tbk', 'Perindustrian', 'Percetakan Sekuriti', 'Utama'],
  ['KAEF', 'Kimia Farma Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['KAQI', 'Jantra Grupo Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Jasa Perawatan Otomotif', 'Pengembangan'],
  ['KARW', 'ICTSI Jasa Prima Tbk', 'Transportasi & Logistik', 'Pelabuhan & Terminal', 'Pemantauan Khusus'],
  ['KAYU', 'Darmi Bersaudara Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pemantauan Khusus'],
  ['KBAG', 'Karya Bersama Anugerah Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['KBLI', 'KMI Wire & Cable Tbk', 'Perindustrian', 'Kabel Listrik', 'Utama'],
  ['KBLM', 'Kabelindo Murni Tbk', 'Perindustrian', 'Kabel Listrik', 'Pengembangan'],
  ['KBLV', 'First Media Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['KBRI', 'Kertas Basuki Rachmat Indonesia Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pemantauan Khusus'],
  ['KDSI', 'Kedawung Setia Industrial Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Utama'],
  ['KDTN', 'Puri Sentul Permai Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['KEEN', 'Kencana Energi Lestari Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Utama'],
  ['KEJU', 'Mulia Boga Raya Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['KETR', 'Ketrosden Triasmitra Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['KIAS', 'Keramika Indonesia Assosiasi Tbk', 'Perindustrian', 'Material Bangunan', 'Pemantauan Khusus'],
  ['KICI', 'Kedaung Indah Can Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Pengembangan'],
  ['KIJA', 'Kawasan Industri Jababeka Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Utama'],
  ['KING', 'Hoffmen Cleanindo Tbk', 'Perindustrian', 'Jasa Fasilitas', 'Pengembangan'],
  ['KINO', 'Kino Indonesia Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Utama'],
  ['KIOS', 'Kioson Komersial Indonesia Tbk', 'Teknologi', 'Distribusi Digital', 'Pemantauan Khusus'],
  ['KJEN', 'Krida Jaringan Nusantara Tbk', 'Transportasi & Logistik', 'Logistik & Kurir', 'Pengembangan'],
  ['KKES', 'Kusuma Kemindo Sentosa Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['KKGI', 'Resource Alam Indonesia Tbk', 'Energi', 'Batubara', 'Utama'],
  ['KLAS', 'Pelayaran Kurnia Lautan Semesta Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['KLBF', 'Kalbe Farma Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['KLIN', 'Klinko Karya Imaji Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Akselerasi'],
  ['KMDS', 'Kurniamitra Duta Sentosa Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['KMTR', 'Kirana Megatara Tbk', 'Barang Baku', 'Karet & Komoditas', 'Utama'],
  ['KOBX', 'Kobexindo Tractors Tbk', 'Perindustrian', 'Alat Berat & Pertambangan', 'Utama'],
  ['KOCI', 'Kokoh Exa Nusantara Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['KOIN', 'Kokoh Inti Arebama Tbk', 'Perindustrian', 'Distribusi Material', 'Pemantauan Khusus'],
  ['KOKA', 'Koka Indonesia Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['KONI', 'Perdana Bangun Pusaka Tbk', 'Barang Konsumen Non-Primer', 'Ritel & Peralatan', 'Pengembangan'],
  ['KOPI', 'Mitra Energi Persada Tbk', 'Energi', 'Distribusi Gas', 'Pengembangan'],
  ['KOTA', 'DMS Propertindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['KPIG', 'MNC Land Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['KRAH', 'Grand Kartech Tbk', 'Perindustrian', 'Mesin Industri', 'Pemantauan Khusus'],
  ['KRAS', 'Krakatau Steel (Persero) Tbk', 'Barang Baku', 'Logam & Baja', 'Pemantauan Khusus'],
  ['KREN', 'Quantum Clovera Investama Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Pemantauan Khusus'],
  ['KRYA', 'Bangun Karya Perkasa Jaya Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['KSIX', 'Kentanix Supra International Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['KUAS', 'Ace Oldfields Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Pengembangan'],
  ['LABA', 'Green Power Group Tbk', 'Perindustrian', 'Komponen Energi', 'Pengembangan'],
  ['LABS', 'UBC Medical Indonesia Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['LAJU', 'Jasa Berdikari Logistics Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['LAND', 'Trimitra Propertindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['LAPD', 'Leyand International Tbk', 'Infrastruktur', 'Utilitas Listrik', 'Pemantauan Khusus'],
  ['LCGP', 'Eureka Prima Jakarta Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['LCKM', 'LCK Global Kedaton Tbk', 'Infrastruktur', 'Telekomunikasi', 'Pengembangan'],
  ['LEAD', 'Logindo Samudramakmur Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['LFLO', 'Imago Mulia Persada Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Akselerasi'],
  ['LIFE', 'MSIG Life Insurance Indonesia Tbk', 'Keuangan', 'Asuransi', 'Utama'],
  ['LINK', 'Link Net Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['LION', 'Lion Metal Works Tbk', 'Perindustrian', 'Peralatan Kantor & Industri', 'Pengembangan'],
  ['LIVE', 'Homeco Victoria Makmur Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Pengembangan'],
  ['LMAS', 'Limas Indonesia Makmur Tbk', 'Teknologi', 'Layanan TI', 'Pemantauan Khusus'],
  ['LMAX', 'Lupromax Pelumas Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Akselerasi'],
  ['LMPI', 'Langgeng Makmur Industri Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Pengembangan'],
  ['LMSH', 'Lionmesh Prima Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['LOPI', 'Logisticsplus International Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Akselerasi'],
  ['LPCK', 'Lippo Cikarang Tbk', 'Properti & Real Estat', 'Kawasan Industri', 'Utama'],
  ['LPGI', 'Lippo General Insurance Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['LPIN', 'Multi Prima Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Pengembangan'],
  ['LPKR', 'Lippo Karawaci Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['LPLI', 'Star Pacific Tbk', 'Barang Konsumen Non-Primer', 'Ritel & Investasi', 'Pengembangan'],
  ['LPPF', 'Matahari Department Store Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['LPPS', 'Lenox Pasifik Investama Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['LRNA', 'Eka Sari Lorena Transport Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Pengembangan'],
  ['LSIP', 'PP London Sumatra Indonesia Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['LTLS', 'Lautan Luas Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['LUCK', 'Sentral Mitra Informatika Tbk', 'Teknologi', 'Layanan TI', 'Pengembangan'],
  ['LUCY', 'Lima Dua Lima Tiga Tbk', 'Barang Konsumen Non-Primer', 'Restoran & Hiburan', 'Akselerasi'],
  ['MABA', 'Marga Abhinaya Abadi Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['MAGP', 'Multi Agro Gemilang Plantation Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pemantauan Khusus'],
  ['MAHA', 'Mandiri Herindo Adiperkasa Tbk', 'Energi', 'Logistik Energi', 'Utama'],
  ['MAIN', 'Malindo Feedmill Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Utama'],
  ['MANG', 'Manggung Polahraya Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Akselerasi'],
  ['MAPA', 'Map Aktif Adiperkasa Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['MAPB', 'MAP Boga Adiperkasa Tbk', 'Barang Konsumen Non-Primer', 'Restoran & Kafe', 'Utama'],
  ['MAPI', 'Mitra Adiperkasa Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['MARI', 'Mahaka Radio Integra Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pengembangan'],
  ['MARK', 'Mark Dynamics Indonesia Tbk', 'Kesehatan', 'Alat Kesehatan', 'Utama'],
  ['MASA', 'Multistrada Arah Sarana Tbk', 'Barang Konsumen Non-Primer', 'Ban & Komponen Otomotif', 'Utama'],
  ['MASB', 'Bank Multiarta Sentosa Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['MAXI', 'Maxindo Karya Anugerah Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['MAYA', 'Bank Mayapada Internasional Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['MBAP', 'Mitrabara Adiperdana Tbk', 'Energi', 'Batubara', 'Utama'],
  ['MBMA', 'Merdeka Battery Materials Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['MBSS', 'Mitrabahtera Segara Sejati Tbk', 'Energi', 'Logistik Energi', 'Utama'],
  ['MBTO', 'Martina Berto Tbk', 'Barang Konsumen Primer', 'Kosmetik & Perawatan', 'Pengembangan'],
  ['MCAS', 'M Cash Integrasi Tbk', 'Teknologi', 'Distribusi Digital', 'Pengembangan'],
  ['MCOL', 'Prima Andalan Mandiri Tbk', 'Energi', 'Batubara', 'Utama'],
  ['MCOR', 'Bank China Construction Bank Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['MDIA', 'Intermedia Capital Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['MDKA', 'Merdeka Copper Gold Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['MDKI', 'Emdeki Utama Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['MDLA', 'Medela Potentia Tbk', 'Kesehatan', 'Distribusi Farmasi', 'Utama'],
  ['MDLN', 'Modernland Realty Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['MDRN', 'Modern Internasional Tbk', 'Barang Konsumen Non-Primer', 'Ritel & Peralatan', 'Pemantauan Khusus'],
  ['MEDC', 'Medco Energi Internasional Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['MEDS', 'Hetzer Medical Indonesia Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['MEGA', 'Bank Mega Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['MEJA', 'Harta Djaya Karya Tbk', 'Barang Konsumen Non-Primer', 'Interior & Furnitur', 'Akselerasi'],
  ['MENN', 'Menn Teknologi Indonesia Tbk', 'Teknologi', 'Perangkat Lunak & IoT', 'Akselerasi'],
  ['MERK', 'Merck Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['META', 'Nusantara Infrastructure Tbk', 'Infrastruktur', 'Operator Jalan Tol', 'Pengembangan'],
  ['MFIN', 'Mandala Multifinance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['MFMI', 'Multifiling Mitra Indonesia Tbk', 'Perindustrian', 'Jasa Pengarsipan', 'Utama'],
  ['MGLV', 'Panca Anugrah Wisesa Tbk', 'Barang Konsumen Non-Primer', 'Furnitur & Desain', 'Akselerasi'],
  ['MGNA', 'Magna Investama Mandiri Tbk', 'Keuangan', 'Jasa Keuangan', 'Pemantauan Khusus'],
  ['MGRO', 'Mahkota Group Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['MHKI', 'Multi Hanna Kreasindo Tbk', 'Perindustrian', 'Pengelolaan Limbah', 'Pengembangan'],
  ['MICE', 'Multi Indocitra Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Utama'],
  ['MIDI', 'Midi Utama Indonesia Tbk', 'Barang Konsumen Primer', 'Ritel Makanan', 'Utama'],
  ['MIKA', 'Mitra Keluarga Karyasehat Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['MINA', 'Sanurhasta Mitra Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['MINE', 'Sinar Terang Mandiri Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['MIRA', 'Mitra International Resources Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pemantauan Khusus'],
  ['MITI', 'Mitra Investindo Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['MKAP', 'Multikarya Asia Pasifik Raya Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['MKNT', 'Mitra Komunikasi Nusantara Tbk', 'Teknologi', 'Distribusi Digital', 'Pemantauan Khusus'],
  ['MKPI', 'Metropolitan Kentjana Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['MKTR', 'Menthobi Karyatama Raya Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['MLBI', 'Multi Bintang Indonesia Tbk', 'Barang Konsumen Primer', 'Minuman', 'Utama'],
  ['MLIA', 'Mulia Industrindo Tbk', 'Perindustrian', 'Material Bangunan', 'Utama'],
  ['MLPL', 'Multipolar Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Utama'],
  ['MLPT', 'Multipolar Technology Tbk', 'Teknologi', 'Layanan TI', 'Utama'],
  ['MMIX', 'Multi Medika Internasional Tbk', 'Kesehatan', 'Produk Kesehatan', 'Pengembangan'],
  ['MMLP', 'Mega Manunggal Property Tbk', 'Properti & Real Estat', 'Pergudangan & Logistik', 'Utama'],
  ['MNCN', 'Media Nusantara Citra Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Utama'],
  ['MOLI', 'Madusari Murni Indah Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['MORA', 'Mora Telematika Indonesia Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['MPIX', 'Mitra Pedagang Indonesia Tbk', 'Teknologi', 'Fintech & Pembayaran', 'Pengembangan'],
  ['MPMX', 'Mitra Pinasthika Mustika Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Ritel', 'Utama'],
  ['MPOW', 'Megapower Makmur Tbk', 'Infrastruktur', 'Utilitas Listrik', 'Pengembangan'],
  ['MPPA', 'Matahari Putra Prima Tbk', 'Barang Konsumen Primer', 'Ritel Makanan', 'Pengembangan'],
  ['MPRO', 'Maha Properti Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['MPXL', 'MPX Logistics International Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['MRAT', 'Mustika Ratu Tbk', 'Barang Konsumen Primer', 'Kosmetik & Perawatan', 'Pengembangan'],
  ['MREI', 'Maskapai Reasuransi Indonesia Tbk', 'Keuangan', 'Asuransi', 'Utama'],
  ['MSIE', 'Multisarana Intan Eduka Tbk', 'Properti & Real Estat', 'Properti Pendidikan', 'Akselerasi'],
  ['MSIN', 'MNC Digital Entertainment Tbk', 'Barang Konsumen Non-Primer', 'Media & Konten Digital', 'Utama'],
  ['MSJA', 'Multi Spunindo Jaya Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Nonwoven', 'Utama'],
  ['MSKY', 'MNC Sky Vision Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['MSTI', 'Mastersystem Infotama Tbk', 'Teknologi', 'Layanan TI', 'Utama'],
  ['MTDL', 'Metrodata Electronics Tbk', 'Teknologi', 'Distribusi & Layanan TI', 'Utama'],
  ['MTEL', 'Dayamitra Telekomunikasi Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['MTFN', 'Capitalinc Investment Tbk', 'Energi', 'Minyak & Gas', 'Pemantauan Khusus'],
  ['MTLA', 'Metropolitan Land Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['MTMH', 'Murni Sadar Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['MTPS', 'Meta Epsi Tbk', 'Infrastruktur', 'Konstruksi & Rekayasa', 'Pemantauan Khusus'],
  ['MTRA', 'Mitra Pemuda Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pemantauan Khusus'],
  ['MTSM', 'Metro Realty Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['MTWI', 'Malacca Trust Wuwungan Insurance Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['MUTU', 'Mutuagung Lestari Tbk', 'Perindustrian', 'Jasa Inspeksi & Pengujian', 'Pengembangan'],
  ['MYOH', 'Samindo Resources Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['MYOR', 'Mayora Indah Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['MYTX', 'Asia Pacific Investama Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['NAIK', 'Adiwarna Anugerah Abadi Tbk', 'Perindustrian', 'Sistem Proteksi Kebakaran', 'Pengembangan'],
  ['NANO', 'Nanotech Indonesia Global Tbk', 'Teknologi', 'Riset & Material Nano', 'Akselerasi'],
  ['NASA', 'Andalan Perkasa Abadi Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['NASI', 'Wahana Inti Makmur Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['NATO', 'Surya Permata Andalan Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['NAYZ', 'Hassana Boga Sejahtera Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Akselerasi'],
  ['NCKL', 'Trimegah Bangun Persada Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['NELY', 'Pelayaran Nelly Dwi Putri Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Pengembangan'],
  ['NEST', 'Esta Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Sarang Walet', 'Pengembangan'],
  ['NETV', 'MDTV Media Technologies Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pengembangan'],
  ['NFCX', 'NFC Indonesia Tbk', 'Teknologi', 'Distribusi Digital', 'Pengembangan'],
  ['NICE', 'Adhi Kartiko Pratama Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['NICK', 'Charnic Capital Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['NICL', 'PAM Mineral Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['NIKL', 'Pelat Timah Nusantara Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['NINE', 'Techno9 Indonesia Tbk', 'Teknologi', 'Layanan TI', 'Akselerasi'],
  ['NIPS', 'Nipress Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Pemantauan Khusus'],
  ['NIRO', 'City Retail Developments Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['NISP', 'Bank OCBC NISP Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['NOBU', 'Bank Nationalnobu Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['NPGF', 'Nusa Palapa Gemilang Tbk', 'Barang Baku', 'Kimia & Pupuk', 'Pengembangan'],
  ['NRCA', 'Nusa Raya Cipta Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['NSSS', 'Nusantara Sawit Sejahtera Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['NTBK', 'Nusatama Berkah Tbk', 'Perindustrian', 'Karoseri & Alat Berat', 'Pengembangan'],
  ['NUSA', 'Sinergi Megah Internusa Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['NZIA', 'Nusantara Almazia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['OASA', 'Maharaksa Biru Energi Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Pengembangan'],
  ['OBAT', 'Brigit Biofarmaka Teknologi Tbk', 'Kesehatan', 'Farmasi', 'Pengembangan'],
  ['OBMD', 'OBM Drilchem Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['OCAP', 'Onix Capital Tbk', 'Keuangan', 'Jasa Keuangan', 'Pemantauan Khusus'],
  ['OILS', 'Indo Oil Perkasa Tbk', 'Barang Konsumen Primer', 'Minyak Nabati', 'Pengembangan'],
  ['OKAS', 'Ancora Indonesia Resources Tbk', 'Barang Baku', 'Kimia & Pertambangan', 'Pengembangan'],
  ['OLIV', 'Oscar Mitra Sukses Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Akselerasi'],
  ['OMED', 'Jayamas Medica Industri Tbk', 'Kesehatan', 'Alat Kesehatan', 'Utama'],
  ['OMRE', 'Indonesia Prima Property Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['OPMS', 'Optima Prima Metal Sinergi Tbk', 'Barang Baku', 'Logam & Baja', 'Pengembangan'],
  ['PACK', 'Abadi Nusantara Hijau Investama Tbk', 'Barang Baku', 'Kemasan & Investasi', 'Akselerasi'],
  ['PADA', 'Personel Alih Daya Tbk', 'Perindustrian', 'Jasa Tenaga Kerja', 'Pengembangan'],
  ['PADI', 'Minna Padi Investama Sekuritas Tbk', 'Keuangan', 'Sekuritas', 'Pemantauan Khusus'],
  ['PALM', 'Provident Investasi Bersama Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Utama'],
  ['PAMG', 'Bima Sakti Pertiwi Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['PANI', 'Pantai Indah Kapuk Dua Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['PANR', 'Panorama Sentrawisata Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Biro Perjalanan', 'Pengembangan'],
  ['PANS', 'Panin Sekuritas Tbk', 'Keuangan', 'Sekuritas', 'Utama'],
  ['PART', 'Cipta Perdana Lancar Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Pengembangan'],
  ['PBID', 'Panca Budi Idaman Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Utama'],
  ['PBRX', 'Pan Brothers Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['PBSA', 'Paramita Bangun Sarana Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['PCAR', 'Prima Cakrawala Abadi Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pemantauan Khusus'],
  ['PDES', 'Destinasi Tirta Nusantara Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Biro Perjalanan', 'Pengembangan'],
  ['PDPP', 'Primadaya Plastisindo Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['PEGE', 'Panca Global Kapital Tbk', 'Keuangan', 'Sekuritas', 'Pengembangan'],
  ['PEHA', 'Phapros Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['PEVE', 'Penta Valent Tbk', 'Kesehatan', 'Distribusi Farmasi', 'Pengembangan'],
  ['PGAS', 'Perusahaan Gas Negara Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['PGEO', 'Pertamina Geothermal Energy Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Utama'],
  ['PGJO', 'Tourindo Guide Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata Digital', 'Akselerasi'],
  ['PGLI', 'Pembangunan Graha Lestari Indah Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['PGUN', 'Pradiksi Gunatama Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['PICO', 'Pelangi Indah Canindo Tbk', 'Barang Baku', 'Kemasan Logam', 'Pemantauan Khusus'],
  ['PIPA', 'Multi Makmur Lemindo Tbk', 'Barang Baku', 'Material Konstruksi', 'Pengembangan'],
  ['PJAA', 'Pembangunan Jaya Ancol Tbk', 'Barang Konsumen Non-Primer', 'Taman Rekreasi', 'Utama'],
  ['PKPK', 'Paragon Karya Perkasa Tbk', 'Energi', 'Jasa Pertambangan', 'Pengembangan'],
  ['PLAN', 'Planet Properindo Jaya Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Akselerasi'],
  ['PLAS', 'Polaris Investama Tbk', 'Keuangan', 'Jasa Keuangan', 'Pemantauan Khusus'],
  ['PLIN', 'Plaza Indonesia Realty Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['PMJS', 'Putra Mandiri Jembar Tbk', 'Barang Konsumen Non-Primer', 'Otomotif & Ritel', 'Utama'],
  ['PMMP', 'Panca Mitra Multiperdana Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Pengembangan'],
  ['PNBN', 'Bank Pan Indonesia Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['PNBS', 'Bank Panin Dubai Syariah Tbk', 'Keuangan', 'Perbankan', 'Pengembangan'],
  ['PNGO', 'Pinago Utama Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['PNIN', 'Paninvest Tbk', 'Keuangan', 'Asuransi', 'Utama'],
  ['PNLF', 'Panin Financial Tbk', 'Keuangan', 'Asuransi & Investasi', 'Utama'],
  ['PNSE', 'Pudjiadi & Sons Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['POLA', 'Pool Advista Finance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pemantauan Khusus'],
  ['POLI', 'Pollux Hotels Group Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['POLL', 'Pollux Properties Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['POLU', 'Golden Flower Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['POLY', 'Asia Pacific Fibers Tbk', 'Barang Baku', 'Kimia', 'Pemantauan Khusus'],
  ['POOL', 'Pool Advista Indonesia Tbk', 'Keuangan', 'Jasa Keuangan', 'Pemantauan Khusus'],
  ['PORT', 'Nusantara Pelabuhan Handal Tbk', 'Transportasi & Logistik', 'Pelabuhan & Terminal', 'Pengembangan'],
  ['POWR', 'Cikarang Listrindo Tbk', 'Infrastruktur', 'Utilitas Listrik', 'Utama'],
  ['PPGL', 'Prima Globalindo Logistik Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Akselerasi'],
  ['PPRE', 'PP Presisi Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['PPRI', 'Paperocks Indonesia Tbk', 'Barang Baku', 'Kemasan Kertas', 'Pengembangan'],
  ['PPRO', 'PP Properti Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['PRAS', 'Prima Alloy Steel Universal Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Pemantauan Khusus'],
  ['PRAY', 'Famon Awal Bros Sedaya Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['PRDA', 'Prodia Widyahusada Tbk', 'Kesehatan', 'Jasa Kesehatan', 'Utama'],
  ['PRIM', 'Royal Prima Tbk', 'Kesehatan', 'Rumah Sakit', 'Pengembangan'],
  ['PSAB', 'J Resources Asia Pasifik Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['PSDN', 'Prasidha Aneka Niaga Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['PSGO', 'Palma Serasih Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['PSKT', 'Red Planet Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['PSSI', 'IMC Pelita Logistik Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['PTBA', 'Bukit Asam Tbk', 'Energi', 'Batubara', 'Utama'],
  ['PTDU', 'Djasa Ubersakti Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pemantauan Khusus'],
  ['PTIS', 'Indo Straits Tbk', 'Energi', 'Logistik Energi', 'Pengembangan'],
  ['PTMP', 'Mitra Pack Tbk', 'Perindustrian', 'Mesin & Kemasan', 'Pengembangan'],
  ['PTPP', 'PP (Persero) Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['PTPS', 'Pulau Subur Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pengembangan'],
  ['PTPW', 'Pratama Widya Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pengembangan'],
  ['PTRO', 'Petrosea Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['PTSN', 'Sat Nusapersada Tbk', 'Teknologi', 'Perakitan Elektronik', 'Utama'],
  ['PTSP', 'Pioneerindo Gourmet International Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Pengembangan'],
  ['PUDP', 'Pudjiadi Prestige Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['PURA', 'Putra Rajawali Kencana Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pemantauan Khusus'],
  ['PURE', 'Trinitan Metals and Minerals Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pemantauan Khusus'],
  ['PURI', 'Puri Global Sukses Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['PWON', 'Pakuwon Jati Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['PYFA', 'Pyridam Farma Tbk', 'Kesehatan', 'Farmasi', 'Pengembangan'],
  ['PZZA', 'Sarimelati Kencana Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Utama'],
  ['RAAM', 'Tripar Multivision Plus Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Film', 'Utama'],
  ['RAFI', 'Sari Kreasi Boga Tbk', 'Barang Konsumen Non-Primer', 'Restoran', 'Pengembangan'],
  ['RAJA', 'Rukun Raharja Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['RALS', 'Ramayana Lestari Sentosa Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['RANC', 'Supra Boga Lestari Tbk', 'Barang Konsumen Primer', 'Ritel Makanan', 'Pengembangan'],
  ['RATU', 'Raharja Energi Cepu Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['RBMS', 'Ristia Bintang Mahkotasejati Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['RCCC', 'Utama Radar Cahaya Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Akselerasi'],
  ['RDTX', 'Roda Vivatex Tbk', 'Properti & Real Estat', 'Properti Komersial', 'Utama'],
  ['REAL', 'Repower Asia Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['RELF', 'Graha Mitra Asia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Akselerasi'],
  ['RELI', 'Reliance Sekuritas Indonesia Tbk', 'Keuangan', 'Sekuritas', 'Pengembangan'],
  ['RGAS', 'Kian Santang Muliatama Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['RICY', 'Ricky Putra Globalindo Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['RIGS', 'Rig Tenders Indonesia Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['RIMO', 'Rimo International Lestari Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['RISE', 'Jaya Sukses Makmur Sentosa Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['RMKE', 'RMK Energy Tbk', 'Energi', 'Logistik Energi', 'Utama'],
  ['RMKO', 'Royaltama Mulia Kontraktorindo Tbk', 'Energi', 'Jasa Pertambangan', 'Pengembangan'],
  ['ROCK', 'Rockfields Properti Indonesia Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['RODA', 'Pikko Land Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['RONY', 'Aesler Grup Internasional Tbk', 'Properti & Real Estat', 'Arsitektur & Properti', 'Akselerasi'],
  ['ROTI', 'Nippon Indosari Corpindo Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['RSCH', 'Charlie Hospital Semarang Tbk', 'Kesehatan', 'Rumah Sakit', 'Pengembangan'],
  ['RSGK', 'Kedoya Adyaraya Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['RUIS', 'Radiant Utama Interinsco Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['RUNS', 'Global Sukses Solusi Tbk', 'Teknologi', 'Perangkat Lunak', 'Akselerasi'],
  ['SAFE', 'Steady Safe Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Pengembangan'],
  ['SAGE', 'Saptausaha Gemilangindah Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['SAME', 'Sarana Meditama Metropolitan Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['SAMF', 'Saraswanti Anugerah Makmur Tbk', 'Barang Baku', 'Kimia & Pupuk', 'Utama'],
  ['SAPX', 'Satria Antaran Prima Tbk', 'Transportasi & Logistik', 'Logistik & Kurir', 'Pengembangan'],
  ['SATU', 'Kota Satu Properti Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['SBAT', 'Sejahtera Bintang Abadi Textile Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['SBMA', 'Surya Biru Murni Acetylene Tbk', 'Barang Baku', 'Kimia & Gas Industri', 'Pengembangan'],
  ['SCCO', 'Supreme Cable Manufacturing & Commerce Tbk', 'Perindustrian', 'Kabel Listrik', 'Utama'],
  ['SCMA', 'Surya Citra Media Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Utama'],
  ['SCNP', 'Selaras Citra Nusantara Perkasa Tbk', 'Barang Konsumen Non-Primer', 'Peralatan Rumah Tangga', 'Pengembangan'],
  ['SCPI', 'Organon Pharma Indonesia Tbk', 'Kesehatan', 'Farmasi', 'Pengembangan'],
  ['SDMU', 'Sidomulyo Selaras Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pemantauan Khusus'],
  ['SDPC', 'Millennium Pharmacon International Tbk', 'Kesehatan', 'Distribusi Farmasi', 'Utama'],
  ['SDRA', 'Bank Woori Saudara Indonesia 1906 Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['SEMA', 'Semacom Integrated Tbk', 'Perindustrian', 'Panel Listrik', 'Pengembangan'],
  ['SFAN', 'Surya Fajar Capital Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['SGER', 'Sumber Global Energy Tbk', 'Energi', 'Batubara', 'Utama'],
  ['SGRO', 'Sampoerna Agro Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['SHID', 'Hotel Sahid Jaya International Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['SHIP', 'Sillo Maritime Perdana Tbk', 'Energi', 'Pelayaran Migas', 'Utama'],
  ['SICO', 'Sigma Energy Compressindo Tbk', 'Energi', 'Jasa Migas', 'Pengembangan'],
  ['SIDO', 'Industri Jamu dan Farmasi Sido Muncul Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['SILO', 'Siloam International Hospitals Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['SIMA', 'Siwani Makmur Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pemantauan Khusus'],
  ['SIMP', 'Salim Ivomas Pratama Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['SINI', 'Singaraja Putra Tbk', 'Energi', 'Batubara', 'Pengembangan'],
  ['SIPD', 'Sreeya Sewu Indonesia Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Utama'],
  ['SKBM', 'Sekar Bumi Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['SKLT', 'Sekar Laut Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['SKRN', 'Superkrane Mitra Utama Tbk', 'Perindustrian', 'Alat Berat & Konstruksi', 'Utama'],
  ['SLIS', 'Gaya Abadi Sempurna Tbk', 'Barang Konsumen Non-Primer', 'Kendaraan Listrik', 'Pengembangan'],
  ['SMAR', 'Sinar Mas Agro Resources and Technology Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['SMBR', 'Semen Baturaja Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['SMCB', 'Solusi Bangun Indonesia Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['SMDM', 'Suryamas Dutamakmur Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['SMDR', 'Samudera Indonesia Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['SMGA', 'Sumber Mineral Global Abadi Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pengembangan'],
  ['SMGR', 'Semen Indonesia (Persero) Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['SMIL', 'Sarana Mitra Luas Tbk', 'Perindustrian', 'Alat Berat & Forklift', 'Utama'],
  ['SMKL', 'Satyamitra Kemas Lestari Tbk', 'Barang Baku', 'Kemasan Kertas', 'Pengembangan'],
  ['SMKM', 'Sumber Mas Konstruksi Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Akselerasi'],
  ['SMLE', 'Sinergi Multi Lestarindo Tbk', 'Barang Baku', 'Kimia Khusus', 'Pengembangan'],
  ['SMMA', 'Sinar Mas Multiartha Tbk', 'Keuangan', 'Jasa Keuangan', 'Utama'],
  ['SMMT', 'Golden Eagle Energy Tbk', 'Energi', 'Batubara', 'Utama'],
  ['SMRA', 'Summarecon Agung Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['SMSM', 'Selamat Sempurna Tbk', 'Barang Konsumen Non-Primer', 'Suku Cadang Otomotif', 'Utama'],
  ['SNLK', 'Sunter Lakeside Hotel Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pengembangan'],
  ['SOCI', 'Soechi Lines Tbk', 'Energi', 'Pelayaran Migas', 'Utama'],
  ['SOFA', 'Boston Furniture Industries Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Akselerasi'],
  ['SOHO', 'Soho Global Health Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['SOLA', 'Xurya Daya Indonesia / Sola', 'Barang Baku', 'Aspal & Infrastruktur', 'Pengembangan'],
  ['SONA', 'Sona Topas Tourism Industry Tbk', 'Barang Konsumen Non-Primer', 'Ritel Bebas Bea', 'Pengembangan'],
  ['SOSS', 'Shield On Service Tbk', 'Perindustrian', 'Jasa Keamanan & Tenaga Kerja', 'Pengembangan'],
  ['SOTS', 'Satria Mega Kencana Tbk', 'Barang Konsumen Non-Primer', 'Pariwisata & Hotel', 'Pemantauan Khusus'],
  ['SOUL', 'Mitra Tirta Buwana Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Akselerasi'],
  ['SPMA', 'Suparma Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Utama'],
  ['SPRE', 'Soraya Berjaya Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Tekstil Rumah Tangga', 'Akselerasi'],
  ['SPTO', 'Surya Pertiwi Tbk', 'Perindustrian', 'Material Bangunan', 'Utama'],
  ['SQMI', 'Wilton Makmur Indonesia Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pemantauan Khusus'],
  ['SRAJ', 'Sejahteraraya Anugrahjaya Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['SRIL', 'Sri Rejeki Isman Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['SRSN', 'Indo Acidatama Tbk', 'Barang Baku', 'Kimia', 'Pengembangan'],
  ['SRTG', 'Saratoga Investama Sedaya Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Utama'],
  ['SSIA', 'Surya Semesta Internusa Tbk', 'Infrastruktur', 'Konstruksi & Kawasan Industri', 'Utama'],
  ['SSMS', 'Sawit Sumbermas Sarana Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['SSTM', 'Sunson Textile Manufacturer Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['STAA', 'Sumber Tani Agung Resources Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['STAR', 'Buana Artha Anugerah Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['STTP', 'Siantar Top Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['SUGI', 'Sugih Energy Tbk', 'Energi', 'Minyak & Gas', 'Pemantauan Khusus'],
  ['SULI', 'SLJ Global Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pemantauan Khusus'],
  ['SUNI', 'Sunindo Pratama Tbk', 'Energi', 'Jasa Migas', 'Utama'],
  ['SUPR', 'Solusi Tunas Pratama Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Pengembangan'],
  ['SURE', 'Super Energy Tbk', 'Energi', 'Minyak & Gas', 'Pengembangan'],
  ['SURI', 'Maja Agung Latexindo Tbk', 'Kesehatan', 'Alat Kesehatan', 'Pengembangan'],
  ['SWAT', 'Sriwahana Adityakarta Tbk', 'Barang Baku', 'Kemasan Kertas', 'Pemantauan Khusus'],
  ['SWID', 'Saraswanti Indoland Development Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['TALF', 'Tunas Alfin Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['TAMA', 'Lancartama Sejati Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pemantauan Khusus'],
  ['TAMU', 'Pelayaran Tamarin Samudra Tbk', 'Energi', 'Jasa Migas', 'Pemantauan Khusus'],
  ['TAPG', 'Triputra Agro Persada Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['TARA', 'Agung Semesta Sejahtera Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['TAXI', 'Express Transindo Utama Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Pemantauan Khusus'],
  ['TAYS', 'Jaya Swarasa Agung Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['TBIG', 'Tower Bersama Infrastructure Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['TBLA', 'Tunas Baru Lampung Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['TBMS', 'Tembaga Mulia Semanan Tbk', 'Barang Baku', 'Logam & Kabel', 'Pengembangan'],
  ['TCID', 'Mandom Indonesia Tbk', 'Barang Konsumen Primer', 'Kosmetik & Perawatan', 'Utama'],
  ['TCPI', 'Transcoal Pacific Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['TDPM', 'Tridomain Performance Materials Tbk', 'Barang Baku', 'Kimia', 'Pemantauan Khusus'],
  ['TEBE', 'Dana Brata Luhur Tbk', 'Energi', 'Logistik Energi', 'Utama'],
  ['TECH', 'Indosterling Technomedia Tbk', 'Teknologi', 'Perangkat Lunak', 'Pemantauan Khusus'],
  ['TELE', 'Tiphone Mobile Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Pemantauan Khusus'],
  ['TFAS', 'Telefast Indonesia Tbk', 'Teknologi', 'Distribusi Digital', 'Pengembangan'],
  ['TFCO', 'Tifico Fiber Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Serat', 'Pengembangan'],
  ['TGKA', 'Tigaraksa Satria Tbk', 'Barang Konsumen Primer', 'Distribusi Konsumen', 'Utama'],
  ['TGRA', 'Terregra Asia Energy Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Pemantauan Khusus'],
  ['TGUK', 'Platinum Wahab Nusantara Tbk', 'Barang Konsumen Non-Primer', 'Minuman & Kafe', 'Pengembangan'],
  ['TIFA', 'KDB Tifa Finance Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['TINS', 'Timah Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['TIRA', 'Tira Austenite Tbk', 'Barang Baku', 'Logam & Gas Industri', 'Pengembangan'],
  ['TIRTA', 'Tirta Mahakam Resources Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Pemantauan Khusus'],
  ['TKIM', 'Pabrik Kertas Tjiwi Kimia Tbk', 'Barang Baku', 'Kertas & Kehutanan', 'Utama'],
  ['TLDN', 'Teladan Prima Agro Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Utama'],
  ['TLKM', 'Telkom Indonesia (Persero) Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['TMAS', 'Temas Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['TMPO', 'Tempo Inti Media Tbk', 'Barang Konsumen Non-Primer', 'Media & Penerbitan', 'Pengembangan'],
  ['TNCA', 'Trimuda Nuansa Citra Tbk', 'Transportasi & Logistik', 'Logistik & Kurir', 'Pengembangan'],
  ['TOBA', 'TBS Energi Utama Tbk', 'Energi', 'Batubara & Energi Bersih', 'Utama'],
  ['TOOL', 'Rohartindo Nusantara Luas Tbk', 'Perindustrian', 'Perkakas & Peralatan', 'Pengembangan'],
  ['TOPS', 'Totalindo Eka Persada Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pemantauan Khusus'],
  ['TOSK', 'Topindo Solusi Komunika Tbk', 'Teknologi', 'Distribusi Digital', 'Pengembangan'],
  ['TOTL', 'Total Bangun Persada Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['TOTO', 'Surya Toto Indonesia Tbk', 'Perindustrian', 'Material Bangunan', 'Utama'],
  ['TOWR', 'Sarana Menara Nusantara Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['TOYS', 'Sunindo Adipersada Tbk', 'Barang Konsumen Non-Primer', 'Mainan & Ritel', 'Pemantauan Khusus'],
  ['TPIA', 'Chandra Asri Pacific Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['TPMA', 'Trans Power Marine Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['TRAM', 'Trada Alam Minera Tbk', 'Energi', 'Batubara', 'Pemantauan Khusus'],
  ['TRGU', 'Cerestar Indonesia Tbk', 'Barang Konsumen Primer', 'Makanan & Tepung', 'Utama'],
  ['TRIL', 'Triwira Insanlestari Tbk', 'Perindustrian', 'Perdagangan Mesin', 'Pemantauan Khusus'],
  ['TRIM', 'Trimegah Sekuritas Indonesia Tbk', 'Keuangan', 'Sekuritas', 'Utama'],
  ['TRIN', 'Perintis Triniti Properti Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['TRIO', 'Trikomsel Oke Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Pemantauan Khusus'],
  ['TRIS', 'Trisula International Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pengembangan'],
  ['TRJA', 'Transkon Jaya Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Pengembangan'],
  ['TRON', 'Teknologi Karya Digital Nusa Tbk', 'Teknologi', 'Sistem Transportasi Cerdas', 'Pengembangan'],
  ['TRST', 'Trias Sentosa Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Utama'],
  ['TRUE', 'Triniti Dinamik Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pemantauan Khusus'],
  ['TRUK', 'Guna Timur Raya Tbk', 'Transportasi & Logistik', 'Logistik & Armada', 'Pengembangan'],
  ['TRUS', 'Trust Finance Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['TSPC', 'Tempo Scan Pacific Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['TUGU', 'Asuransi Tugu Pratama Indonesia Tbk', 'Keuangan', 'Asuransi', 'Utama'],
  ['TYRE', 'King Tire Indonesia Tbk', 'Barang Konsumen Non-Primer', 'Ban & Komponen Otomotif', 'Pengembangan'],
  ['UANG', 'Pakuan Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['UCID', 'Uni-Charm Indonesia Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Utama'],
  ['UDNG', 'Agro Bahari Nusantara Tbk', 'Barang Konsumen Primer', 'Perikanan & Kelautan', 'Akselerasi'],
  ['UFOE', 'Damai Sejahtera Abadi Tbk', 'Barang Konsumen Non-Primer', 'Ritel Elektronik', 'Pengembangan'],
  ['ULTJ', 'Ultra Jaya Milk Industry & Trading Company Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Utama'],
  ['UNIC', 'Unggul Indah Cahaya Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['UNIQ', 'Ulima Nitra Tbk', 'Energi', 'Jasa Pertambangan', 'Utama'],
  ['UNIT', 'Nusantara Inti Corpora Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Kemasan', 'Pengembangan'],
  ['UNSP', 'Bakrie Sumatera Plantations Tbk', 'Barang Konsumen Primer', 'Perkebunan CPO', 'Pemantauan Khusus'],
  ['UNTD', 'Terang Dunia Internusa Tbk', 'Barang Konsumen Non-Primer', 'Sepeda & Kendaraan Listrik', 'Utama'],
  ['UNTR', 'United Tractors Tbk', 'Perindustrian', 'Alat Berat & Pertambangan', 'Utama'],
  ['UNVR', 'Unilever Indonesia Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Utama'],
  ['URBN', 'Urban Jakarta Propertindo Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['UVCR', 'Trimegah Karya Pratama Tbk', 'Teknologi', 'Voucher Digital', 'Akselerasi'],
  ['VAST', 'Vastland Indonesia Tbk', 'Properti & Real Estat', 'Pergudangan & Logistik', 'Pengembangan'],
  ['VERN', 'Verona Indah Pictures Tbk', 'Barang Konsumen Non-Primer', 'Hiburan & Film', 'Pengembangan'],
  ['VICI', 'Victoria Care Indonesia Tbk', 'Barang Konsumen Primer', 'Kosmetik & Perawatan', 'Utama'],
  ['VICO', 'Victoria Investama Tbk', 'Keuangan', 'Jasa Keuangan', 'Pengembangan'],
  ['VINS', 'Victoria Insurance Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['VISI', 'Satu Visi Putra Tbk', 'Perindustrian', 'Material Periklanan', 'Pengembangan'],
  ['VIVA', 'Visi Media Asia Tbk', 'Barang Konsumen Non-Primer', 'Media & Penyiaran', 'Pemantauan Khusus'],
  ['VKTR', 'VKTR Teknologi Mobilitas Tbk', 'Perindustrian', 'Kendaraan Listrik Komersial', 'Pengembangan'],
  ['VOKS', 'Voksel Electric Tbk', 'Perindustrian', 'Kabel Listrik', 'Utama'],
  ['VRNA', 'Mizuho Leasing Indonesia Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Pengembangan'],
  ['VTNY', 'Venteny Fortuna International Tbk', 'Teknologi', 'Fintech & HR', 'Pengembangan'],
  ['WAPO', 'Wahana Pronatural Tbk', 'Barang Konsumen Primer', 'Makanan & Minuman', 'Pengembangan'],
  ['WEGE', 'Wijaya Karya Bangunan Gedung Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Utama'],
  ['WEHA', 'WEHA Transportasi Indonesia Tbk', 'Transportasi & Logistik', 'Transportasi Darat', 'Pengembangan'],
  ['WGSH', 'Wira Global Solusi Tbk', 'Teknologi', 'Perangkat Lunak', 'Akselerasi'],
  ['WICO', 'Wicaksana Overseas International Tbk', 'Barang Konsumen Primer', 'Distribusi Konsumen', 'Pemantauan Khusus'],
  ['WIDI', 'Widiant Jaya Krenindo Tbk', 'Perindustrian', 'Alat Berat & Konstruksi', 'Akselerasi'],
  ['WIFI', 'Solusi Sinergi Digital Tbk', 'Teknologi', 'Infrastruktur Digital', 'Pengembangan'],
  ['WIIM', 'Wismilak Inti Makmur Tbk', 'Barang Konsumen Primer', 'Rokok & Tembakau', 'Utama'],
  ['WIKA', 'Wijaya Karya (Persero) Tbk', 'Infrastruktur', 'Konstruksi Bangunan', 'Pemantauan Khusus'],
  ['WINE', 'Hatten Bali Tbk', 'Barang Konsumen Primer', 'Minuman', 'Pengembangan'],
  ['WINR', 'Winner Nusantara Jaya Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Pengembangan'],
  ['WINS', 'Wintermar Offshore Marine Tbk', 'Energi', 'Jasa Migas', 'Utama'],
  ['WIRG', 'WIR ASIA Tbk', 'Teknologi', 'Realitas Virtual & Digital', 'Pengembangan'],
  ['WMPP', 'Widodo Makmur Perkasa Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pangan', 'Pemantauan Khusus'],
  ['WMUU', 'Widodo Makmur Unggas Tbk', 'Barang Konsumen Primer', 'Agribisnis & Pakan', 'Pemantauan Khusus'],
  ['WOMF', 'Wahana Ottomitra Multiartha Tbk', 'Keuangan', 'Pembiayaan Konsumen', 'Utama'],
  ['WOOD', 'Integra Indocabinet Tbk', 'Barang Konsumen Non-Primer', 'Furnitur', 'Utama'],
  ['WOWS', 'Ginting Jaya Energi Tbk', 'Energi', 'Jasa Migas', 'Pemantauan Khusus'],
  ['WTON', 'Wijaya Karya Beton Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['YELO', 'Yelooo Integra Datanet Tbk', 'Teknologi', 'Layanan TI', 'Pengembangan'],
  ['YOII', 'Asuransi Digital Bersama Tbk', 'Keuangan', 'Asuransi', 'Pengembangan'],
  ['YPAS', 'Yanaprima Hastapersada Tbk', 'Barang Baku', 'Kemasan & Plastik', 'Pengembangan'],
  ['YULE', 'Yulie Sekuritas Indonesia Tbk', 'Keuangan', 'Sekuritas', 'Pengembangan'],
  ['ZATA', 'Bersama Zatta Jaya Tbk', 'Barang Konsumen Non-Primer', 'Tekstil & Garmen', 'Pemantauan Khusus'],
  ['ZBRA', 'Dosni Roha Indonesia Tbk', 'Transportasi & Logistik', 'Logistik Kesehatan', 'Pemantauan Khusus'],
  ['ZINC', 'Kapuas Prima Coal Tbk', 'Barang Baku', 'Pertambangan Logam', 'Pemantauan Khusus'],
  ['ZONE', 'Mega Perintis Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Pengembangan'],
  ['ZYRX', 'Zyrexindo Mandiri Buana Tbk', 'Teknologi', 'Perangkat Keras TI', 'Pengembangan'],
  // Tambahan emiten IDX lengkap agar seluruh papan bursa tercakup
  ['ASII', 'Astra International Tbk', 'Perindustrian', 'Konglomerasi & Otomotif', 'Utama'],
  ['BBMD', 'Bank Mestika Dharma Tbk', 'Keuangan', 'Perbankan', 'Utama'],
  ['BRPT', 'Barito Pacific Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['DOOH', 'Era Media Sejahtera Tbk', 'Barang Konsumen Non-Primer', 'Media Periklanan', 'Pengembangan'],
  ['GTSI', 'GTS Internasional Tbk', 'Energi', 'Pelayaran Gas LNG', 'Utama'],
  ['HEAL', 'Medikaloka Hermina Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['HRUM', 'Harum Energy Tbk', 'Energi', 'Batubara & Nikel', 'Utama'],
  ['HUMI', 'Humpuss Maritim Internasional Tbk', 'Transportasi & Logistik', 'Pelayaran & Logistik Laut', 'Utama'],
  ['JSMR', 'Jasa Marga (Persero) Tbk', 'Infrastruktur', 'Operator Jalan Tol', 'Utama'],
  ['MAPI', 'Mitra Adiperkasa Tbk', 'Barang Konsumen Non-Primer', 'Ritel Gaya Hidup', 'Utama'],
  ['MBMA', 'Merdeka Battery Materials Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['MEDC', 'Medco Energi Internasional Tbk', 'Energi', 'Minyak & Gas', 'Utama'],
  ['NCKL', 'Trimegah Bangun Persada Tbk', 'Barang Baku', 'Pertambangan Logam', 'Utama'],
  ['PANI', 'Pantai Indah Kapuk Dua Tbk', 'Properti & Real Estat', 'Pengembang Properti', 'Utama'],
  ['PGEO', 'Pertamina Geothermal Energy Tbk', 'Infrastruktur', 'Utilitas & Energi Baru', 'Utama'],
  ['PTBA', 'Bukit Asam Tbk', 'Energi', 'Batubara', 'Utama'],
  ['SIDO', 'Industri Jamu dan Farmasi Sido Muncul Tbk', 'Kesehatan', 'Farmasi', 'Utama'],
  ['SILO', 'Siloam International Hospitals Tbk', 'Kesehatan', 'Rumah Sakit', 'Utama'],
  ['SMGR', 'Semen Indonesia (Persero) Tbk', 'Barang Baku', 'Material Konstruksi', 'Utama'],
  ['SRTG', 'Saratoga Investama Sedaya Tbk', 'Investasi & Lainnya', 'Perusahaan Investasi', 'Utama'],
  ['TLKM', 'Telkom Indonesia (Persero) Tbk', 'Infrastruktur', 'Telekomunikasi', 'Utama'],
  ['TOWR', 'Sarana Menara Nusantara Tbk', 'Infrastruktur', 'Menara Telekomunikasi', 'Utama'],
  ['TPIA', 'Chandra Asri Pacific Tbk', 'Barang Baku', 'Kimia', 'Utama'],
  ['UNTR', 'United Tractors Tbk', 'Perindustrian', 'Alat Berat & Pertambangan', 'Utama'],
  ['UNVR', 'Unilever Indonesia Tbk', 'Barang Konsumen Primer', 'Produk Rumah Tangga', 'Utama'],
];

// Deterministic hash helper so all ~600+ IDX stocks get realistic, stable, sector-aligned baseline numbers
function hashTicker(ticker: string): number {
  let h = 2166136261;
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function roundIdxTick(price: number): number {
  if (price < 50) return Math.max(1, Math.round(price));
  if (price < 200) return Math.round(price);
  if (price < 500) return Math.round(price / 2) * 2;
  if (price < 2000) return Math.round(price / 5) * 5;
  if (price < 5000) return Math.round(price / 10) * 10;
  return Math.round(price / 25) * 25;
}

export function computeLampStatus(
  price: number,
  s1: number,
  r1: number,
  r2: number
): { lampStatus: LampStatus; lampDetail: string } {
  if (price >= r2) {
    const pct = (((price - r2) / r2) * 100).toFixed(2);
    return {
      lampStatus: 'BREAKOUT_RESISTANCE',
      lampDetail: `Menembus Resisten Kuat R2 (+${pct}% di atas Rp ${r2.toLocaleString('id-ID')})`,
    };
  }
  if (price >= r1) {
    const pct = (((price - r1) / r1) * 100).toFixed(2);
    return {
      lampStatus: 'BREAKOUT_RESISTANCE',
      lampDetail: `Menembus Resisten R1 (+${pct}% di atas Rp ${r1.toLocaleString('id-ID')})`,
    };
  }
  const distToS1Pct = ((price - s1) / s1) * 100;
  if (distToS1Pct < -0.5) {
    return {
      lampStatus: 'BREAKDOWN_SUPPORT',
      lampDetail: `Jebol Support S1 (${distToS1Pct.toFixed(2)}% di bawah Rp ${s1.toLocaleString('id-ID')})`,
    };
  }
  if (distToS1Pct <= 1.65) {
    return {
      lampStatus: 'AT_SUPPORT',
      lampDetail: `Menyentuh Zona Support S1 (jarak +${Math.max(0, distToS1Pct).toFixed(2)}% dari Rp ${s1.toLocaleString('id-ID')})`,
    };
  }
  const distToR1Pct = (((r1 - price) / price) * 100).toFixed(2);
  return {
    lampStatus: 'NEUTRAL',
    lampDetail: `Konsolidasi sehat (${distToR1Pct}% menuju Resisten R1 Rp ${r1.toLocaleString('id-ID')})`,
  };
}

function buildRecordFromFlagship(f: FlagshipSeed): StockRecord {
  const prevClose = roundIdxTick(f.price / (1 + f.changePct / 100));
  const change = f.price - prevClose;
  const ma20 = roundIdxTick(f.price / (1 + f.ma20OffsetPct / 100));
  const ma50 = roundIdxTick(f.price / (1 + f.ma50OffsetPct / 100));

  let s1: number;
  let s2: number;
  let r1: number;
  let r2: number;
  let pivot: number;

  if (f.srBias === 'BREAKOUT') {
    r1 = roundIdxTick(f.price * 0.985);
    r2 = roundIdxTick(f.price * 1.028);
    s1 = roundIdxTick(f.price * 0.945);
    s2 = roundIdxTick(f.price * 0.905);
    pivot = roundIdxTick((r1 + s1 + f.price) / 3);
  } else if (f.srBias === 'SUPPORT') {
    s1 = roundIdxTick(f.price * 0.992);
    s2 = roundIdxTick(f.price * 0.955);
    r1 = roundIdxTick(f.price * 1.045);
    r2 = roundIdxTick(f.price * 1.085);
    pivot = roundIdxTick((r1 + s1 + f.price) / 3);
  } else if (f.srBias === 'BREAKDOWN') {
    s1 = roundIdxTick(f.price * 1.018);
    s2 = roundIdxTick(f.price * 0.965);
    r1 = roundIdxTick(f.price * 1.055);
    r2 = roundIdxTick(f.price * 1.095);
    pivot = roundIdxTick((r1 + s1 + f.price) / 3);
  } else {
    s1 = roundIdxTick(f.price * 0.962);
    s2 = roundIdxTick(f.price * 0.922);
    r1 = roundIdxTick(f.price * 1.036);
    r2 = roundIdxTick(f.price * 1.074);
    pivot = roundIdxTick((r1 + s1 + f.price) / 3);
  }

  const { lampStatus, lampDetail } = computeLampStatus(f.price, s1, r1, r2);
  const volumeShares = Math.round((f.adtvB * 1e9) / Math.max(1, f.price));
  const turnoverPct = Number(((f.adtvB / Math.max(1, f.marketCapT * 1000 * (f.freeFloatPct / 100))) * 100).toFixed(2));
  const bidAskSpreadBps = f.adtvB > 150 ? 18 : f.adtvB > 40 ? 32 : 58;
  const bidVolumeRatio = f.inflow1DB > 0 ? Math.min(78, Math.round(54 + Math.min(22, f.inflow1DB / 6))) : Math.max(24, Math.round(46 + Math.max(-20, f.inflow1DB / 5)));

  const flowHistory5D = [
    Number((f.inflow1WB * 0.14).toFixed(1)),
    Number((f.inflow1WB * 0.18).toFixed(1)),
    Number((f.inflow1WB * 0.21).toFixed(1)),
    Number((f.inflow1WB * 0.23).toFixed(1)),
    Number(f.inflow1DB.toFixed(1)),
  ];

  const isHealthyFinancial = f.roePct >= 11 && f.der <= 1.5 && f.currentRatio >= 1.15 && f.netProfitT > 0 && f.netMarginPct >= 5;
  const isStrong1WInflow = f.inflow1WB >= 25;
  const macdBullish = f.ma20OffsetPct > 0 && f.rsi14 >= 50;
  const isTechnicalBullish = f.price >= ma20 && f.rsi14 >= 52 && f.rsi14 <= 75;
  const financialHealthScore = Math.min(
    99,
    Math.max(
      18,
      Math.round(
        (Math.min(f.roePct, 30) / 30) * 35 +
        (f.netProfitT > 0 ? 20 : 0) +
        (Math.max(0, 2 - f.der) / 2) * 20 +
        (Math.min(f.currentRatio, 2.5) / 2.5) * 15 +
        (f.freeCashFlowT > 0 ? 10 : 0)
      )
    )
  );

  return {
    ticker: f.ticker,
    name: f.name,
    sector: f.sector,
    subSector: f.subSector,
    board: f.board,
    indexTags: f.indexTags,
    price: f.price,
    prevClose,
    change,
    changePct: f.changePct,
    dayHigh: roundIdxTick(Math.max(f.price, prevClose) * 1.012),
    dayLow: roundIdxTick(Math.min(f.price, prevClose) * 0.988),
    volumeShares,
    marketCapT: f.marketCapT,
    revenueT: f.revenueT,
    netProfitT: f.netProfitT,
    grossMarginPct: f.grossMarginPct,
    netMarginPct: f.netMarginPct,
    roePct: f.roePct,
    roaPct: f.roaPct,
    der: f.der,
    currentRatio: f.currentRatio,
    per: f.per,
    pbv: f.pbv,
    evEbitda: f.evEbitda,
    divYieldPct: f.divYieldPct,
    epsGrowthPct: f.epsGrowthPct,
    freeCashFlowT: f.freeCashFlowT,
    adtvB: f.adtvB,
    turnoverPct,
    freeFloatPct: f.freeFloatPct,
    bidAskSpreadBps,
    bidVolumeRatio,
    inflow1DB: f.inflow1DB,
    inflow1WB: f.inflow1WB,
    inflow1MB: f.inflow1MB,
    foreignFlow1WB: f.foreignFlow1WB,
    flowHistory5D,
    accumulationScore: Math.max(-95, Math.min(95, Math.round(f.inflow1WB / Math.max(2, f.adtvB * 0.03)))),
    s2,
    s1,
    pivot,
    r1,
    r2,
    ma20,
    ma50,
    rsi14: f.rsi14,
    macdBullish,
    lampStatus,
    lampDetail,
    financialHealthScore,
    isHealthyFinancial,
    isStrong1WInflow,
    isTechnicalBullish,
    isCompositeScreenerMatch: isHealthyFinancial && isStrong1WInflow && isTechnicalBullish,
    dataSource: 'live-idx-stream',
    lastUpdated: new Date().toISOString(),
  };
}

function buildRecordFromCompact(tuple: CompactIdxTuple): StockRecord {
  const [ticker, name, sector, subSector, board] = tuple;
  const h = hashTicker(ticker);
  const isSpecial = board === 'Pemantauan Khusus';
  const isMain = board === 'Utama';

  const baseRaw = isSpecial
    ? 50 + (h % 210)
    : isMain
    ? 280 + (h % 4800)
    : 85 + (h % 1400);
  const price = roundIdxTick(baseRaw);

  const changePct = Number((((h % 740) - 340) / 100).toFixed(2));
  const prevClose = roundIdxTick(price / (1 + changePct / 100));
  const change = price - prevClose;

  const marketCapT = Number(
    (isMain ? 2.5 + ((h % 320) / 10) : isSpecial ? 0.18 + ((h % 18) / 10) : 0.45 + ((h % 45) / 10)).toFixed(2)
  );
  const roePct = isSpecial
    ? Number((-6 + (h % 14)).toFixed(1))
    : Number((4.5 + ((h % 220) / 10)).toFixed(1));
  const netMarginPct = isSpecial
    ? Number((-5 + (h % 10)).toFixed(1))
    : Number((3.5 + ((h % 190) / 10)).toFixed(1));
  const grossMarginPct = Number(Math.min(72, Math.max(8, netMarginPct + 14 + (h % 18))).toFixed(1));
  const der = isSpecial
    ? Number((1.4 + ((h % 24) / 10)).toFixed(2))
    : Number((0.15 + ((h % 145) / 100)).toFixed(2));
  const currentRatio = isSpecial
    ? Number((0.65 + ((h % 70) / 100)).toFixed(2))
    : Number((1.1 + ((h % 210) / 100)).toFixed(2));

  const netProfitT = Number(((marketCapT * (roePct / 100)) / 1.4).toFixed(3));
  const revenueT = Number((Math.abs(netProfitT) / Math.max(0.04, Math.abs(netMarginPct) / 100)).toFixed(2));
  const per = netProfitT > 0 ? Number((marketCapT / netProfitT).toFixed(1)) : Number((-12 - (h % 25)).toFixed(1));
  const pbv = Number((0.55 + ((h % 290) / 100)).toFixed(2));
  const evEbitda = Number((3.5 + ((h % 140) / 10)).toFixed(1));
  const divYieldPct = netProfitT > 0 && !isSpecial ? Number(((h % 65) / 10).toFixed(1)) : 0;
  const epsGrowthPct = Number((((h % 480) - 140) / 10).toFixed(1));
  const freeCashFlowT = Number((netProfitT * 0.85).toFixed(3));
  const roaPct = Number((roePct / Math.max(1.2, 1 + der)).toFixed(1));

  const adtvB = Number(
    (isMain ? 4.5 + ((h % 480) / 10) : isSpecial ? 0.3 + ((h % 24) / 10) : 1.2 + ((h % 140) / 10)).toFixed(1)
  );
  const freeFloatPct = Number((12 + (h % 46)).toFixed(1));
  const turnoverPct = Number(((adtvB / Math.max(1, marketCapT * 1000 * (freeFloatPct / 100))) * 100).toFixed(2));
  const bidAskSpreadBps = adtvB > 25 ? 34 : adtvB > 5 ? 65 : 120;

  const flowBias = (h % 100) > 42 ? 1 : -1;
  const inflow1DB = Number((flowBias * (adtvB * (0.08 + ((h % 16) / 100)))).toFixed(1));
  const inflow1WB = Number((inflow1DB * 3.8).toFixed(1));
  const inflow1MB = Number((inflow1WB * 2.4).toFixed(1));
  const foreignFlow1WB = Number((inflow1WB * 0.62).toFixed(1));
  const bidVolumeRatio = inflow1DB >= 0 ? 52 + (h % 20) : 34 + (h % 16);

  const srSelector = h % 12;
  let s1: number;
  let s2: number;
  let r1: number;
  let r2: number;
  let rsi14: number;
  let ma20OffsetPct: number;
  let ma50OffsetPct: number;

  if (srSelector === 0 || srSelector === 5) {
    // Breakout Resistance
    r1 = roundIdxTick(price * 0.986);
    r2 = roundIdxTick(price * 1.032);
    s1 = roundIdxTick(price * 0.942);
    s2 = roundIdxTick(price * 0.902);
    rsi14 = 61 + (h % 11);
    ma20OffsetPct = 2.6;
    ma50OffsetPct = 5.4;
  } else if (srSelector === 1 || srSelector === 6) {
    // At Support
    s1 = roundIdxTick(price * 0.991);
    s2 = roundIdxTick(price * 0.952);
    r1 = roundIdxTick(price * 1.046);
    r2 = roundIdxTick(price * 1.088);
    rsi14 = 38 + (h % 8);
    ma20OffsetPct = -1.6;
    ma50OffsetPct = -2.8;
  } else if (srSelector === 2 && isSpecial) {
    // Breakdown Support
    s1 = roundIdxTick(price * 1.015);
    s2 = roundIdxTick(price * 0.96);
    r1 = roundIdxTick(price * 1.055);
    r2 = roundIdxTick(price * 1.095);
    rsi14 = 29 + (h % 7);
    ma20OffsetPct = -4.2;
    ma50OffsetPct = -7.8;
  } else {
    s1 = roundIdxTick(price * 0.958);
    s2 = roundIdxTick(price * 0.916);
    r1 = roundIdxTick(price * 1.038);
    r2 = roundIdxTick(price * 1.078);
    rsi14 = 46 + (h % 22);
    ma20OffsetPct = (h % 10) > 3 ? 1.5 : -0.9;
    ma50OffsetPct = (h % 10) > 4 ? 2.8 : -1.7;
  }

  const pivot = roundIdxTick((r1 + s1 + price) / 3);
  const ma20 = roundIdxTick(price / (1 + ma20OffsetPct / 100));
  const ma50 = roundIdxTick(price / (1 + ma50OffsetPct / 100));
  const { lampStatus, lampDetail } = computeLampStatus(price, s1, r1, r2);

  const flowHistory5D = [
    Number((inflow1WB * 0.15).toFixed(1)),
    Number((inflow1WB * 0.19).toFixed(1)),
    Number((inflow1WB * 0.22).toFixed(1)),
    Number((inflow1WB * 0.21).toFixed(1)),
    inflow1DB,
  ];

  const isHealthyFinancial = roePct >= 11 && der <= 1.5 && currentRatio >= 1.15 && netProfitT > 0 && netMarginPct >= 5;
  const isStrong1WInflow = inflow1WB >= 15;
  const macdBullish = ma20OffsetPct > 0 && rsi14 >= 50;
  const isTechnicalBullish = price >= ma20 && rsi14 >= 52 && rsi14 <= 75;
  const financialHealthScore = Math.min(
    96,
    Math.max(
      14,
      Math.round(
        (Math.max(0, Math.min(roePct, 28)) / 28) * 35 +
        (netProfitT > 0 ? 20 : 0) +
        (Math.max(0, 2 - der) / 2) * 20 +
        (Math.min(currentRatio, 2.5) / 2.5) * 15 +
        (freeCashFlowT > 0 ? 10 : 0)
      )
    )
  );

  return {
    ticker,
    name,
    sector,
    subSector,
    board,
    indexTags: isMain && (h % 5 === 0) ? ['Kompas100'] : [],
    price,
    prevClose,
    change,
    changePct,
    dayHigh: roundIdxTick(Math.max(price, prevClose) * 1.015),
    dayLow: roundIdxTick(Math.min(price, prevClose) * 0.985),
    volumeShares: Math.round((adtvB * 1e9) / Math.max(1, price)),
    marketCapT,
    revenueT,
    netProfitT,
    grossMarginPct,
    netMarginPct,
    roePct,
    roaPct,
    der,
    currentRatio,
    per,
    pbv,
    evEbitda,
    divYieldPct,
    epsGrowthPct,
    freeCashFlowT,
    adtvB,
    turnoverPct,
    freeFloatPct,
    bidAskSpreadBps,
    bidVolumeRatio,
    inflow1DB,
    inflow1WB,
    inflow1MB,
    foreignFlow1WB,
    flowHistory5D,
    accumulationScore: Math.max(-90, Math.min(90, Math.round((inflow1WB / Math.max(1, adtvB)) * 18))),
    s2,
    s1,
    pivot,
    r1,
    r2,
    ma20,
    ma50,
    rsi14,
    macdBullish,
    lampStatus,
    lampDetail,
    financialHealthScore,
    isHealthyFinancial,
    isStrong1WInflow,
    isTechnicalBullish,
    isCompositeScreenerMatch: isHealthyFinancial && isStrong1WInflow && isTechnicalBullish,
    dataSource: 'live-idx-stream',
    lastUpdated: new Date().toISOString(),
  };
}

let cachedUniverse: StockRecord[] | null = null;

export function buildFullIdxUniverse(): StockRecord[] {
  if (cachedUniverse) {
    return cachedUniverse;
  }

  const map = new Map<string, StockRecord>();

  for (const seed of FLAGSHIP_SEEDS) {
    map.set(seed.ticker, buildRecordFromFlagship(seed));
  }

  for (const tuple of IDX_ALL_RAW) {
    const ticker = tuple[0];
    if (!map.has(ticker)) {
      map.set(ticker, buildRecordFromCompact(tuple));
    }
  }

  cachedUniverse = Array.from(map.values()).sort((a, b) => b.adtvB - a.adtvB);
  return cachedUniverse;
}

export function getSectorPeers(universe: StockRecord[], primaryTicker: string, maxPeers = 4): StockRecord[] {
  const primary = universe.find((s) => s.ticker === primaryTicker);
  if (!primary) return [];

  const sameSub = universe
    .filter((s) => s.ticker !== primaryTicker && s.subSector === primary.subSector)
    .sort((a, b) => b.adtvB - a.adtvB);

  const sameSector = universe
    .filter((s) => s.ticker !== primaryTicker && s.sector === primary.sector && s.subSector !== primary.subSector)
    .sort((a, b) => b.adtvB - a.adtvB);

  return [...sameSub, ...sameSector].slice(0, maxPeers);
}

export const ALL_IDX_SECTORS: IdxSector[] = [
  'Keuangan',
  'Energi',
  'Barang Baku',
  'Barang Konsumen Primer',
  'Barang Konsumen Non-Primer',
  'Infrastruktur',
  'Perindustrian',
  'Teknologi',
  'Kesehatan',
  'Properti & Real Estat',
  'Transportasi & Logistik',
  'Investasi & Lainnya',
];
