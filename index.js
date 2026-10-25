// index.js — fixed banned ID, timer chalta hai, ID dobara create nahi hoti

const DURATION_SEC = 86400;
const BANNED_ID    = "1234567890";  // FIXED — kabhi change nahi hogi

// global state — pehli baar set, phir same rehti hai
let state = null;   // { started, expires }

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

  const t = Math.floor(Date.now() / 1000);

  // sirf pehli baar set karo — dobara kabhi naya ID nahi
  if (state === null) {
    state = { started: t, expires: t + DURATION_SEC };
  }

  const remaining = Math.max(0, state.expires - t);

  return res.status(200).json({
    banned_id: BANNED_ID,               // hamesha same
    status:    remaining === 0 ? "expired" : "active",
    timer:     remaining,
    formatted: fmt(remaining),
    expires_at: state.expires,
    started_at: state.started,
  });
}
