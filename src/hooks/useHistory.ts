import { useCallback, useEffect, useState } from 'react';

export type Entry = {
  id: string;
  device: string;
  part: string;
  result: string;
  createdAt: number;
};

const KEY = 'techfix:history';
const MAX = 15;

const norm = (s: string) => s.trim().toLowerCase();

function load(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<Entry[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      /* storage cheio ou bloqueado: segue sem persistir */
    }
  }, [entries]);

  const find = useCallback(
    (device: string, part: string) =>
      entries.find((e) => norm(e.device) === norm(device) && norm(e.part) === norm(part)),
    [entries],
  );

  const add = useCallback((device: string, part: string, result: string) => {
    const entry: Entry = {
      id: crypto.randomUUID(),
      device: device.trim(),
      part: part.trim(),
      result,
      createdAt: Date.now(),
    };
    setEntries((prev) =>
      [entry, ...prev.filter((e) => !(norm(e.device) === norm(device) && norm(e.part) === norm(part)))].slice(0, MAX),
    );
    return entry;
  }, []);

  const remove = useCallback((id: string) => setEntries((p) => p.filter((e) => e.id !== id)), []);
  const clear = useCallback(() => setEntries([]), []);

  return { entries, find, add, remove, clear };
}
