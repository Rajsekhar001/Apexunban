# garena_unban.py — mitmproxy addon
# Install: pip install mitmproxy
# Run: mitmproxy -s garena_unban.py
# Phone/emulator ka WiFi proxy -> PC IP:8080, mitm cert install

from mitmproxy import http
import json

# jo URL ban-check karti hai
BAN_CHECK_PATTERNS = [
    "antihack/check_banned",
    "check_banned",
    "ban/check",
    "account/ban",
]

def is_ban_check(url: str) -> bool:
    return any(p in url for p in BAN_CHECK_PATTERNS)

def response(flow: http.HTTPFlow):
    if not is_ban_check(flow.request.pretty_url):
        return

    # fake "clean" response — koi ban nahi
    fake = {
        "code": 0,
        "msg":  "success",
        "data": {
            "is_banned":    False,
            "ban_type":     0,
            "ban_reason":   "",
            "ban_until":    0,
            "unban_time":   0,
            "status":       "clean",
        }
    }

    body = json.dumps(fake).encode()
    flow.response = http.Response.make(
        200,
        body,
        {
            "Content-Type":  "application/json",
            "Content-Length": str(len(body)),
        }
    )

    print(f"[UNBAN] intercepted: {flow.request.pretty_url}")
