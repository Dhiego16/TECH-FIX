import { useRef, useState } from 'react';
import { AlertCircle, KeyRound, Loader2, Moon, Search, Settings as SettingsIcon, Smartphone, Sun, Wrench } from 'lucide-react';
import { consultar } from './lib/gemini';
import { useSettings } from './hooks/useSettings';
import SettingsDialog from './components/SettingsDialog';
import { useHistory, type Entry } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';

const QUICK_PARTS = ['Tela', 'Bateria', 'Conector de carga', 'Câmera traseira', 'Alto-falante', 'Flex power', 'Tampa traseira'];

type Current = { id?: string; device: string; part: string; result: string; fromCache: boolean };

export default function App() {
  const { dark, toggle } = useTheme();
  const { entries, find, add, remove, clear } = useHistory();
  const { settings, save, hasKey } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [device, setDevice] = useState('');
  const [part, setPart] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<Current | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async (d: string, p: string, force = false) => {
    if (!d.trim() || !p.trim()) return;
    setError('');

    if (!force) {
      const cached = find(d, p);
      if (cached) {
        setCurrent({ id: cached.id, device: cached.device, part: cached.part, result: cached.result, fromCache: true });
        return;
      }
    }

    if (!hasKey) {
      setSettingsOpen(true);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setCurrent(null);
    try {
      const result = await consultar(d, p, { apiKey: settings.apiKey, model: settings.model, signal: ctrl.signal });
      const entry = add(d, p, result);
      setCurrent({ id: entry.id, device: entry.device, part: entry.part, result, fromCache: false });
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Ocorreu um erro ao buscar as informações.');
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(device, part);
  };

  const onSelectHistory = (e: Entry) => {
    setDevice(e.device);
    setPart(e.part);
    setError('');
    setCurrent({ id: e.id, device: e.device, part: e.part, result: e.result, fromCache: true });
  };

  const inputCls =
    'block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/15 p-2">
              <Wrench className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TechFix Assist</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Compatibilidade de peças para técnicos de bancada</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Configurações"
              className="relative rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <SettingsIcon className="h-5 w-5" />
              {!hasKey && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />}
            </button>
            <button
              onClick={toggle}
              aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          {!hasKey && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
            >
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <strong>Configure sua chave do Gemini</strong> para começar. É gratuita e fica salva só no seu
                navegador.
              </span>
            </button>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Search className="h-5 w-5 text-slate-400" />
              Nova consulta
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="device" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Modelo do aparelho
                </label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="device"
                    type="text"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder="Ex: Moto G8 Play, iPhone 11…"
                    maxLength={80}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="part" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Peça desejada
                </label>
                <div className="relative">
                  <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="part"
                    type="text"
                    value={part}
                    onChange={(e) => setPart(e.target.value)}
                    placeholder="Ex: Tela, Bateria, Conector…"
                    maxLength={80}
                    className={inputCls}
                    required
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_PARTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setPart(q)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${
                        part === q
                          ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-sky-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando…
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Consultar compatibilidade
                  </>
                )}
              </button>
            </form>
          </section>

          <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <p>
              <strong>Dica:</strong> seja específico no modelo (ex.: “Samsung A32 4G” em vez de só “A32”) para um
              resultado mais preciso.
            </p>
          </div>

          <HistoryList
            entries={entries}
            activeId={current?.id}
            onSelect={onSelectHistory}
            onRemove={remove}
            onClear={clear}
          />
        </aside>

        <section className="lg:col-span-8">
          <div className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-24 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                <p>Analisando compatibilidade…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-24 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => run(device, part, true)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Tentar novamente
                </button>
              </div>
            ) : current ? (
              <>
                <ResultCard {...current} />
                {current.fromCache && (
                  <button
                    onClick={() => run(current.device, current.part, true)}
                    className="mt-4 text-sm text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
                  >
                    Consultar de novo (ignorar histórico)
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-24 text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Wrench className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Nenhuma consulta realizada</h3>
                <p className="max-w-sm text-slate-500 dark:text-slate-400">
                  Informe o aparelho e a peça ao lado para ver compatibilidades, alternativas e dicas de bancada.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SettingsDialog open={settingsOpen} settings={settings} onSave={save} onClose={() => setSettingsOpen(false)} />

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-500 dark:text-slate-500">
        TechFix Assist — informações geradas por IA, sempre confirme na bancada.
      </footer>
    </div>
  );
}
