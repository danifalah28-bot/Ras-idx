import assert from 'node:assert/strict';
import http from 'node:http';
import { createDemoServer, tickMarket } from './server.js';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

async function runTests() {
  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 3000;
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Verify /health endpoint
    const health = await getJson(`${baseUrl}/health`);
    assert.equal(health.status, 200, 'GET /health harus mengembalikan HTTP 200');
    assert.equal(health.data.status, 'ok', 'health.status harus ok');
    assert.equal(health.data.mode, 'online-realtime', 'mode server harus online-realtime');
    assert.ok(health.data.totalStocks > 0, 'totalStocks harus > 0');
    console.log('[PASS] GET /health -> 200 ok (online-realtime)');

    // 2. Verify /market.json schema & OJK/BEI + officialWebsite fields
    const first = await getJson(`${baseUrl}/market.json`);
    assert.equal(first.status, 200, 'GET /market.json harus mengembalikan HTTP 200');
    assert.equal(first.data.app, 'RAS Terminal');
    assert.ok(typeof first.data.ihsg?.value === 'number', 'ihsg.value harus angka');
    assert.ok(Array.isArray(first.data.stocks) && first.data.stocks.length >= 5, 'stocks array harus terisi');
    assert.ok(first.data.stocks.every((s) => s.ticker && s.officialWebsite), 'Setiap emiten harus memiliki ticker & officialWebsite');
    assert.equal(first.data.ojkBeiSync?.status, 'Sinkron Otomatis');
    console.log(`[PASS] GET /market.json -> ${first.data.stocks.length} emiten valid`);

    // 3. Verify real online sync fetches live Yahoo Finance quotes & updates market snapshot
    const beforeTick = first.data.tickCount;
    await tickMarket();
    const second = await getJson(`${baseUrl}/market.json`);
    assert.equal(second.data.tickCount, beforeTick + 1, 'tickCount harus bertambah setelah sinkronisasi online');
    assert.ok(second.data.liveYahooSyncedCount >= 5, 'Minimal 5 emiten tersinkronisasi live dari Yahoo Finance .JK');
    const bbcaAfter = second.data.stocks.find((s) => s.ticker === 'BBCA');
    assert.equal(bbcaAfter.dataSource, 'live-yahoo', 'BBCA harus bertanda live-yahoo setelah sinkronisasi online');
    console.log(
      `[PASS] Online sync -> BBCA Rp ${bbcaAfter.price} (${bbcaAfter.dataSource}), ${second.data.liveYahooSyncedCount}/${second.data.totalStocks} emiten live`
    );

    console.log('Semua tes integrasi berhasil (3/3 PASS).');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runTests().catch((err) => {
  console.error('[FAIL] Tes integrasi gagal:', err);
  process.exit(1);
});
