import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, ShieldAlert } from 'lucide-react';
import type { LampStatus, StockRecord } from '../types/market';

interface LampBadgeProps {
  status: LampStatus;
  compact?: boolean;
}

export function SupportResistanceLampBadge({ status, compact = false }: LampBadgeProps) {
  const config = getLampConfig(status);
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap shrink-0">
      <span
        className={`inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-900 p-0.5 ${
          compact ? 'h-4 w-4' : 'h-5 w-5'
        }`}
        aria-hidden="true"
      >
        <span className={`h-full w-full rounded-full ${config.bulbClass}`} />
      </span>
      <span className={`inline-flex items-center gap-1 font-medium ${compact ? 'text-xs' : 'text-sm'} ${config.textClass}`}>
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{config.label}</span>
      </span>
    </div>
  );
}

function getLampConfig(status: LampStatus) {
  switch (status) {
    case 'BREAKOUT_RESISTANCE':
      return {
        label: 'Menembus Resisten',
        bulbClass: 'bg-emerald-500 lamp-breakout',
        textClass: 'text-emerald-700 dark:text-[#00e08a]',
        surfaceClass: 'border-emerald-200 bg-emerald-50/60 dark:border-[#00e08a]/30 dark:bg-[#0e141c]',
        icon: ArrowUpRight,
      };
    case 'AT_SUPPORT':
      return {
        label: 'Menyentuh Support',
        bulbClass: 'bg-amber-500 lamp-support',
        textClass: 'text-amber-700 dark:text-[#ffb020]',
        surfaceClass: 'border-amber-200 bg-amber-50/60 dark:border-[#ffb020]/35 dark:bg-[#0e141c]',
        icon: ShieldAlert,
      };
    case 'BREAKDOWN_SUPPORT':
      return {
        label: 'Jebol Support',
        bulbClass: 'bg-red-600 lamp-breakdown',
        textClass: 'text-red-700 dark:text-[#ff5a68]',
        surfaceClass: 'border-red-200 bg-red-50/60 dark:border-[#ff5a68]/35 dark:bg-[#0e141c]',
        icon: ArrowDownRight,
      };
    default:
      return {
        label: 'Konsolidasi',
        bulbClass: 'bg-slate-400',
        textClass: 'text-slate-600 dark:text-[#cbd5e1]',
        surfaceClass: 'border-slate-200 bg-slate-50 dark:border-[#1d2833] dark:bg-[#0e141c]',
        icon: Minus,
      };
  }
}

interface LadderProps {
  stock: StockRecord;
}

export function SupportResistancePanel({ stock }: LadderProps) {
  const cfg = getLampConfig(stock.lampStatus);
  const minPrice = stock.s2 * 0.985;
  const maxPrice = stock.r2 * 1.015;
  const span = Math.max(1, maxPrice - minPrice);

  const toPct = (val: number) => Math.max(2, Math.min(98, ((val - minPrice) / span) * 100));

  const currentPct = toPct(stock.price);
  const s2Pct = toPct(stock.s2);
  const s1Pct = toPct(stock.s1);
  const pivotPct = toPct(stock.pivot);
  const r1Pct = toPct(stock.r1);
  const r2Pct = toPct(stock.r2);

  const distSupportPct = (((stock.price - stock.s1) / Math.max(1, stock.s1)) * 100).toFixed(2);
  const distResistPct = (((stock.r1 - stock.price) / Math.max(1, stock.price)) * 100).toFixed(2);

  return (
    <section className={`rounded-xl border p-5 transition-colors ${cfg.surfaceClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-[#8d9aa8]">
            Lampu Indikator Support &amp; Resisten · {stock.ticker}
          </div>
          <SupportResistanceLampBadge status={stock.lampStatus} />
          <p className="text-sm text-slate-700 dark:text-[#cbd5e1]">{stock.lampDetail}</p>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
          <div className="text-right">
            <div className="text-slate-500 dark:text-[#8d9aa8]">Jarak ke Support S1</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
              {Number(distSupportPct) >= 0 ? `+${distSupportPct}%` : `${distSupportPct}%`}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-[#1d2833]" />
          <div className="text-right">
            <div className="text-slate-500 dark:text-[#8d9aa8]">Jarak ke Resisten R1</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-[#eaf1f7]">
              {Number(distResistPct) >= 0 ? `+${distResistPct}%` : `Terlampaui (${Math.abs(Number(distResistPct)).toFixed(2)}%)`}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Price Gauge */}
      <div className="mt-6">
        <div className="relative h-3 w-full rounded-full bg-slate-200/80 dark:bg-[#0b1219]">
          {/* Support Zone highlight */}
          <div
            className="absolute top-0 h-full rounded-l-full bg-amber-300/60 dark:bg-[#ffb020]/35"
            style={{ left: `${s2Pct}%`, width: `${Math.max(2, s1Pct - s2Pct)}%` }}
          />
          {/* Breakout Zone highlight */}
          <div
            className="absolute top-0 h-full rounded-r-full bg-emerald-300/60 dark:bg-[#00e08a]/35"
            style={{ left: `${r1Pct}%`, width: `${Math.max(2, r2Pct - r1Pct)}%` }}
          />

          {/* Level Markers */}
          {[
            { label: 'S2', pct: s2Pct, color: 'bg-slate-500' },
            { label: 'S1', pct: s1Pct, color: 'bg-amber-600' },
            { label: 'P', pct: pivotPct, color: 'bg-slate-400' },
            { label: 'R1', pct: r1Pct, color: 'bg-emerald-600' },
            { label: 'R2', pct: r2Pct, color: 'bg-emerald-800' },
          ].map((m) => (
            <div
              key={m.label}
              className="absolute -top-1 h-5 w-0.5 -translate-x-1/2"
              style={{ left: `${m.pct}%` }}
            >
              <div className={`h-full w-full ${m.color}`} />
            </div>
          ))}

          {/* Current Price Indicator Needle */}
          <div
            className="absolute -top-1.5 h-6 w-2 -translate-x-1/2 rounded-sm border border-white bg-slate-900 shadow-sm transition-all duration-300 dark:border-[#060a0f] dark:bg-[#eaf1f7]"
            style={{ left: `${currentPct}%` }}
            title={`Harga Saat Ini: Rp ${stock.price.toLocaleString('id-ID')}`}
          />
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2 border-t border-slate-200/80 pt-3 font-mono text-xs tabular-nums dark:border-[#1d2833]">
          <div>
            <div className="text-slate-500 dark:text-[#8d9aa8]">Support 2</div>
            <div className="font-semibold text-slate-800 dark:text-[#eaf1f7]">Rp {stock.s2.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-amber-700 dark:text-[#ffb020]">Support 1</div>
            <div className="font-semibold text-amber-800 dark:text-[#ffb020]">Rp {stock.s1.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-[#8d9aa8]">Pivot</div>
            <div className="font-semibold text-slate-800 dark:text-[#eaf1f7]">Rp {stock.pivot.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-emerald-700 dark:text-[#00e08a]">Resisten 1</div>
            <div className="font-semibold text-emerald-800 dark:text-[#00e08a]">Rp {stock.r1.toLocaleString('id-ID')}</div>
          </div>
          <div>
            <div className="text-emerald-800 dark:text-[#00e08a]">Resisten 2</div>
            <div className="font-semibold text-emerald-900 dark:text-[#eaf1f7]">Rp {stock.r2.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
