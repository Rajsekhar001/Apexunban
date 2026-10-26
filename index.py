import os
import stat
import json
import shutil

# CONFIGURATION
CONFIG_PATH = "localConfig.json"  # Ensure this file is in the same folder
TARGET_DIR = "/data/data/com.dts.freefireth/files/contentcache/localConfig.json" 
# Note: For Emulators, adjust the path to your shared storage mount

def patch_session():
    print("[!] Initiating Session Sync...")
    
    # 1. Ensure file exists locally
    if not os.path.exists(CONFIG_PATH):
        print("[-] Error: localConfig.json not found in current directory.")
        return

    # 2. Force overwrite the game's config
    try:
        # Clear cache first to prevent state-mismatch
        print("[+] Clearing local game state...")
        # shutil.rmtree(os.path.dirname(TARGET_DIR) + "/cache") 

        # Inject the config
        shutil.copy2(CONFIG_PATH, TARGET_DIR)
        print("[+] Injection complete: localConfig.json moved to target.")

        # 3. LOCK THE FILE (Read-Only)
        # This prevents the game's "AccountManager" from resetting your config
        os.chmod(TARGET_DIR, stat.S_IREAD) 
        print("[+] File permissions set to READ-ONLY (Locked).")
        
        print("\n[SUCCESS] Sync applied. Launch the game now.")
        print("[!] Note: Do not clear game data, or the lock will be removed.")

    except Exception as e:
        print(f"[-] Critical Error during patching: {e}")

if __name__ == "__main__":
    # Ensure you run this with sufficient permissions
    patch_session()
