// server.js — Node 18+, koi dependency nahi
// node server.js
// token.json same folder me rakho

const http = require("http");
const fs   = require("fs");
const { URL } = require("url");

const PORT        = process.env.PORT || 3000;
const TOKEN_FILE  = "./token.json";
const DURATION    = 86400;             // 24h timer
const BANNED_ID   = "1234567890";      // fixed banned id

// token.json se token load karo
function loadToken() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, "utf8");
    const j   = JSON.parse(raw);
    return j.access_token || "";
  } catch (e) {
    console.error("[!] token.json padhne me error:", e.message);
    return "";
  }
}

// ek hi global timer state — reset nahi hota
let state = null;  // { started, expires }

function fmt(s) {
  const h  = String(Math.floor(s / 3600)).padStart(2, "0");
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  if (req.method !== "GET")     { res.writeHead(405); res.end('{"error":"method"}'); return; }

  const u   = new URL(req.url, `http://${req.headers.host}`);
  const key = u.searchParams.get("unben") || u.searchParams.get("uid");

  // sirf /id route
  if (u.pathname !== "/id") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end('{"error":"not_found"}');
    return;
  }

  if (!key) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end('{"error":"missing unben"}');
    return;
  }

  const token = loadToken();
  const t     = Math.floor(Date.now() / 1000);

  if (state === null) state = { started: t, expires: t + DURATION };

  const remaining = Math.max(0, state.expires - t);

  const out = JSON.stringify({
    key,
    banned_id:  BANNED_ID,
    token,
    status:     remaining === 0 ? "expired" : "active",
    timer:      remaining,
    formatted:  fmt(remaining),
    expires_at: state.expires,
    started_at: state.started,
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(out);

  console.log(`[GET] /id?unben=${key} -> timer=${fmt(remaining)}`);
});

server.listen(PORT, () => {
  console.log(`[+] chalu: http://localhost:${PORT}/id?unben=<key>`);
  console.log(`[+] token file: ${TOKEN_FILE}`);
});
