import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Globe2, GraduationCap, RefreshCw, Sparkles } from 'lucide-react';
import type { DailyArticleItem } from '../types/market';

interface ArticlesResearchPageProps {
  articles: DailyArticleItem[];
  loading: boolean;
  initialArticleId?: string | null;
  onRefreshArticles: () => void;
  onArticleCreated: (article: DailyArticleItem) => void;
  onOpenTickerAnalysis: (ticker: string) => void;
}

type CategoryFilter = 'ALL' | DailyArticleItem['category'] | 'EDUKASI';

const EDUCATION_GUIDES = [
  {
    tag: 'Komoditas',
    title: 'Harga Komoditas & Dampaknya ke Saham Tambang',
    body: 'Pergerakan harga nikel, batu bara, dan emas memengaruhi margin laba emiten tambang secara langsung. Pantau juga kebijakan kuota ekspor domestik serta permintaan manufaktur dan energi dari mitra dagang utama sebelum menilai keberlanjutan arus kas emiten sumber daya alam.',
    tickers: ['ADRO', 'AMMN', 'ANTM', 'INCO'],
  },
  {
    tag: 'Likuiditas & Arus Dana',
    title: 'Cara Membaca Aliran Dana Asing (Net Foreign Flow)',
    body: 'Net foreign buy maupun net foreign sell menunjukkan arah akumulasi atau distribusi investor institusional global, tetapi harus dibaca bersama rata-rata nilai transaksi (ADTV) dan posisi tren MA20 agar tidak terjebak reli sesaat dengan volume tipis.',
    tickers: ['BBCA', 'BBRI', 'BMRI', 'TLKM'],
  },
  {
    tag: 'Teknikal S/R',
    title: 'Support & Resisten: Membaca Area Reaksi Harga',
    body: 'Level Support S1/S2 dan Resisten R1/R2 merupakan referensi area tempat tekanan beli atau ambil untung kerap muncul. RAS.IDX Terminal menghitung Floor Pivot klasik dari rentang sesi perdagangan harian sebelumnya dan menampilkannya pada Lampu Indikator serta garis horizontal candlestick.',
    tickers: ['ASII', 'PGAS', 'MDKA'],
  },
  {
    tag: 'Indikator Momentum',
    title: 'RSI(14), MACD & MA20: Memadukan Momentum dan Tren',
    body: 'RSI di atas 70 menandakan momentum mulai memasuki zona jenuh beli (overbought) dan di bawah 30 menunjukkan jenuh jual (oversold), sedangkan MA20 membantu menyaring arah tren jangka menengah. Sinyal efektif muncul saat breakout terkonfirmasi di atas MA20 dengan histogram MACD positif.',
    tickers: ['ICBP', 'AMMN', 'BRMS'],
  },
  {
    tag: 'Kedalaman Pasar (Order Book)',
    title: 'Memahami Market Depth: Bid, Offer, Spread & Tembok Antrean',
    body: 'Bid adalah antrean harga beli, Offer adalah antrean harga jual, dan selisih harga terbaik keduanya disebut Spread. Grafik kedalaman pasar (Market Depth) menjumlahkan volume lot secara kumulatif—area menumpuk (Tembok Bid/Offer) sering menandai batas psikologis penahan harga.',
    tickers: ['BBCA', 'BBRI', 'BMRI'],
  },
  {
    tag: 'Aturan Bursa (BEI)',
    title: 'Fraksi Harga Resmi BEI (Peraturan II-A) & Nilai 1 Lot',
    body: 'Kenaikan atau penurunan harga saham BEI mengikuti fraksi kelipatan resmi: Rp1 untuk harga di bawah Rp200, Rp2 (Rp200–<500), Rp5 (Rp500–<2.000), Rp10 (Rp2.000–<5.000), dan Rp25 untuk Rp5.000 ke atas. Karena 1 lot berisi 100 lembar saham, pergerakan 1 tick bernilai 100 × fraksi per lot.',
    tickers: ['GOTO', 'ASII', 'TLKM'],
  },
];

const GEOPOLITICS_GUIDES = [
  {
    tag: 'Energi & Safe Haven',
    title: 'Ketegangan Timur Tengah -> Minyak Mentah & Emas',
    impact: 'Menguat: emiten migas & emas · Tertekan: maskapai, logistik',
    body: 'Eskalasi geopolitik di jalur pasokan energi biasanya memicu lonjakan harga minyak mentah dan permintaan aset lindung nilai seperti emas, sekaligus menekan biaya bahan bakar sektor transportasi.',
  },
  {
    tag: 'Logam Industri & Baterai',
    title: 'Kebijakan Ekspor Nikel & Rantai Pasok EV',
    impact: 'Sensitif: emiten pertambangan nikel, tembaga & hilirisasi smelter',
    body: 'Perubahan kuota bijih, tarif ekspor, maupun siklus permintaan baterai kendaraan listrik global berdampak langsung pada harga acuan logam dan marjin pemurnian.',
  },
  {
    tag: 'Perdagangan & Nilai Tukar',
    title: 'Dinamika Tarif Dagang Global & Kurs Rupiah',
    impact: 'Sensitif: emiten ekspor CPO, batu bara, dan emiten impor bahan baku',
    body: 'Kebijakan tarif lintas negara dapat menggeser arus ekspor komoditas dan memengaruhi stabilitas USD/IDR, yang selanjutnya tercermin pada pendapatan berdenominasi dolar atau beban impor bahan baku.',
  },
  {
    tag: 'Kebijakan Moneter Global',
    title: 'Suku Bunga The Fed, BI Rate & Rotasi Dana Asing',
    impact: 'Sensitif: perbankan berkapitalisasi besar, properti & telekomunikasi',
    body: 'Ekspektasi penurunan atau bertahan tingginya suku bunga AS mengarahkan arus modal ke pasar berkembang; perbankan besar berfundamental kuat umumnya menjadi barometer utama masuknya likuiditas.',
  },
];

export function ArticlesResearchPage({
  articles,
  loading,
  initialArticleId,
  onRefreshArticles,
  onArticleCreated,
  onOpenTickerAnalysis,
}: ArticlesResearchPageProps) {
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(initialArticleId ?? null);
  const [topicInput, setTopicInput] = useState<string>('');
  const [tickerInput, setTickerInput] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (initialArticleId) {
      setSelectedId(initialArticleId);
      setCategory('ALL');
    }
  }, [initialArticleId]);

  const filteredArticles = useMemo(() => {
    if (category === 'ALL' || category === 'EDUKASI') return articles;
    return articles.filter((a) => a.category === category);
  }, [articles, category]);

  const activeArticle = useMemo(() => {
    if (selectedId) {
      const found = articles.find((a) => a.id === selectedId);
      if (found) return found;
    }
    return filteredArticles[0] ?? articles[0] ?? null;
  }, [articles, filteredArticles, selectedId]);

  const handleGenerateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch('/api/articles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicInput.trim(),
          ticker: tickerInput.trim().toUpperCase(),
        }),
      });
      const json = (await res.json()) as { article?: DailyArticleItem; error?: string };
      if (!res.ok || !json.article) {
        setGenError(json.error || 'Gagal menyusun artikel riset AI.');
        return;
      }
      onArticleCreated(json.article);
      setCategory('ALL');
      setSelectedId(json.article.id);
      setTopicInput('');
      setTickerInput('');
    } catch {
      setGenError('Gagal terhubung ke layanan riset AI.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* v17 Berita Pasar Header & Filter Chips */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#1d2833]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
              <span className="font-semibold text-emerald-700 dark:text-[#00e08a]">
                Pasar &amp; Emiten Indonesia
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{articles.length} publikasi live</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
              Berita Pasar, Riset Harian &amp; Edukasi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#8d9aa8]">
              Ikuti perkembangan pasar modal, kebijakan moneter, regulasi OJK/BEI, serta panduan riset emiten.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshArticles}
            disabled={loading}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:hover:border-[#2a3846]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Berita</span>
          </button>
        </div>

        {/* v17 Pill Filter Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'ALL', label: 'Semua' },
              { id: 'Ringkasan Pasar Harian', label: 'Pasar Harian' },
              { id: 'Riset Emiten & Sektor', label: 'Emiten & Sektor' },
              { id: 'Regulasi OJK & BEI', label: 'OJK & BEI' },
              { id: 'Makro & Komoditas', label: 'Makro & Komoditas' },
              { id: 'EDUKASI', label: 'Panduan & Edukasi' },
            ] as { id: CategoryFilter; label: string }[]
          ).map((tab) => {
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-emerald-500/45 bg-emerald-50 text-emerald-800 dark:border-[#00e08a]/45 dark:bg-[#00e08a]/12 dark:text-[#00e08a]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Custom AI Daily Brief Generator */}
        <form
          onSubmit={handleGenerateArticle}
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end dark:border-[#1d2833] dark:bg-[#0b1219]"
        >
          <div className="flex-1">
            <label htmlFor="gen-topic" className="block text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">
              Topik Riset Tambahan (Opsional)
            </label>
            <input
              id="gen-topic"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Contoh: Prospek dividen perbankan besar atau dampak harga batubara..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#00e08a] focus:outline-none dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8]"
            />
          </div>
          <div className="w-full lg:w-36">
            <label htmlFor="gen-ticker" className="block text-xs font-medium text-slate-700 dark:text-[#cbd5e1]">
              Kode Saham
            </label>
            <input
              id="gen-ticker"
              type="text"
              maxLength={6}
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              placeholder="BBCA"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs font-bold uppercase text-slate-900 placeholder:text-slate-400 focus:border-[#00e08a] focus:outline-none dark:border-[#1d2833] dark:bg-[#131b25] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8]"
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] px-4 py-2 text-xs font-extrabold text-[#03130b] transition-all hover:brightness-105 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {generating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{generating ? 'Menyusun...' : 'Buat Artikel Riset AI'}</span>
          </button>
        </form>

        {genError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-800 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#ff9aa2]">
            {genError}
          </div>
        )}
      </section>

      {category === 'EDUKASI' ? (
        <div className="space-y-6">
          <section className="rounded-[20px] border border-slate-200 bg-white p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <GraduationCap className="h-5 w-5 text-emerald-700 dark:text-[#00e08a]" />
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
                  Artikel Edukasi Teknikal &amp; Arus Likuiditas
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                  Panduan praktis membaca indikator Support/Resisten, RSI(14), MA20, komoditas, dan dana asing di BEI
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {EDUCATION_GUIDES.map((guide) => (
                <article
                  key={guide.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-[#1d2833] dark:bg-[#131b25]"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-700 dark:text-[#00e08a]">
                      {guide.tag}
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#c4cfda]">
                      {guide.body}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3 dark:border-[#1d2833]">
                    <span className="text-[11px] text-slate-500 dark:text-[#8d9aa8]">Contoh Emiten:</span>
                    {guide.tickers.map((tk) => (
                      <button
                        key={tk}
                        type="button"
                        onClick={() => onOpenTickerAnalysis(tk)}
                        className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 hover:border-emerald-500 dark:border-[#00e08a]/35 dark:bg-[#0e141c] dark:text-[#00e08a] dark:hover:border-[#00e08a]"
                      >
                        {tk}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-slate-200 bg-white p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-[#1d2833]">
              <Globe2 className="h-5 w-5 text-emerald-700 dark:text-[#00e08a]" />
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-[#eaf1f7]">
                  Peta Dampak Geopolitik &amp; Makro Global ke Sektor BEI
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
                  Kerangka cepat membaca transmisi sentimen global terhadap emiten domestik Indonesia
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {GEOPOLITICS_GUIDES.map((geo) => (
                <article
                  key={geo.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-[#1d2833] dark:bg-[#131b25]"
                >
                  <div className="text-xs font-bold text-amber-700 dark:text-[#ffb020]">{geo.tag}</div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 dark:text-[#eaf1f7]">
                    {geo.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-[#00e08a]">
                    Dampak: {geo.impact}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#c4cfda]">
                    {geo.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Split Layout: v17 Article Cards + Full Reader */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left List */}
          <aside className="space-y-3 lg:col-span-5">
            {filteredArticles.map((art) => {
              const isSelected = activeArticle?.id === art.id;
              return (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedId(art.id)}
                  className={`w-full rounded-[18px] border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-emerald-500/55 bg-emerald-50/50 dark:border-[#00e08a]/50 dark:bg-[#00e08a]/8'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[#1d2833] dark:bg-[#0e141c] dark:hover:bg-[#131b25]'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                    <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 dark:bg-[#00e08a]/12 dark:text-[#00e08a]">
                      {art.category}
                    </span>
                    <span>{art.readTimeMin} mnt baca</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(art.publishedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        timeZone: 'Asia/Jakarta',
                      })}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-sm sm:text-base font-bold leading-snug text-slate-900 dark:text-[#eaf1f7]">
                    {art.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
                    {art.summary}
                  </p>
                </button>
              );
            })}
          </aside>

          {/* Right Full Reader */}
          <main className="rounded-[20px] border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7 dark:border-[#1d2833] dark:bg-[#0e141c]">
            {!activeArticle ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-[#2a3846]" />
                <p className="mt-2">Pilih artikel di sebelah kiri untuk membaca laporan lengkap.</p>
              </div>
            ) : (
              <article className="max-w-[70ch]">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-[#00e08a]/12 dark:text-[#00e08a]">
                    {activeArticle.category}
                  </span>
                  <span>{activeArticle.author}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {new Date(activeArticle.publishedAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'Asia/Jakarta',
                    })}{' '}
                    WIB
                  </span>
                </div>

                <h2 className="mt-3 font-display text-2xl leading-snug font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7]">
                  {activeArticle.title}
                </h2>

                <p className="mt-3 border-b border-slate-100 pb-4 text-sm font-medium leading-relaxed text-slate-700 dark:border-[#1d2833] dark:text-[#c4cfda]">
                  {activeArticle.summary}
                </p>

                <div className="mt-5 space-y-4 text-[15px] leading-[1.7] text-slate-700 dark:text-[#c4cfda]">
                  {activeArticle.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {activeArticle.featuredTickers.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
                    <div className="text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
                      Emiten Terkait dalam Riset Ini
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {activeArticle.featuredTickers.map((tk) => (
                        <button
                          key={tk}
                          type="button"
                          onClick={() => onOpenTickerAnalysis(tk)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 font-mono text-xs font-bold text-emerald-800 transition-colors hover:border-emerald-500 dark:border-[#00e08a]/35 dark:bg-[#00e08a]/10 dark:text-[#00e08a] dark:hover:border-[#00e08a]"
                        >
                          <span>Analisis {tk}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeArticle.sources && activeArticle.sources.some((s) => /^https?:\/\//i.test(s.uri)) && (
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
                    <div className="text-xs font-semibold text-slate-500 dark:text-[#8d9aa8]">
                      Sumber Referensi
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {activeArticle.sources
                        .filter((src) => /^https?:\/\//i.test(src.uri))
                        .map((src, idx) => (
                          <li key={idx}>
                            <a
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:underline dark:text-[#00e08a]"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </article>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
