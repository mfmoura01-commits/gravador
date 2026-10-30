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

// Recebe um trecho de áudio (até ~5 min) e devolve o texto transcrito
// pelo Whisper Large V3 Turbo no Groq.

export default async (req) => {
  const bloqueio = check(req);
  if (bloqueio) return bloqueio;

  const tipo = (req.headers.get("content-type") || "audio/mp4").split(";")[0];
  const ext = tipo.includes("webm") ? "webm" : tipo.includes("ogg") ? "ogg" : tipo.includes("wav") ? "wav" : "m4a";
  const idioma = req.headers.get("x-language") || ""; // "pt", "en" ou vazio = automático

  const audio = await req.arrayBuffer();
  if (audio.byteLength < 1000) return erro(400, "Trecho de áudio vazio.");

  const form = new FormData();
  form.append("file", new Blob([audio], { type: tipo }), `trecho.${ext}`);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "json");
  form.append("temperature", "0");
  if (idioma) form.append("language", idioma);

  const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });
  if (!r.ok) return erro(502, `Groq respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const { text } = await r.json();
  return Response.json({ text: (text || "").trim() });
};

export const config = { path: "/api/transcribe" };
