export default async function handler(req, res) {
  const { unben } = req.query;

  if (!unben) {
    return res.status(400).json({
      error: "missing_token",
      message: "unben parameter mein access token daalna zaroori hai"
    });
  }

  // 15 din ka timer calculation (seconds mein)
  const timerDays = 15;
  const durationSeconds = timerDays * 24 * 60 * 60; 
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expireTimestamp = currentTimestamp + durationSeconds;

  // Game client ya loader ko wapas bhejne wala JSON payload
  return res.status(200).json({
    result: 0,
    status: "TEMPORARY_BAN",
    is_permanent: false,
    access_token: unben.trim(),
    ban_details: {
      ban_reason: "ACCOUNT_SUSPENDED",
      timer_active: true,
      remaining_days: timerDays,
      remaining_seconds: durationSeconds,
      unban_timestamp: expireTimestamp
    }
  });
}
