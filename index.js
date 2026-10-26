export default function handler(req, res) {
    // CORS headers enable karna zaroori hai taaki game client bina error ke data read kar sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Query parameters se unban token ya uid nikalna
    const { unben, id } = req.query;

    // Response payload jo Free Fire client ko wapas bhejna hai
    const responsePayload = {
        status: "success",
        code: 200,
        message: "Account unban override applied successfully",
        data: {
            uid: id || "2200950401",
            is_banned: false,
            ban_type: 0,
            unban_timestamp: Math.floor(Date.now() / 1000) + 259200, // 3 days timer/access window
            token: unben || "b4bf868ef483c846973bd67385108fa13a50162b9587693fa9898479cedfa7fd"
        }
    };

    return res.status(200).json(responsePayload);
}
