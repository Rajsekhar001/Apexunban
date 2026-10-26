export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const responsePayload = {
        is_banned: false
    };

    return res.status(200).json(responsePayload);
}
