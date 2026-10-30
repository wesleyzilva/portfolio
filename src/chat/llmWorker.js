// src/chat/llmWorker.js
import { MLCEngine } from '@mlc-ai/web-llm';

const MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC';

let engine = null;
let initPromise = null;

async function ensureEngine() {
  if (engine) return engine;
  if (!initPromise) {
    initPromise = (async () => {
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        throw new Error('WebGPU not available in this browser. Using deterministic RAG engine.');
      }
      const instance = new MLCEngine();
      instance.setInitProgressCallback((report) => {
        self.postMessage({
          type: 'STATUS',
          text: report.text || 'Loading local AI model into browser GPU…',
        });
      });
      await instance.reload(MODEL_ID);
      engine = instance;
      return engine;
    })();
  }
  return initPromise;
}

self.onmessage = async (event) => {
  const { action, payload } = event.data || {};
  if (action !== 'synthesize') return;

  const { question, contextText, isInterest, lang = 'en' } = payload;
  const isPt = lang === 'pt';

  try {
    const llm = await ensureEngine();

    const systemPrompt = isPt
      ? `Você é o #askToTPM_agentic, assistente executivo de IA do Wesley Silva (Agentic Technical Program Manager, Tech Product Owner e IT Coordinator).
Responda à pergunta do recrutador em 2 frases concisas e de alto impacto em PORTUGUÊS, usando APENAS os fatos verificados em [CONTEXT].

GUARDRAILS ESTRITOS:
1. NUNCA invente empresas, ferramentas, métricas ou experiências que não estejam em [CONTEXT].
2. ${
          isInterest
            ? 'CRÍTICO: O tema perguntado é uma CURIOSIDADE PESSOAL (como n8n, odontologia/saúde ou trading financeiro). Declare explicitamente que é um interesse pessoal fora da experiência corporativa dele. NUNCA comece com "Sim".'
            : 'Foque em resultados corporativos mensuráveis (métricas DORA, SLAs, redução de vulnerabilidades, Databricks, pagamentos B2B).'
        }
3. Mantenha tom executivo e direto.

[CONTEXT]:
${contextText}`
      : `You are #askToTPM_agentic, the executive AI assistant for Wesley Silva (Agentic Technical Program Manager, Tech Product Owner, and IT Coordinator).
Answer the recruiter's question in 2 concise, high-impact sentences in ENGLISH using ONLY the verified facts inside [CONTEXT].

STRICT GUARDRAILS:
1. NEVER invent companies, tools, metrics, or experiences not explicitly stated in [CONTEXT].
2. ${
          isInterest
            ? 'CRITICAL: The topic asked is a PERSONAL CURIOSITY (like n8n, dentistry/healthcare, or financial trading). Explicitly state it is a personal interest outside his corporate delivery experience. NEVER start with "Yes".'
            : 'Focus on measurable enterprise outcomes (DORA metrics, SLAs, vulnerability reduction, Databricks, B2B payments).'
        }
3. Keep a direct, executive tone without filler words.

[CONTEXT]:
${contextText}`;

    self.postMessage({
      type: 'STATUS',
      text: isPt ? 'Sintetizando resposta com guardrails…' : 'Synthesizing grounded response…',
    });

    const response = await llm.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.1,
      max_tokens: 120,
    });

    const generated = response.choices?.[0]?.message?.content?.trim();
    if (!generated) throw new Error('Empty response from local LLM');

    self.postMessage({
      type: 'SUCCESS',
      text: generated,
    });
  } catch (error) {
    self.postMessage({
      type: 'FALLBACK',
      reason: error?.message || 'Local LLM unavailable',
    });
  }
};