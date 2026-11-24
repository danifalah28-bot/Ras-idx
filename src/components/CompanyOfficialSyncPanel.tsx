import React, { useMemo, useState } from 'react';
import { ExternalLink, Globe, RefreshCw } from 'lucide-react';
import type { CompanyOfficialSyncResponse, CompanyOfficialUpdateItem, StockRecord } from '../types/market';

interface CompanyOfficialSyncPanelProps {
  stock: StockRecord;
  officialSync: CompanyOfficialSyncResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

type UpdateFilter =
  | 'ALL'
  | 'Website Resmi Emiten'
  | 'Keterbukaan BEI'
  | 'Regulasi OJK'
  | 'Laporan & Aksi Korporasi';

function formatWibDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Baru saja';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
}

function formatWibClock(iso?: string): string {
  if (!iso) return '--:-- WIB';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:-- WIB';
  return (
    d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }) + ' WIB'
  );
}

export function CompanyOfficialSyncPanel({
  stock,
  officialSync,
  loading,
  onRefresh,
}: CompanyOfficialSyncPanelProps) {
  const [filter, setFilter] = useState<UpdateFilter>('ALL');

  const filteredUpdates = useMemo<CompanyOfficialUpdateItem[]>(() => {
    const items = officialSync?.officialUpdates ?? [];
    if (filter === 'ALL') return items;
    return items.filter((item) => item.category === filter);
  }, [officialSync, filter]);

  const idxProfileUrl = `https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${encodeURIComponent(
    stock.ticker
  )}`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-[#1d2833] dark:bg-[#0e141c]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-[#1d2833]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
            <span>Sinkronisasi Website Resmi Perusahaan (BEI &amp; OJK)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Auto-Sync {officialSync?.syncIntervalSec ?? 60}d
            </span>
            {officialSync?.officialDomain && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-medium text-amber-700 dark:text-[#f5a524]">
                  {officialSync.officialDomain}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Terakhir: {formatWibClock(officialSync?.lastSyncedAt)}
            </span>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-[#eaf1f7]">
            Data Resmi {stock.ticker} — {stock.name}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {officialSync?.officialWebsite && (
            <a
              href={officialSync.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
            >
              <Globe className="h-3.5 w-3.5 text-amber-700 dark:text-[#f5a524]" />
              <span>Buka {officialSync.officialDomain || 'Website Resmi'}</span>
              <ExternalLink className="h-3 w-3 text-slate-400 dark:text-[#8d9aa8]" />
            </a>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:hover:bg-[#131b25]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sinkron Website Resmi</span>
          </button>
        </div>
      </div>

      {/* Corporate Verification KPI Strip */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Domain Resmi Perusahaan</div>
          <div className="mt-1 truncate font-mono text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
            {officialSync?.officialDomain ?? (loading ? 'Mencari domain...' : 'Terdaftar di BEI')}
          </div>
          <div className="mt-0.5 text-xs font-medium text-emerald-700 dark:text-[#00e08a]">
            Status: {officialSync?.websiteStatus ?? 'Memverifikasi'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Sektor &amp; Industri BEI</div>
          <div className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
            {officialSync?.sectorOfficial || stock.sector}
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-600 dark:text-[#8d9aa8]">
            {officialSync?.industryOfficial || stock.subSector}
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Didirikan &amp; Skala SDM</div>
          <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-[#eaf1f7]">
            {officialSync?.founded || `Papan ${stock.board}`}
          </div>
          <div className="mt-0.5 font-mono text-xs tabular-nums text-slate-600 dark:text-[#8d9aa8]">
            {officialSync?.employees ? `${officialSync.employees} karyawan` : stock.indexTags.join(' / ') || 'Tercatat BEI'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
          <div className="text-xs text-slate-500 dark:text-[#8d9aa8]">Rujukan Otoritas BEI &amp; OJK</div>
          <div className="mt-1 flex items-center gap-3 text-xs font-semibold">
            <a
              href={idxProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-[#f5a524]"
            >
              <span>Profil BEI</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-300 dark:text-[#2a3544]" aria-hidden="true">·</span>
            <a
              href="https://www.ojk.go.id/id/kanal/pasar-modal/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-amber-700 hover:underline dark:text-[#cbd5e1] dark:hover:text-[#f5a524]"
            >
              <span>OJK Pasar Modal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-[#8d9aa8]">
            Papan {stock.board}
          </div>
        </div>
      </div>

      {/* Corporate Description & Investor Relations Links Discovered from Official Site */}
      {officialSync && (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
          <div className="text-xs font-semibold text-slate-700 dark:text-[#eaf1f7]">
            {officialSync.websiteTitle}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
            {officialSync.corporateDescription}
          </p>

          {officialSync.corporateActionNote && (
            <div className="mt-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-[#f5a524]/35 dark:bg-[#f5a524]/10 dark:text-[#f5a524]">
              <span className="font-semibold">Aksi Korporasi Terkini:</span> {officialSync.corporateActionNote}
            </div>
          )}

          {officialSync.pdfDocuments && officialSync.pdfDocuments.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-[#cbd5e1]">
                Dokumen PDF Resmi Perusahaan (Hasil Ekstraksi Langsung):
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {officialSync.pdfDocuments.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-amber-300 hover:bg-amber-50/40 dark:border-[#1d2833] dark:bg-[#0b1219] dark:hover:border-[#f5a524]/45 dark:hover:bg-[#f5a524]/10"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs font-semibold text-amber-700 dark:text-[#f5a524]">
                      <span className="line-clamp-1">{doc.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-[#8d9aa8]" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-[#8d9aa8]">
                      {doc.summary}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {officialSync.investorLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap dark:text-[#8d9aa8]">
                Tautan Hubungan Investor Resmi:
              </span>
              {officialSync.investorLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#cbd5e1] dark:hover:border-[#f5a524]/45 dark:hover:bg-[#f5a524]/10 dark:hover:text-[#f5a524]"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400 dark:text-[#8d9aa8]" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Official Company Releases & BEI/OJK Disclosures Feed */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-[#1d2833]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
            Rilis Website Resmi, Keterbukaan BEI &amp; OJK ({stock.ticker})
          </h3>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-[#1d2833] dark:bg-[#0b1219]">
            {(
              [
                { id: 'ALL', label: 'Semua' },
                { id: 'Website Resmi Emiten', label: 'Website Resmi' },
                { id: 'Keterbukaan BEI', label: 'BEI' },
                { id: 'Regulasi OJK', label: 'OJK' },
                { id: 'Laporan & Aksi Korporasi', label: 'Laporan & RUPS' },
              ] as { id: UpdateFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[30px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && !officialSync ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
            Menyinkronkan website resmi perusahaan dan keterbukaan BEI/OJK untuk {stock.ticker}...
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-[#8d9aa8]">
            Belum ada pembaruan pada kategori ini untuk {stock.ticker}. Klik &ldquo;Sinkron Website Resmi&rdquo; untuk memeriksa ulang.
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100 dark:divide-[#1d2833]">
            {filteredUpdates.map((item) => (
              <article key={item.id} className="py-3 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8d9aa8]">
                  <span
                    className={`font-semibold ${
                      item.category === 'Website Resmi Emiten'
                        ? 'text-emerald-700 dark:text-[#00e08a]'
                        : item.category === 'Regulasi OJK'
                          ? 'text-amber-700 dark:text-[#f5a524]'
                          : 'text-slate-700 dark:text-[#cbd5e1]'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.source}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatWibDateTime(item.publishedAt)} WIB
                  </span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-start gap-1.5 text-sm font-medium text-slate-900 transition-colors hover:text-amber-700 dark:text-[#eaf1f7] dark:hover:text-[#f5a524]"
                >
                  <span>{item.title}</span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-[#8d9aa8]" />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
