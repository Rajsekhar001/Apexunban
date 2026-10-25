// index.js — all-in-one. Vercel pe deploy kar, bas.
// Node 18+. Root pe index.js rakho, npx vercel --prod chalao.

// ===== VERCEL CONFIG (inline) =====
// Vercel ko batane ke liye ki ye ek serverless function hai:
export const config = { runtime: "nodejs18.x" };

// ===== CONFIG =====
const GARENA_BAN_URL = "https://ff.garena.com/api/antihack/check_banned";
const DURATION_SEC   = 86400;   // 24h — badalna ho toh yahan badlo
const CACHE          = new Map();

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control":                "no-store",
};

// ===== HELPERS =====
function fmt(s) {
  const h  = String(Math.floor(s / 3600)).padStart(2, "0");
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

async function checkGarena(uid) {
  const url = `${GARENA_BAN_URL}?uid=${encodeURIComponent(uid)}&region=IND`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13) FreeFire/1.0",
      "Accept":     "application/json, text/plain, */*",
      "Referer":    "https://ff.garena.com/",
      "Origin":     "https://ff.garena.com",
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

// ===== HANDLER =====
export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "method" });

  const uid = req.query.unben || req.query.uid;
  if (!uid) return res.status(400).json({ error: "missing uid" });

  let garena;
  try { garena = await checkGarena(String(uid)); }
  catch (e) {
    return res.status(502).json({
      error:  "garena_fetch_failed",
      detail: String(e?.message || e),
    });
  }

  const t  = Math.floor(Date.now() / 1000);
  let st   = CACHE.get(String(uid));
  if (!st) {
    st = { started: t, expires: t + DURATION_SEC };
    CACHE.set(String(uid), st);
  }

  const remaining = Math.max(0, st.expires - t);

  return res.status(200).json({
    uid:         String(uid),
    garena_ok:   garena.ok,
    garena_http: garena.status,
    garena_data: garena.data,
    status:      remaining === 0 ? "expired" : "active",
    timer:       remaining,
    formatted:   fmt(remaining),
    expires_at:  st.expires,
  });
}
