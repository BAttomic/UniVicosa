type Attempt = { key: string; timestamp: number };

type RateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
};

const attempts: Attempt[] = [];

export function consumeRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const threshold = now - config.windowMs;

  for (let i = attempts.length - 1; i >= 0; i -= 1) {
    const attempt = attempts[i];
    if (attempt && attempt.timestamp < threshold) {
      attempts.splice(i, 1);
    }
  }

  const currentCount = attempts.filter((item) => item.key === key).length;
  if (currentCount >= config.maxAttempts) {
    return false;
  }

  attempts.push({ key, timestamp: now });
  return true;
}
