// Limitador de peticiones sencillo en memoria (por instancia).
// En producción con varias instancias se recomienda Redis/Upstash.

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number;
}

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(opts.key);
  if (!entry || entry.resetAt < now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count > opts.limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function clearBucket(key: string) {
  buckets.delete(key);
}
