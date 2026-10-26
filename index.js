// config_sync.js - Logic for injecting the session
const fs = require('fs');

function syncSession(configPath, tokenData) {
    // 1. Read the existing local config
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // 2. Inject the session metadata without wiping the DeviceID
    config.session = {
        token: tokenData.token,
        timestamp: Date.now(),
        // Keep the original HWID to prevent 'New ID' redirect
        hwid: config.device_info.hwid, 
        is_verified: true
    };

    // 3. Write back with proper permissions to keep it read-only for the game
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // 4. Force a state lock so the game doesn't overwrite your config
    fs.chmodSync(configPath, 0o444); 
    console.log("[!] Config locked. HWID preserved, session injected.");
}
