import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, Smartphone, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [deviceModel, setDeviceModel] = useState('');
  const [partType, setPartType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel || !partType) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `
Você é um especialista sênior em manutenção de smartphones e tablets.
Um técnico de bancada precisa saber a compatibilidade da seguinte peça:
- Aparelho: ${deviceModel}
- Peça: ${partType}

Por favor, retorne a resposta em formato Markdown estruturado com os seguintes tópicos:
1. **Peça Original**: Detalhes técnicos da peça original.
2. **Modelos Compatíveis (Compatibilidade Cruzada)**: Uma lista clara de outros aparelhos que usam EXATAMENTE a mesma peça. Se não houver, diga explicitamente.
3. **Comparativo de Especificações (Original vs. Alternativas)**: Compare as especificações técnicas da peça original com as de peças alternativas/paralelas comuns no mercado (ex: para telas, compare Original vs Incell/OLED/TFT; para baterias, Original vs 1ª Linha/Alta Capacidade). Destaque diferenças de qualidade, durabilidade e possíveis perdas de função (ex: biometria na tela).
4. **Avisos/Dicas Técnicas**: Dicas importantes sobre a troca dessa peça específica (ex: cuidados com flex, necessidade de transferir CI de bateria, cuidado com sensor de proximidade, etc).

Seja direto, profissional e focado no que um técnico de bancada precisa saber para agilizar o serviço e evitar prejuízos.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setResult(response.text || 'Nenhuma informação encontrada.');
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao buscar as informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
          <Wrench className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TechFix Assist</h1>
            <p className="text-slate-400 text-sm">Assistente de Compatibilidade de Peças</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar / Form */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-500" />
              Nova Consulta
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Modelo do Aparelho
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="Ex: Moto G8 Play, iPhone 11..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Peça Desejada
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wrench className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={partType}
                    onChange={(e) => setPartType(e.target.value)}
                    placeholder="Ex: Tela, Bateria, Conector..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Consultar Compatibilidade
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
            <p>
              <strong>Dica:</strong> Seja específico no modelo (ex: "Samsung A32 4G" em vez de apenas "A32") para resultados mais precisos.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="md:col-span-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p>Analisando manuais e esquemas elétricos...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-2 py-20">
                <AlertCircle className="w-10 h-10" />
                <p>{error}</p>
              </div>
            ) : result ? (
              <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Wrench className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">Nenhuma consulta realizada</h3>
                <p className="max-w-sm mt-2">
                  Preencha o modelo do aparelho e a peça desejada ao lado para descobrir peças compatíveis e dicas de bancada.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
