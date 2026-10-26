import json
import time
from mitmproxy import http

CONFIG_PATH = "localConfig.json"

def load_timer_seconds() -> int:
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return int(data.get("banOverride", {}).get("timerDurationSeconds", 259200))
    except Exception:
        return 259200  # Default 3 days (72 hours)

def response(flow: http.HTTPFlow) -> None:
    # Intercept Garena Login / MajorLogin check endpoints
    target_hosts = ["loginbp.ggblueshark.com", "ind.ff.garena.com", "clientbp.ggblueshark.com"]
    
    if any(host in flow.request.pretty_host for host in target_hosts):
        content_type = flow.response.headers.get("Content-Type", "")
        
        # If JSON config or web-api ban notice payload
        if "application/json" in content_type:
            try:
                body = json.loads(flow.response.get_text())
                duration = load_timer_seconds()
                expire_epoch = int(time.time()) + duration
                
                body["is_permanent"] = 0
                body["ban_period"] = duration
                body["unban_time"] = expire_epoch
                body["ban_reason"] = "Abnormal activities detected - Under Review"
                
                flow.response.set_text(json.dumps(body))
            except Exception:
                pass
