// api/id.js — Vercel + Upstash Redis (hardcoded creds)

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:   "https://model-kiwi-239268.upstash.io",
  token: "gQAAAAAAA6akAAIgcDJmODc4MzZiOTExMmM0ZTUzYTczMzBmNmMyOGYyZjdhZQ",
});

const DURATION  = 86400;         // 24h
const BANNED_ID = "1234567890";  // fixed banned id

const VALID_KEYS = new Set([
  "b4bf868ef483c846973bd67385108fa13a50162b9587693fa9898479cedfa7fd",
]);

function fmt(s) {
  const h  = String(Math.floor(s / 3600)).padStart(2, "0");
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "method" });

  const key = String(req.query.unben || req.query.uid || "");
  if (!key)                 return res.status(400).json({ error: "missing unben" });
  if (!VALID_KEYS.has(key)) return res.status(403).json({ error: "invalid_key" });

  const t = Math.floor(Date.now() / 1000);

  // Redis se state — banned_id ke hisaab se ek hi state
  const redisKey = `ban_state:${BANNED_ID}`;
  let state = await redis.get(redisKey);

  // @upstash/redis kabhi string return karta hai — handle karo
  if (typeof state === "string") {
    try { state = JSON.parse(state); } catch { state = null; }
  }

  if (!state || typeof state !== "object" || !state.expires) {
    state = { started: t, expires: t + DURATION };
    await redis.set(redisKey, JSON.stringify(state));
  }

  const remaining = Math.max(0, state.expires - t);

  return res.status(200).json({
    key,
    banned_id: BANNED_ID,
    status:    remaining === 0 ? "expired" : "active",
    is_banned: false,
    timer:     remaining,
    formatted: fmt(remaining),
    expires_at: state.expires,
    started_at: state.started,
  });
}
