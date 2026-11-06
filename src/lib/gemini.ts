const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const MAX_LEN = 80;

// Tira quebras de linha e limita o tamanho dos campos
const clean = (v: string) => v.replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_LEN);

function buildPrompt(device: string, part: string) {
  return `Você é um especialista sênior em manutenção de smartphones e tablets.
Um técnico de bancada precisa saber a compatibilidade da seguinte peça:
- Aparelho: ${device}
- Peça: ${part}

Responda em Markdown estruturado, em português do Brasil, com estes tópicos:

## 1. Peça original
Detalhes técnicos da peça original (tipo, código/part number quando você souber com segurança, conector, dimensões relevantes).

## 2. Modelos compatíveis (compatibilidade cruzada)
Lista clara de outros aparelhos que usam EXATAMENTE a mesma peça. Se não houver ou se você não tiver certeza, diga isso explicitamente.

## 3. Original vs. alternativas
Tabela Markdown comparando a peça original com alternativas comuns no mercado (ex.: tela → Original / Incell / OLED / TFT; bateria → Original / 1ª linha / alta capacidade). Destaque qualidade, durabilidade e possíveis perdas de função (ex.: biometria na tela).

## 4. Avisos e dicas de bancada
Cuidados específicos dessa troca (flex frágil, transferência de CI de bateria, sensor de proximidade, cola, vedação etc.).

## 5. Nível de confiança
Diga "Alto", "Médio" ou "Baixo" e explique em uma frase. Recomende conferir part number ou placa quando a confiança não for alta.

Regras: seja direto e profissional. NÃO invente part numbers nem compatibilidades — se não souber, escreva "não confirmado". Um erro aqui significa prejuízo para o técnico.`;
}

function errorMessage(status: number, apiMsg?: string): string {
  switch (status) {
    case 400:
      return apiMsg?.toLowerCase().includes('api key')
        ? 'Chave de API inválida. Confira em Configurações.'
        : 'Requisição recusada pela API. Confira o modelo em Configurações.';
    case 401:
    case 403:
      return 'Chave sem permissão ou bloqueada. Confira a chave (e as restrições de domínio dela) em Configurações.';
    case 404:
      return 'Modelo não encontrado. Troque o modelo em Configurações.';
    case 429:
      return 'Limite de uso da API atingido. Aguarde um pouco e tente de novo.';
    default:
      return 'Falha ao consultar a IA. Tente novamente em instantes.';
  }
}

export async function consultar(
  device: string,
  part: string,
  opts: { apiKey: string; model: string; signal?: AbortSignal },
): Promise<string> {
  const d = clean(device);
  const p = clean(part);
  if (!d || !p) throw new Error('Informe o modelo do aparelho e a peça.');

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/${encodeURIComponent(opts.model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': opts.apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: buildPrompt(d, p) }] }] }),
      signal: opts.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Sem conexão com a API do Gemini. Verifique sua internet.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(errorMessage(res.status, data?.error?.message));

  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((x: { text?: string }) => x.text ?? '')
    .join('')
    .trim();

  if (!text) throw new Error('A IA não retornou informação para essa consulta.');
  return text;
}
