-- config.lua — game ke andar
-- server se banned-id + timer fetch karta hai

local SERVER_URL = "https://apexunban.vercel.app/id"
local KEY        = "1bee7f5cef921c02e46e85e0b349c133ba8ac65b5c55405e5c3f9033214a669d"

local function fetch_status()
    local url = SERVER_URL .. "?unben=" .. KEY
    local http = game:HttpGet(url)   -- agar game engine lua/http support kare
    local data = game:GetService("HttpService"):JSONDecode(http) -- ya json.decode(http)

    return {
        banned_id = data.banned_id,
        status    = data.status,
        timer     = data.formatted,
        expires   = data.expires_at,
    }
end

-- har second timer update
local function start_timer()
    local info = fetch_status()
    local remaining = info.timer

    while true do
        -- yahan apni UI me display kar
        print("[BAN] ID: " .. info.banned_id .. " | " .. remaining)
        task.wait(1)

        -- server se re-fetch (ya local countdown)
        local fresh = fetch_status()
        remaining = fresh.timer
        if fresh.status == "expired" then
            print("[BAN] ID " .. info.banned_id .. " unbanned.")
            break
        end
    end
end

start_timer()
