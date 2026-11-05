import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, ShieldAlert } from 'lucide-react';

type Props = {
  device: string;
  part: string;
  result: string;
  fromCache?: boolean;
};

export default function ResultCard({ device, part, result, fromCache }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${device} — ${part}\n\n${result}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard bloqueado */
    }
  };

  return (
    <article>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
            {part}
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{device}</h2>
          {fromCache && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Resultado salvo no histórico</p>
          )}
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-h2:mt-6 prose-h2:text-lg prose-a:text-sky-600 dark:prose-invert dark:prose-a:text-sky-400">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {result}
        </ReactMarkdown>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Resposta gerada por IA. Confirme o <strong>part number</strong> ou compare a peça na bancada antes de
          comprar ou instalar.
        </p>
      </div>
    </article>
  );
}
