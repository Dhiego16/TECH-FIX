import { History, Trash2, X } from 'lucide-react';
import type { Entry } from '../hooks/useHistory';

type Props = {
  entries: Entry[];
  activeId?: string;
  onSelect: (e: Entry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function HistoryList({ entries, activeId, onSelect, onRemove, onClear }: Props) {
  if (entries.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <History className="h-4 w-4 text-slate-400" />
          Consultas recentes
        </h3>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-red-500 dark:text-slate-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>

      <ul className="space-y-1">
        {entries.map((e) => (
          <li key={e.id} className="group flex items-center gap-1">
            <button
              onClick={() => onSelect(e)}
              className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                e.id === activeId
                  ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block truncate font-medium">{e.device}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{e.part}</span>
            </button>
            <button
              onClick={() => onRemove(e.id)}
              aria-label={`Remover ${e.device} - ${e.part}`}
              className="rounded-md p-1.5 text-slate-400 opacity-0 transition hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
