import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Send, Trash2, X } from 'lucide-react';
import type { ChatMessage, StockRecord } from '../types/market';

interface AnalystChatbotProps {
  open: boolean;
  onClose: () => void;
  activeStock: StockRecord;
}

export function AnalystChatbot({ open, onClose, activeStock }: AnalystChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Halo! Saya Analis Ekuitas BEI & Geopolitik RAS Terminal. Saat ini kita memantau ${activeStock.ticker} (${activeStock.name}) pada Rp ${activeStock.price.toLocaleString('id-ID')}. Tanyakan analisis laporan keuangan, arus inflow/outflow, perbandingan kompetitor sektor ${activeStock.subSector}, titik support/resisten, atau dampak geopolitik & komoditas dunia terkini.`,
      modelUsed: 'gemini-4-hydrogen',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'deep' | 'fast'>('deep');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInput('');
    setSending(true);
    setError('');

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          activeTicker: activeStock.ticker,
        }),
      });

      const json = (await res.json()) as {
        reply?: string;
        modelUsed?: string;
        thinkingUsed?: boolean;
        sources?: { title: string; uri: string }[];
        error?: string;
      };

      if (!res.ok) {
        setError(json.error || 'Gagal mendapatkan respons dari Gemini.');
      } else {
        const modelMsg: ChatMessage = {
          id: `m_${Date.now()}`,
          role: 'model',
          text: json.reply || '',
          modelUsed: json.modelUsed,
          thinkingUsed: json.thinkingUsed,
          sources: json.sources,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, modelMsg]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesalahan jaringan.');
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Sesi baru dimulai. Fokus aktif: ${activeStock.ticker} (${activeStock.name}) · Harga Rp ${activeStock.price.toLocaleString('id-ID')} · Status lampu: ${activeStock.lampDetail}. Silakan ajukan pertanyaan Anda.`,
        modelUsed: mode === 'deep' ? 'gemini-4-hydrogen' : 'gemini-3.1-flash-lite',
        timestamp: new Date().toISOString(),
      },
    ]);
    setError('');
  };

  if (!open) return null;

  const quickPrompts = [
    `Bedah kesehatan keuangan & valuasi ${activeStock.ticker} sekarang`,
    `Bagaimana risiko geopolitik & komoditas dunia terhadap ${activeStock.ticker}?`,
    `Jelaskan posisi Support/Resisten dan inflow 1W ${activeStock.ticker}`,
  ];

  return (
    <aside
      aria-label="Analis AI RAS Terminal"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-xl dark:border-[#1d2833] dark:bg-[#0e141c]"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#1d2833]">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#eaf1f7]">Analis AI RAS Terminal</h2>
          <p className="text-xs text-slate-500 dark:text-[#8d9aa8]">
            Konteks aktif: <span className="font-mono font-semibold text-amber-700 dark:text-[#f5a524]">{activeStock.ticker}</span> · {activeStock.subSector}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetChat}
            title="Bersihkan percakapan"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-[#1d2833] dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Analis AI"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-[#1d2833] dark:text-[#8d9aa8] dark:hover:bg-[#131b25] dark:hover:text-[#eaf1f7]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
        <span className="text-xs font-medium text-slate-600 dark:text-[#cbd5e1]">Mode Penalaran</span>
        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-0.5 dark:border dark:border-[#1d2833] dark:bg-[#0e141c]">
          <button
            type="button"
            onClick={() => setMode('deep')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'deep'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b] dark:font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
            }`}
          >
            High Thinking + Search
          </button>
          <button
            type="button"
            onClick={() => setMode('fast')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'fast'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-[#00e08a] dark:text-[#03130b] dark:font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-[#8d9aa8] dark:hover:text-[#eaf1f7]'
            }`}
          >
            Cepat (Flash-Lite)
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#00e08a] to-[#00b86f] font-semibold text-[#03130b]'
                  : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7]'
              }`}
            >
              {msg.text}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-2.5 dark:border-[#1d2833]">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-[#8d9aa8]">Referensi Web Terkini</div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {msg.sources.slice(0, 4).map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline truncate dark:text-[#f5a524]"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 dark:text-[#8d9aa8]">
              {msg.role === 'user' ? 'Anda' : msg.modelUsed || 'Analis AI'}
              {msg.thinkingUsed ? ' · High Thinking' : ''}
              {' · '}
              {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {sending && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#8d9aa8]">
            {mode === 'deep'
              ? 'Sedang melakukan penalaran mendalam & pencarian berita global terkini...'
              : 'Sedang menyusun jawaban cepat...'}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-[#ff5a68]/40 dark:bg-[#ff5a68]/10 dark:text-[#fca5a5]">
            {error}
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-2.5 dark:border-[#1d2833] dark:bg-[#0b1219]">
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => sendMessage(qp)}
              disabled={sending}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-left text-[11px] font-medium text-slate-700 transition-colors hover:border-amber-500 hover:text-amber-800 disabled:opacity-50 dark:border-[#1d2833] dark:bg-[#0e141c] dark:text-[#cbd5e1] dark:hover:border-[#f5a524]/60 dark:hover:text-[#f5a524]"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 dark:border-[#1d2833] dark:bg-[#0e141c]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Tanya tentang ${activeStock.ticker}, makro, atau strategi...`}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:bg-white focus:outline-none dark:border-[#1d2833] dark:bg-[#0b1219] dark:text-[#eaf1f7] dark:placeholder:text-[#8d9aa8] dark:focus:border-[#f5a524] dark:focus:bg-[#0b1219]"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Kirim pesan"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00e08a] to-[#00b86f] text-[#03130b] transition-all hover:brightness-110 disabled:opacity-50 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  );
}
