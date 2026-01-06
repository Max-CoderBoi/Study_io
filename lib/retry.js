import {
  PDFIndexError,
  ERROR_CODES,
  createError,
  isRecoverableError,
} from "./errors.js";

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true, // Add randomness to prevent thundering herd
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt, config) {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  
  // Cap at maxDelay
  delay = Math.min(delay, config.maxDelay);
  
  // Add jitter to prevent synchronized retries (thundering herd problem)
  if (config.jitter) {
    const jitterAmount = delay * 0.1; // ±10% jitter
    delay = delay + (Math.random() * 2 - 1) * jitterAmount;
  }
  
  return Math.floor(delay);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>} Result of the operation
 */
export async function retryWithBackoff(operation, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const { maxAttempts, operationName = "Operation" } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Attempt the operation
      const result = await operation();
      
      // Success! Log if this wasn't the first attempt
      if (attempt > 0) {
        console.log(`  ✓ ${operationName} succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      const shouldRetry = isRecoverableError(error) || options.retryAllErrors;
      const isLastAttempt = attempt === maxAttempts - 1;
      
      if (!shouldRetry) {
        console.error(`  ✗ ${operationName} failed with non-recoverable error`);
        throw error;
      }
      
      if (isLastAttempt) {
        console.error(`  ✗ ${operationName} failed after ${maxAttempts} attempts`);
        throw createError(ERROR_CODES.RETRY_EXHAUSTED, {
          operationName,
          attempts: maxAttempts,
          lastError: error.message,
          lastErrorCode: error.code,
        });
      }
      
      // Calculate delay and log retry attempt
      const delay = calculateDelay(attempt, config);
      console.warn(
        `  ⚠️  ${operationName} failed (attempt ${attempt + 1}/${maxAttempts}): ${error.message}`
      );
      console.log(`  ⏳ Retrying in ${(delay / 1000).toFixed(2)}s...`);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Retry wrapper with custom retry conditions
 * @param {Function} operation - Async function to retry
 * @param {Function} shouldRetry - Custom function to determine if error is retryable
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retryWithCondition(operation, shouldRetry, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const { maxAttempts, operationName = "Operation" } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxAttempts - 1;
      
      // Use custom retry condition
      if (!shouldRetry(error) || isLastAttempt) {
        if (isLastAttempt) {
          throw createError(ERROR_CODES.RETRY_EXHAUSTED, {
            operationName,
            attempts: maxAttempts,
            lastError: error.message,
          });
        }
        throw error;
      }
      
      const delay = calculateDelay(attempt, config);
      console.warn(
        `  ⚠️  ${operationName} failed (attempt ${attempt + 1}/${maxAttempts})`
      );
      console.log(`  ⏳ Retrying in ${(delay / 1000).toFixed(2)}s...`);
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry with rate limit handling
 * Detects rate limit errors and waits longer
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retryWithRateLimit(operation, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const { maxAttempts, operationName = "Operation" } = config;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxAttempts - 1;
      
      // Check if this is a rate limit error
      const isRateLimitError =
        error.code === ERROR_CODES.RATE_LIMIT_EXCEEDED ||
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("too many requests");
      
      if (isLastAttempt) {
        throw createError(ERROR_CODES.RETRY_EXHAUSTED, {
          operationName,
          attempts: maxAttempts,
          lastError: error.message,
        });
      }
      
      // For rate limits, wait longer
      let delay = calculateDelay(attempt, config);
      if (isRateLimitError) {
        delay = delay * 3; // Triple the wait time for rate limits
        console.warn(`  🚦 Rate limit detected for ${operationName}`);
      } else {
        console.warn(
          `  ⚠️  ${operationName} failed (attempt ${attempt + 1}/${maxAttempts}): ${error.message}`
        );
      }
      
      console.log(`  ⏳ Retrying in ${(delay / 1000).toFixed(2)}s...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Create a retryable version of an async function
 * @param {Function} fn - Async function to make retryable
 * @param {Object} config - Retry configuration
 * @returns {Function} Retryable version of the function
 */
export function makeRetryable(fn, config = {}) {
  return async function (...args) {
    return retryWithBackoff(() => fn(...args), {
      ...config,
      operationName: config.operationName || fn.name || "Anonymous function",
    });
  };
}

/**
 * Batch retry - retry multiple operations with shared backoff
 * @param {Array<Function>} operations - Array of async functions
 * @param {Object} options - Retry options
 * @returns {Promise<Array>} Results from all operations
 */
export async function retryBatch(operations, options = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const results = [];
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    const operationName = `${config.operationName || "Operation"} ${i + 1}`;
    
    const result = await retryWithBackoff(operation, {
      ...config,
      operationName,
    });
    
    results.push(result);
  }
  
  return results;
}

/**
 * Retry statistics tracker for monitoring
 */
export class RetryStats {
  constructor() {
    this.totalAttempts = 0;
    this.successfulRetries = 0;
    this.failedOperations = 0;
    this.totalRetryDelay = 0;
  }

  recordAttempt(attempt, success, delay = 0) {
    this.totalAttempts++;
    if (success && attempt > 0) {
      this.successfulRetries++;
    }
    if (!success) {
      this.failedOperations++;
    }
    this.totalRetryDelay += delay;
  }

  getStats() {
    return {
      totalAttempts: this.totalAttempts,
      successfulRetries: this.successfulRetries,
      failedOperations: this.failedOperations,
      totalRetryDelay: this.totalRetryDelay,
      averageRetryDelay:
        this.successfulRetries > 0
          ? this.totalRetryDelay / this.successfulRetries
          : 0,
    };
  }

  reset() {
    this.totalAttempts = 0;
    this.successfulRetries = 0;
    this.failedOperations = 0;
    this.totalRetryDelay = 0;
  }
}