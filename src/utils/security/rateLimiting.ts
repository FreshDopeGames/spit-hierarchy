
// Rate limiting functionality for file uploads
import { UploadAttempt } from './types';

// Rate limiting for file uploads
class UploadRateLimiter {
  private attempts: Map<string, UploadAttempt[]> = new Map();
  private readonly maxAttempts: number = 10;
  private readonly windowMs: number = 60 * 1000; // 1 minute

  canUpload(identifier: string, filename: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter out old attempts
    const recentAttempts = userAttempts.filter(attempt => 
      now - attempt.timestamp < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return { 
        allowed: false, 
        reason: `Upload rate limit exceeded. Try again in ${Math.ceil((this.windowMs - (now - recentAttempts[0].timestamp)) / 1000)} seconds.`
      };
    }

    // Record this attempt
    recentAttempts.push({ timestamp: now, filename, success: false });
    this.attempts.set(identifier, recentAttempts);

    return { allowed: true };
  }

  recordSuccess(identifier: string): void {
    const attempts = this.attempts.get(identifier);
    if (attempts && attempts.length > 0) {
      attempts[attempts.length - 1].success = true;
    }
  }
}

export const uploadRateLimiter = new UploadRateLimiter();
