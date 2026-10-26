/*
 * Target: com.dts.freefiremax (v2.133.13)
 * Hook: Unity UI Text String Replacement for Ban Dialog
 */

let totalSeconds = 259200; // 72 Hours Timer

function formatTimer(sec) {
    let days = Math.floor(sec / 86400);
    let hours = Math.floor((sec % 86400) / 3600);
    let minutes = Math.floor((sec % 3600) / 60);
    let seconds = sec % 60;
    
    let d = String(days).padStart(2, '0');
    let h = String(hours).padStart(2, '0');
    let m = String(minutes).padStart(2, '0');
    let s = String(seconds).padStart(2, '0');
    
    return `${d}d : ${h}h : ${m}m : ${s}s`;
}

// Tick timer every second
setInterval(function() {
    if (totalSeconds > 0) {
        totalSeconds--;
    }
}, 1000);

Java.perform(function() {
    const il2cpp = Module.findBaseAddress("libil2cpp.so");
    if (!il2cpp) return;

    // Hook string creation or UI label setter where "Permanent" is rendered
    Interceptor.attach(Module.findExportByName("libc.so", "strstr"), {
        onEnter: function(args) {
            this.haystack = args[0];
            if (!this.haystack.isNull()) {
                let str = this.haystack.readUtf8String();
                if (str && str.indexOf("Permanent") !== -1) {
                    let timerStr = formatTimer(totalSeconds);
                    // Pad or slice to fit exact 9-byte length of "Permanent" in memory
                    let compactTimer = timerStr.substring(0, 9); 
                    this.haystack.writeUtf8String(compactTimer);
                }
            }
        }
    });
});
