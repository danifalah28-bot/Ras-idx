export type IdxSector =
  | 'Keuangan'
  | 'Energi'
  | 'Barang Baku'
  | 'Barang Konsumen Primer'
  | 'Barang Konsumen Non-Primer'
  | 'Infrastruktur'
  | 'Perindustrian'
  | 'Teknologi'
  | 'Kesehatan'
  | 'Properti & Real Estat'
  | 'Transportasi & Logistik'
  | 'Investasi & Lainnya';

export type LampStatus =
  | 'BREAKOUT_RESISTANCE'
  | 'AT_SUPPORT'
  | 'BREAKDOWN_SUPPORT'
  | 'NEUTRAL';

export type ListingBoard = 'Utama' | 'Pengembangan' | 'Akselerasi' | 'Pemantauan Khusus';

export interface StockRecord {
  ticker: string;
  name: string;
  sector: IdxSector;
  subSector: string;
  board: ListingBoard;
  indexTags: string[]; // e.g., ['LQ45', 'IDX30', 'Kompas100']
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  volumeShares: number; // shares traded today
  marketCapT: number; // Triliun IDR

  // Fundamentals (Keuangan)
  revenueT: number; // Annualized Revenue (Triliun IDR)
  netProfitT: number; // Annualized Net Profit (Triliun IDR)
  grossMarginPct: number;
  netMarginPct: number;
  roePct: number;
  roaPct: number;
  der: number; // Debt to Equity Ratio (x)
  currentRatio: number; // Current Ratio (x)
  per: number; // Price to Earnings Ratio (x)
  pbv: number; // Price to Book Value (x)
  evEbitda: number;
  divYieldPct: number;
  epsGrowthPct: number;
  freeCashFlowT: number;

  // Liquidity (Likuiditas)
  adtvB: number; // Average Daily Transaction Value (Miliar IDR)
  turnoverPct: number; // Daily turnover vs free-float market cap
  freeFloatPct: number;
  bidAskSpreadBps: number;
  bidVolumeRatio: number; // 0-100 (% bid strength vs offer)

  // Inflow / Outflow (Aliran Dana Institusi & Asing)
  inflow1DB: number; // Net flow 1 day (Miliar IDR, + inflow, - outflow)
  inflow1WB: number; // Net flow 1 week / 5D (Miliar IDR)
  inflow1MB: number; // Net flow 1 month (Miliar IDR)
  foreignFlow1WB: number; // Foreign net buy/sell 1 week (Miliar IDR)
  flowHistory5D: number[]; // 5 daily bars in Miliar IDR
  accumulationScore: number; // -100 to +100

  // Technical & Support/Resistance Lamp
  s2: number;
  s1: number;
  pivot: number;
  r1: number;
  r2: number;
  ma20: number;
  ma50: number;
  rsi14: number;
  macdBullish: boolean;
  lampStatus: LampStatus;
  lampDetail: string;

  // Screener composites
  financialHealthScore: number; // 0-100
  isHealthyFinancial: boolean;
  isStrong1WInflow: boolean;
  isTechnicalBullish: boolean;
  isCompositeScreenerMatch: boolean;
  dataSource: 'live-yahoo' | 'live-idx-stream';
  lastUpdated: string;
  sharesOutstandingB?: number;
  financialCurrency?: string;
  corporateActionNote?: string;
  isEstimatedOrderbook?: boolean;
}

export interface PeerSeries {
  ticker: string;
  name: string;
  subSector: string;
  color: string;
  currentPrice: number;
  changePct: number;
  inflow1WB: number;
  per: number;
  roePct: number;
  points: {
    timestamp: string;
    label: string;
    price: number;
    pctChange: number;
  }[];
}

export interface PeerComparisonResponse {
  primaryTicker: string;
  sector: IdxSector;
  subSector: string;
  timeframe: '1D' | '5D' | '1M';
  peers: PeerSeries[];
  supportResistance: {
    s2: number;
    s1: number;
    pivot: number;
    r1: number;
    r2: number;
    lampStatus: LampStatus;
    lampDetail: string;
  };
  accurateSummary: string;
  updatedAt: string;
}

export interface CommodityItem {
  symbol: string;
  name: string;
  price: string;
  changePct: number;
  impactOnIdx: string;
  affectedSectors: IdxSector[];
}

export interface GeopoliticalEvent {
  title: string;
  region: string;
  severity: 'Tinggi' | 'Sedang' | 'Rendah';
  summary: string;
  idxImpact: string;
  url?: string;
  relatedTickers?: string[];
  affectedSectors?: IdxSector[];
  timestamp: string;
}

export interface MacroLiveResponse {
  ihsg: {
    value: number;
    change: number;
    changePct: number;
  };
  ihsgHistory?: {
    date: string;
    value: number;
  }[];
  usdIdr: {
    value: number;
    changePct: number;
  };
  biRate: string;
  fedRate: string;
  commodities: CommodityItem[];
  geopolitics: GeopoliticalEvent[];
  worldSummary: string;
  sources: { title: string; uri: string }[];
  aiSynthesized?: boolean;
  updatedAt: string;
}

export type GeopoliticsFocusArea =
  | 'ALL'
  | 'TARIFF_SUPPLY'
  | 'ENERGY_CONFLICT'
  | 'RATES_FX'
  | 'DOWNSTREAM_POLICY';

export type ResearchHorizon = '6-12M' | '12-24M';

export interface GeopoliticalTransmissionChannel {
  channel: string;
  direction: 'Positif' | 'Negatif' | 'Campuran';
  intensity: 'Tinggi' | 'Sedang' | 'Rendah';
  mechanism: string;
}

export interface GeopoliticalMonitoringTrigger {
  indicator: string;
  threshold: string;
  implication: string;
}

export interface DeepResearchResult {
  ticker: string;
  companyName: string;
  horizon?: ResearchHorizon;
  focusArea?: GeopoliticsFocusArea;
  exposureSummary?: string;
  futureOutlook: string;
  geopoliticalAnalysis: string;
  commoditySensitivity: string;
  transmissionChannels?: GeopoliticalTransmissionChannel[];
  globalChallenges: string[];
  monitoringTriggers?: GeopoliticalMonitoringTrigger[];
  scenarios: {
    name: 'Bull Case' | 'Base Case' | 'Bear Case';
    probability: string;
    targetBias: string;
    catalyst: string;
    description: string;
  }[];
  executiveVerdict: string;
  sources: { title: string; uri: string }[];
  modelUsed: string;
  cached?: boolean;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  thinkingUsed?: boolean;
  sources?: { title: string; uri: string }[];
  timestamp: string;
}

export type CandleTimeframe = '15m' | '1H' | '1D' | '1W';

export interface CandleBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandleResponse {
  ticker: string;
  timeframe: CandleTimeframe;
  source: 'live-yahoo' | 'live-idx-stream';
  candles: CandleBar[];
  updatedAt: string;
}

export interface QuarterlyFinancialItem {
  quarter: string;
  periodLabel: string;
  revenueT: number;
  grossProfitT: number;
  operatingProfitT: number;
  netProfitT: number;
  epsIdr: number;
  grossMarginPct: number;
  netMarginPct: number;
  roePct: number;
  der: number;
  operatingCashFlowT: number;
  freeCashFlowT: number;
  revenueYoYPct: number;
  netProfitYoYPct: number;
  netProfitQoQPct: number;
}

export interface QuarterlyResearchResponse {
  ticker: string;
  companyName: string;
  sector: IdxSector;
  quarters: QuarterlyFinancialItem[];
  ttmRevenueT: number;
  ttmNetProfitT: number;
  yoyRevenueGrowthPct: number;
  yoyProfitGrowthPct: number;
  marginTrend: 'Ekspansi' | 'Stabil' | 'Tertekan';
  earningsQualityRatio: number;
  summary: string;
  source: 'live-yahoo' | 'idx-financial-model';
  financialCurrency?: string;
  usdIdrRateUsed?: number;
  updatedAt: string;
}

export interface RegulatoryUpdateItem {
  id: string;
  authority: 'OJK' | 'BEI';
  category:
    | 'Regulasi & Siaran Pers'
    | 'Keterbukaan Informasi'
    | 'Pengawasan / UMA / Suspensi'
    | 'Laporan Keuangan & Aksi Korporasi';
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  detectedTickers: string[];
}

export interface IdxMarketStatusInfo {
  phase: 'OPEN_SESSION_1' | 'BREAK' | 'OPEN_SESSION_2' | 'PRE_OPEN' | 'PRE_CLOSE' | 'CLOSED';
  label: string;
  wibTime: string;
  isOpen: boolean;
}

export interface OjkBeiLiveSyncResponse {
  ojkUpdates: RegulatoryUpdateItem[];
  beiUpdates: RegulatoryUpdateItem[];
  combinedFeed: RegulatoryUpdateItem[];
  syncIntervalSec: number;
  liveYahooSyncedCount: number;
  totalTrackedStocks: number;
  lastMarketTickAt: string;
  lastRegulatorySyncAt: string;
  marketStatus?: IdxMarketStatusInfo;
}

export interface CompanyInvestorLink {
  label: string;
  url: string;
}

export interface CompanyOfficialUpdateItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category:
    | 'Website Resmi Emiten'
    | 'Keterbukaan BEI'
    | 'Regulasi OJK'
    | 'Laporan & Aksi Korporasi';
}

export interface CompanyOfficialSyncResponse {
  ticker: string;
  companyName: string;
  officialWebsite: string | null;
  officialDomain: string | null;
  websiteStatus: 'Terhubung' | 'Terverifikasi BEI/OJK' | 'Mencari Domain Resmi';
  websiteTitle: string;
  corporateDescription: string;
  ceo?: string;
  founded?: string;
  employees?: string;
  headquarters?: string;
  sectorOfficial?: string;
  industryOfficial?: string;
  investorLinks: CompanyInvestorLink[];
  officialUpdates: CompanyOfficialUpdateItem[];
  pdfDocuments?: { title: string; url: string; summary: string }[];
  corporateActionNote?: string;
  syncIntervalSec: number;
  lastSyncedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'analyst';
  createdAt: string;
}

export interface PriceAlertRule {
  id: string;
  userId: string;
  ticker: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  note: string;
  active: boolean;
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface MarketNotificationItem {
  id: string;
  kind: 'price_target' | 'signal' | 'ojk_bei' | 'news';
  title: string;
  message: string;
  ticker?: string;
  url?: string;
  timestamp: string;
  read: boolean;
}

export interface DailyArticleItem {
  id: string;
  slug: string;
  category:
    | 'Ringkasan Pasar Harian'
    | 'Riset Emiten & Sektor'
    | 'Regulasi OJK & BEI'
    | 'Makro & Komoditas';
  title: string;
  summary: string;
  content: string[];
  author: string;
  publishedAt: string;
  readTimeMin: number;
  featuredTickers: string[];
  sources?: { title: string; uri: string }[];
}

