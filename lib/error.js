/**
 * Custom error class for PDF indexing operations
 * Provides structured error handling with error codes and context
 */
export class PDFIndexError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Machine-readable error code
   * @param {Object} context - Additional error context
   */
  constructor(message, code, context = {}) {
    super(message);
    this.name = "PDFIndexError";
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PDFIndexError);
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Check if error is of a specific type
   */
  isType(code) {
    return this.code === code;
  }
}

/**
 * Error codes for different failure scenarios
 */
export const ERROR_CODES = {
  // Environment & Configuration
  ENV_MISSING: "ENV_MISSING",
  CONFIG_INVALID: "CONFIG_INVALID",
  
  // File System
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_ACCESS_DENIED: "FILE_ACCESS_DENIED",
  NOT_FILE: "NOT_FILE",
  EMPTY_FILE: "EMPTY_FILE",
  INVALID_PDF: "INVALID_PDF",
  
  // PDF Processing
  EMPTY_PDF: "EMPTY_PDF",
  PDF_LOAD_FAILED: "PDF_LOAD_FAILED",
  PDF_PARSE_ERROR: "PDF_PARSE_ERROR",
  CHUNKING_FAILED: "CHUNKING_FAILED",
  
  // API & Network
  API_KEY_INVALID: "API_KEY_INVALID",
  NETWORK_ERROR: "NETWORK_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  RETRY_EXHAUSTED: "RETRY_EXHAUSTED",
  
  // Voyage AI
  EMBEDDING_FAILED: "EMBEDDING_FAILED",
  EMBEDDING_TIMEOUT: "EMBEDDING_TIMEOUT",
  
  // Pinecone
  PINECONE_CONNECTION_FAILED: "PINECONE_CONNECTION_FAILED",
  PINECONE_UPSERT_FAILED: "PINECONE_UPSERT_FAILED",
  NAMESPACE_ERROR: "NAMESPACE_ERROR",
  INDEX_NOT_FOUND: "INDEX_NOT_FOUND",
  
  // General
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Error messages mapped to error codes
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.ENV_MISSING]: "Required environment variables are missing",
  [ERROR_CODES.CONFIG_INVALID]: "Configuration is invalid",
  [ERROR_CODES.FILE_NOT_FOUND]: "PDF file not found",
  [ERROR_CODES.FILE_ACCESS_DENIED]: "Permission denied to access file",
  [ERROR_CODES.NOT_FILE]: "Path does not point to a file",
  [ERROR_CODES.EMPTY_FILE]: "File is empty",
  [ERROR_CODES.INVALID_PDF]: "File is not a valid PDF",
  [ERROR_CODES.EMPTY_PDF]: "PDF contains no extractable content",
  [ERROR_CODES.PDF_LOAD_FAILED]: "Failed to load PDF",
  [ERROR_CODES.PDF_PARSE_ERROR]: "Failed to parse PDF content",
  [ERROR_CODES.CHUNKING_FAILED]: "Failed to split document into chunks",
  [ERROR_CODES.API_KEY_INVALID]: "API key is invalid or expired",
  [ERROR_CODES.NETWORK_ERROR]: "Network connection failed",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "API rate limit exceeded",
  [ERROR_CODES.RETRY_EXHAUSTED]: "Maximum retry attempts exhausted",
  [ERROR_CODES.EMBEDDING_FAILED]: "Failed to generate embeddings",
  [ERROR_CODES.EMBEDDING_TIMEOUT]: "Embedding generation timed out",
  [ERROR_CODES.PINECONE_CONNECTION_FAILED]: "Failed to connect to Pinecone",
  [ERROR_CODES.PINECONE_UPSERT_FAILED]: "Failed to upsert vectors to Pinecone",
  [ERROR_CODES.NAMESPACE_ERROR]: "Namespace operation failed",
  [ERROR_CODES.INDEX_NOT_FOUND]: "Pinecone index not found",
  [ERROR_CODES.UNKNOWN_ERROR]: "An unknown error occurred",
};

/**
 * Factory function to create errors with proper context
 */
export function createError(code, details = {}) {
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  const fullMessage = details.message ? `${message}: ${details.message}` : message;
  
  return new PDFIndexError(fullMessage, code, details);
}

/**
 * Wrap native errors into PDFIndexError
 */
export function wrapError(error, code, context = {}) {
  if (error instanceof PDFIndexError) {
    return error;
  }
  
  return new PDFIndexError(
    error.message || "Unknown error occurred",
    code || ERROR_CODES.UNKNOWN_ERROR,
    {
      ...context,
      originalError: error.name,
      originalStack: error.stack,
    }
  );
}

/**
 * Check if error is recoverable (can retry)
 */
export function isRecoverableError(error) {
  if (!(error instanceof PDFIndexError)) {
    return false;
  }
  
  const recoverableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    ERROR_CODES.EMBEDDING_TIMEOUT,
    ERROR_CODES.PINECONE_CONNECTION_FAILED,
  ];
  
  return recoverableCodes.includes(error.code);
}

/**
 * Check if error is a configuration issue
 */
export function isConfigError(error) {
  if (!(error instanceof PDFIndexError)) {
    return false;
  }
  
  const configCodes = [
    ERROR_CODES.ENV_MISSING,
    ERROR_CODES.CONFIG_INVALID,
    ERROR_CODES.API_KEY_INVALID,
  ];
  
  return configCodes.includes(error.code);
}

/**
 * Format error for user-friendly display
 */
export function formatError(error) {
  if (error instanceof PDFIndexError) {
    const lines = [
      `❌ Error: ${error.message}`,
      `   Code: ${error.code}`,
    ];
    
    if (Object.keys(error.context).length > 0) {
      lines.push(`   Details: ${JSON.stringify(error.context, null, 2)}`);
    }
    
    return lines.join("\n");
  }
  
  return `❌ Error: ${error.message || "Unknown error"}`;
}