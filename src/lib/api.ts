export async function consultar(device: string, part: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('/api/consulta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device, part }),
    signal,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Ocorreu um erro ao buscar as informações.');
  }
  return data.result as string;
}
