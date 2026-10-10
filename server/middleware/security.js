const memoryStore = new Map();

export const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

export const rateLimit = (limit = 180, windowMs = 15 * 60 * 1000) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const entry = memoryStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  memoryStore.set(key, entry);

  if (entry.count > limit) return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  return next();
};

const cleanValue = (value) => {
  if (typeof value === 'string') return value.replace(/[<>]/g, '').trim();
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      if (!key.startsWith('$') && !key.includes('.')) acc[key] = cleanValue(value[key]);
      return acc;
    }, {});
  }
  return value;
};

export const sanitizeInput = (req, _res, next) => {
  req.body = cleanValue(req.body || {});
  req.query = cleanValue(req.query || {});
  req.params = cleanValue(req.params || {});
  next();
};

export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });



const authRateLimitStore = new Map();

export const authRateLimit = (
  limit = 10,
  windowMs = 15 * 60 * 1000
) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl}${req.path}`;
  const now = Date.now();

  const entry = authRateLimitStore.get(key) || {
    count: 0,
    resetAt: now + windowMs,
  };

  if (entry.resetAt <= now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  authRateLimitStore.set(key, entry);

  if (entry.count > limit) {
    return res.status(429).json({
      message: 'Too many attempts. Please try again later.',
    });
  }

  return next();
};


export const errorHandler = (error, _req, res, _next) => {
  const status =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;

  if (status >= 500) {
    console.error('Server error:', error);
    return res.status(500).json({
      message: 'Something went wrong. Please try again later.',
    });
  }

  return res.status(status).json({
    message: error.message || 'Request failed.',
  });
};
