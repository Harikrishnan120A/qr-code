/**
 * Simple in-memory rate limiting for QR scan operations
 * Prevents duplicate scans within 5 seconds for the same token
 */

interface RateLimitEntry {
  lastScan: number;
  count: number;
}

class RateLimit {
  private tokens: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number = 5000; // 5 seconds
  private readonly maxAttempts: number = 1;

  /**
   * Check if a token is rate limited
   * @param token QR token to check
   * @returns true if allowed, false if rate limited
   */
  isAllowed(token: string): boolean {
    const now = Date.now();
    const entry = this.tokens.get(token);

    if (!entry) {
      this.tokens.set(token, { lastScan: now, count: 1 });
      return true;
    }

    // Clean up old entries periodically
    if (now - entry.lastScan > this.windowMs) {
      this.tokens.set(token, { lastScan: now, count: 1 });
      return true;
    }

    // Within rate limit window
    if (entry.count >= this.maxAttempts) {
      return false;
    }

    entry.count++;
    entry.lastScan = now;
    return true;
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    for (const [token, entry] of this.tokens.entries()) {
      if (now - entry.lastScan > this.windowMs * 2) {
        this.tokens.delete(token);
      }
    }
  }
}

export const rateLimit = new RateLimit();

// Clean up rate limit entries every minute
setInterval(() => {
  rateLimit.cleanup();
}, 60000);