import { GoogleGenAI } from '@google/genai';

// A chave fica só aqui, no servidor. O navegador nunca a enxerga.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const MAX_LEN = 80;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Tira quebras de linha e limita o tamanho (evita injetar instruções no prompt)
const clean = (v: unknown) =>
  String(v ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim();

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

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'Servidor sem GEMINI_API_KEY configurada.' }, 500);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Requisição inválida.' }, 400);
  }

  const device = clean(body?.device);
  const part = clean(body?.part);

  if (!device || !part) {
    return json({ error: 'Informe o modelo do aparelho e a peça.' }, 400);
  }
  if (device.length > MAX_LEN || part.length > MAX_LEN) {
    return json({ error: `Máximo de ${MAX_LEN} caracteres por campo.` }, 400);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(device, part),
    });
    const result = response.text?.trim();
    if (!result) return json({ error: 'Nenhuma informação encontrada.' }, 502);
    return json({ result });
  } catch (err) {
    console.error('Erro Gemini:', err);
    return json({ error: 'Falha ao consultar a IA. Tente novamente em instantes.' }, 502);
  }
}
