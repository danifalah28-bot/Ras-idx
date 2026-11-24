import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 3000);

const TRACKED_STOCKS = [
  {
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Keuangan',
    price: 5550,
    prevClose: 5600,
    inflow1WB: 842.6,
    officialWebsite: 'https://www.bca.co.id',
  },
  {
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia (Persero) Tbk',
    sector: 'Keuangan',
    price: 3080,
    prevClose: 3110,
    inflow1WB: -185.0,
    officialWebsite: 'https://bri.co.id',
  },
  {
    ticker: 'BMRI',
    name: 'Bank Mandiri (Persero) Tbk',
    sector: 'Keuangan',
    price: 4520,
    prevClose: 4550,
    inflow1WB: 615.4,
    officialWebsite: 'https://www.bankmandiri.co.id',
  },
  {
    ticker: 'TLKM',
    name: 'Telkom Indonesia (Persero) Tbk',
    sector: 'Infrastruktur',
    price: 2790,
    prevClose: 2750,
    inflow1WB: 194.2,
    officialWebsite: 'https://www.telkom.co.id',
  },
  {
    ticker: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Perindustrian',
    price: 5150,
    prevClose: 5075,
    inflow1WB: 210.5,
    officialWebsite: 'https://www.astra.co.id',
  },
  {
    ticker: 'ADRO',
    name: 'Alamtri Resources Indonesia Tbk',
    sector: 'Energi',
    price: 2490,
    prevClose: 2430,
    inflow1WB: 312.0,
    officialWebsite: 'https://www.alamtri.com',
  },
  {
    ticker: 'AMMN',
    name: 'Amman Mineral Internasional Tbk',
    sector: 'Barang Baku',
    price: 9250,
    prevClose: 9100,
    inflow1WB: 276.4,
    officialWebsite: 'https://www.amman.co.id',
  },
];

let state = {
  ihsg: 5146.33,
  ihsgPrevClose: 5170.0,
  usdIdr: 16280,
  ihsgSource: 'baseline',
  tickCount: 0,
  lastRegulatorySyncAt: new Date().toISOString(),
  latestRegulatoryTitle: 'Menunggu sinkronisasi keterbukaan OJK & BEI...',
  stocks: TRACKED_STOCKS.map((s) => ({
    ...s,
    change: s.price - s.prevClose,
    changePct: Number((((s.price - s.prevClose) / s.prevClose) * 100).toFixed(2)),
    lampStatus: s.price > s.prevClose ? 'BREAKOUT_RESISTANCE' : 'AT_SUPPORT',
    dataSource: 'baseline',
    lastUpdated: new Date().toISOString(),
  })),
};

async function fetchYahooSymbol(symbol) {
  const primary = symbol.charCodeAt(0) % 2 === 0 ? 'query1.finance.yahoo.com' : 'query2.finance.yahoo.com';
  const secondary = primary === 'query1.finance.yahoo.com' ? 'query2.finance.yahoo.com' : 'query1.finance.yahoo.com';

  for (const host of [primary, secondary]) {
    const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=15m`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const price = Number(meta?.regularMarketPrice);
      const prevClose = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? price);
      if (!Number.isFinite(price) || price <= 0) continue;
      return {
        price,
        prevClose: Number.isFinite(prevClose) && prevClose > 0 ? prevClose : price,
        high: Number(meta?.regularMarketDayHigh) || price,
        low: Number(meta?.regularMarketDayLow) || price,
        volume: Number(meta?.regularMarketVolume) || 0,
      };
    } catch {
      // Retry secondary host
    }
  }
  return null;
}

async function fetchLatestRegulatoryTitle() {
  try {
    const query = '(OJK OR BEI OR "Bursa Efek Indonesia" OR "keterbukaan informasi") saham';
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(2800),
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const match = xml.match(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/i);
    if (!match?.[1]) return null;
    return match[1]
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  } catch {
    return null;
  }
}

export async function tickMarket() {
  const now = new Date().toISOString();
  state.tickCount += 1;

  const [ihsgQuote, usdQuote, regTitle, ...stockQuotes] = await Promise.all([
    fetchYahooSymbol('^JKSE'),
    fetchYahooSymbol('IDR=X'),
    fetchLatestRegulatoryTitle(),
    ...state.stocks.map((s) => fetchYahooSymbol(`${s.ticker}.JK`)),
  ]);

  if (ihsgQuote) {
    state.ihsg = Number(ihsgQuote.price.toFixed(2));
    state.ihsgPrevClose = Number(ihsgQuote.prevClose.toFixed(2));
    state.ihsgSource = 'live-yahoo';
  }
  if (usdQuote) {
    state.usdIdr = Math.round(usdQuote.price);
  }
  if (regTitle) {
    state.latestRegulatoryTitle = regTitle;
    state.lastRegulatorySyncAt = now;
  }

  state.stocks = state.stocks.map((s, idx) => {
    const q = stockQuotes[idx];
    if (!q) return s;
    const nextPrice = Math.round(q.price);
    const prevClose = Math.round(q.prevClose);
    const change = nextPrice - prevClose;
    const changePct = Number(((change / Math.max(1, prevClose)) * 100).toFixed(2));
    return {
      ...s,
      price: nextPrice,
      prevClose,
      change,
      changePct,
      dayHigh: Math.round(q.high),
      dayLow: Math.round(q.low),
      volumeShares: Math.round(q.volume),
      lampStatus: changePct >= 1.2 ? 'BREAKOUT_RESISTANCE' : changePct <= -1.0 ? 'AT_SUPPORT' : 'NEUTRAL',
      dataSource: 'live-yahoo',
      lastUpdated: now,
    };
  });

  return getMarketSnapshot();
}

export function getMarketSnapshot() {
  const ihsgChange = Number((state.ihsg - state.ihsgPrevClose).toFixed(2));
  const ihsgChangePct = Number(((ihsgChange / Math.max(1, state.ihsgPrevClose)) * 100).toFixed(2));
  const liveYahooSyncedCount = state.stocks.filter((s) => s.dataSource === 'live-yahoo').length;

  return {
    app: 'RAS Terminal',
    mode: 'online-realtime',
    tickCount: state.tickCount,
    liveYahooSyncedCount,
    ihsg: {
      value: state.ihsg,
      change: ihsgChange,
      changePct: ihsgChangePct,
      dataSource: state.ihsgSource,
    },
    usdIdr: {
      value: state.usdIdr,
    },
    ojkBeiSync: {
      status: 'Sinkron Otomatis',
      lastRegulatorySyncAt: state.lastRegulatorySyncAt,
      latestHeadline: state.latestRegulatoryTitle,
    },
    totalStocks: state.stocks.length,
    stocks: state.stocks,
    updatedAt: new Date().toISOString(),
  };
}

export function createDemoServer() {
  return http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/market.json' || pathname === '/api/market.json') {
      res.writeHead(200);
      res.end(JSON.stringify(getMarketSnapshot(), null, 2));
      return;
    }

    if (pathname === '/health' || pathname === '/api/health') {
      const liveYahooSyncedCount = state.stocks.filter((s) => s.dataSource === 'live-yahoo').length;
      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: 'ok',
          mode: 'online-realtime',
          totalStocks: state.stocks.length,
          liveYahooSyncedCount,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    if (pathname === '/') {
      res.writeHead(200);
      res.end(
        JSON.stringify(
          {
            app: 'RAS Terminal Online Server',
            mode: 'online-realtime',
            endpoints: ['/market.json', '/health'],
          },
          null,
          2
        )
      );
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
  });
}

const currentFile = fileURLToPath(import.meta.url);
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFile === entryFile) {
  const server = createDemoServer();
  void tickMarket();
  const timer = setInterval(() => {
    void tickMarket();
  }, 10_000);
  timer.unref();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`RAS Terminal Online Server aktif di http://localhost:${PORT}/market.json`);
  });
}
