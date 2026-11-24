# Panduan Mengubah Web App RAS.IDX Terminal Menjadi APK Android

Aplikasi web ini sudah dikonfigurasi penuh sebagai **PWA (Progressive Web App)** sekaligus dilengkapi file konfigurasi **TWA (Bubblewrap/PWABuilder)** dan **Capacitor Android** agar bisa diubah menjadi file `.apk` Android tanpa menghilangkan data live BEI, chart TradingView, Orderbook, Watchlist, dan riset AI.

---

## Ringkasan Konfigurasi Aplikasi

- **Package ID**: `id.rasidx.terminal`
- **Nama Aplikasi**: `RAS.IDX Terminal` (`short_name`: `RAS.IDX`)
- **Theme & Splash Color**: `#060a0f`
- **URL Aplikasi Live**: `https://ais-pre-44u5bfox3uoyejinxjlds7-374353743788.asia-northeast1.run.app/`
- **Web App Manifest**: `/manifest.webmanifest`
- **Digital Asset Links**: `/.well-known/assetlinks.json`
- **Ikon Aplikasi**:
  - `pwa-192x192.png` (192x192 PNG)
  - `pwa-512x512.png` (512x512 PNG)
  - `pwa-maskable-512x512.png` (512x512 Maskable PNG)
  - `apple-touch-icon.png` (180x180 PNG)
  - `icon.svg` (Vector)

> **Catatan Penting Arsitektur Full-Stack:**
> Aplikasi ini memiliki backend Express (`/api/stocks`, `/api/market/stream`, `/api/stocks/:ticker/candles`, `/api/macro/live`, `/api/ojk-bei/live`, Gemini AI, dll.). Oleh karena itu, APK Android harus memuat URL server HTTPS live (baik lewat metode **TWA/PWABuilder** maupun **Capacitor `server.url`**) agar seluruh streaming harga BEI & API berjalan normal di HP Android.

---

## Cara 1: Paling Cepat Tanpa Coding (PWABuilder)

1. Pastikan proyek sudah di-publish / memiliki URL HTTPS aktif (misalnya `Shared App URL` Anda).
2. Buka **https://www.pwabuilder.com** di browser.
3. Masukkan URL aplikasi Anda, lalu klik **Start**.
4. PWABuilder akan otomatis mendeteksi `/manifest.webmanifest`, Service Worker, dan ikon `192x192` + `512x512`.
5. Klik **Package for Stores** -> pilih **Android** -> **Generate Package**.
6. Unduh file ZIP hasil PWABuilder — di dalamnya sudah langsung berisi file **`.apk`** siap instal dan **`assetlinks.json`**.
7. *(Opsional)* Agar bar URL Chrome tidak muncul di atas aplikasi, salin nilai `sha256_cert_fingerprints` dari hasil PWABuilder ke environment variable `ANDROID_SHA256_FINGERPRINT` atau file `public/.well-known/assetlinks.json`.

---

## Cara 2: Build APK Otomatis di Cloud (GitHub Actions — Tanpa Android Studio)

1. Unduh **`ras-idx-terminal-source.zip`** dari footer aplikasi dan ekstrak.
2. Upload seluruh folder proyek ke repository GitHub Anda (file `.github/workflows/build-android-apk.yml` sudah tersedia).
3. Di GitHub repository, buka tab **Actions** -> pilih workflow **Build Android APK (RAS.IDX Terminal)** -> klik **Run workflow**.
4. Tunggu ~3–5 menit hingga selesai, lalu unduh artifact **`RAS_IDX_Terminal-debug-apk`** yang berisi file `app-debug.apk`.

---

## Cara 3: Build Lokal dengan Capacitor + Android Studio

```bash
# 1. Masuk ke folder source code
npm install
npm run build

# 2. Pasang Capacitor Android
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android

# 3. Buka di Android Studio untuk build APK / AAB
npx cap open android
# Di Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## Cara 4: Build Lokal dengan Bubblewrap CLI (Google TWA)

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://ais-pre-44u5bfox3uoyejinxjlds7-374353743788.asia-northeast1.run.app/manifest.webmanifest"
bubblewrap build
```

Output: `app-release-signed.apk` siap diinstal di Android!
