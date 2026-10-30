function check(req) {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return erro(500, "APP_PASSWORD não configurada no Netlify.");
  if (!process.env.GROQ_API_KEY) return erro(500, "GROQ_API_KEY não configurada no Netlify.");
  if (req.method !== "POST") return erro(405, "Use POST.");
  if (req.headers.get("x-app-password") !== senha) return erro(401, "Senha incorreta.");
  return null;
}

function erro(status, msg) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Recebe o texto transcrito e devolve um resumo simples, em português.

const INSTRUCAO =
  "Você resume transcrições de reuniões e conversas. Escreva em português do Brasil, " +
  "em texto corrido, sem títulos nem listas, em poucos parágrafos curtos. " +
  "Diga do que se tratou, os pontos principais e o que ficou decidido ou combinado, se houver. " +
  "Não invente nada que não esteja na transcrição. Se a transcrição estiver em outro idioma, resuma em português.";

export default async (req) => {
  const bloqueio = check(req);
  if (bloqueio) return bloqueio;

  const { text } = await req.json().catch(() => ({}));
  if (!text || text.trim().length < 20) return erro(400, "Texto curto demais para resumir.");

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      reasoning_effort: "low",
      temperature: 0.3,
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: INSTRUCAO },
        { role: "user", content: text.slice(0, 200000) },
      ],
    }),
  });
  if (!r.ok) return erro(502, `Groq respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return Response.json({ summary: (data.choices?.[0]?.message?.content || "").trim() });
};

export const config = { path: "/api/summarize" };
