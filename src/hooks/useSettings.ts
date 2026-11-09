import { useCallback, useEffect, useState } from 'react';

export type Settings = { apiKey: string; model: string };

export const DEFAULT_MODEL = 'gemini-3.5-flash';

// Modelos das gerações 1.x e 2.x foram/estão sendo desligados pela Google (404)
const RETIRED = /^gemini-(1|2)\./;
const KEY = 'techfix:settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const model = String(s.model || DEFAULT_MODEL);
      return { apiKey: String(s.apiKey ?? ''), model: RETIRED.test(model) ? DEFAULT_MODEL : model };
    }
  } catch {
    /* ignora */
  }
  return { apiKey: '', model: DEFAULT_MODEL };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* storage bloqueado: a chave vale só nesta sessão */
    }
  }, [settings]);

  const save = useCallback((s: Settings) => {
    setSettings({ apiKey: s.apiKey.trim(), model: s.model.trim() || DEFAULT_MODEL });
  }, []);

  return { settings, save, hasKey: settings.apiKey.length > 0 };
}
