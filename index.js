// api/id.js — Vercel serverless + key validation

const DURATION     = 86400;
const BANNED_ID    = "1234567890";

// sirf yeh key(s) allowed
const VALID_KEYS = new Set([
  "b4bf868ef483c846973bd67385108fa13a50162b9587693fa9898479cedfa7fd",
  // aur keys yahan add karo
]);

let state = null;

function fmt(s) {
  const h  = String(Math.floor(s / 3600)).padStart(2, "0");
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "method" });

  const key = String(req.query.unben || req.query.uid || "");
  if (!key) return res.status(400).json({ error: "missing unben" });

  // === KEY VALIDATION ===
  if (!VALID_KEYS.has(key)) {
    return res.status(403).json({
      error:  "invalid_key",
      status: "denied",
    });
  }

  const t = Math.floor(Date.now() / 1000);
  if (state === null) state = { started: t, expires: t + DURATION };
  const remaining = Math.max(0, state.expires - t);

  return res.status(200).json({
    key,
    banned_id:  BANNED_ID,
    token:      process.env.ACCESS_TOKEN || "",
    status:     remaining === 0 ? "expired" : "active",
    is_banned:  false,
    timer:      remaining,
    formatted:  fmt(remaining),
    expires_at: state.expires,
    started_at: state.started,
  });
}
