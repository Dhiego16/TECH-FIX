import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Eye, EyeOff, KeyRound, ShieldCheck, X } from 'lucide-react';
import { DEFAULT_MODEL, type Settings } from '../hooks/useSettings';

type Props = {
  open: boolean;
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
};

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.1-pro-preview'];

export default function SettingsDialog({ open, settings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [show, setShow] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setApiKey(settings.apiKey);
      setModel(settings.model);
      setShow(false);
      setTimeout(() => firstRef.current?.focus(), 0);
    }
  }, [open, settings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputCls =
    'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ apiKey, model });
          onClose();
        }}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="settings-title" className="flex items-center gap-2 text-lg font-semibold">
            <KeyRound className="h-5 w-5 text-sky-500" />
            Configurações
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label htmlFor="apikey" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sua chave da API do Gemini
          </label>
          <div className="relative">
            <input
              id="apikey"
              ref={firstRef}
              type={show ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza…"
              autoComplete="off"
              spellCheck={false}
              className={`${inputCls} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Ocultar chave' : 'Mostrar chave'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline dark:text-sky-400"
          >
            Criar chave gratuita no Google AI Studio <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div>
          <label htmlFor="model" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Modelo
          </label>
          <input
            id="model"
            list="models"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={DEFAULT_MODEL}
            spellCheck={false}
            className={inputCls}
          />
          <datalist id="models">
            {MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div className="flex gap-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            A chave fica salva só neste navegador e é enviada apenas para o Google. Em computador compartilhado,
            remova a chave ao terminar. Dica: no Google AI Studio, restrinja a chave ao domínio deste site.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onSave({ apiKey: '', model });
              onClose();
            }}
            className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400"
          >
            Remover chave
          </button>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
