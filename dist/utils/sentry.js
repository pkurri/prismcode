"use strict";
/**
 * Sentry Integration
 *
 * Error tracking and monitoring using Sentry
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureException = captureException;
exports.captureMessage = captureMessage;
exports.setUser = setUser;
exports.addBreadcrumb = addBreadcrumb;
exports.wrapAsync = wrapAsync;
exports.flush = flush;
const Sentry = __importStar(require("@sentry/node"));
const logger_1 = __importDefault(require("./logger"));
const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.npm_package_version || '0.1.0';
// Initialize Sentry only if DSN is provided
if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: NODE_ENV,
        release: `prismcode@${APP_VERSION}`,
        tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
        // Add integrations as needed
        ],
    });
    logger_1.default.info('Sentry initialized', { environment: NODE_ENV, release: APP_VERSION });
}
else {
    logger_1.default.warn('Sentry DSN not provided, error tracking disabled');
}
/**
 * Capture an exception with Sentry
 */
function captureException(error, context) {
    logger_1.default.error('Exception captured', { error: error.message, stack: error.stack, ...context });
    if (SENTRY_DSN) {
        Sentry.captureException(error, {
            contexts: context ? { custom: context } : undefined,
        });
    }
}
/**
 * Capture a message with Sentry
 */
function captureMessage(message, level = 'info', context) {
    logger_1.default.log(level, message, context);
    if (SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level,
            contexts: context ? { custom: context } : undefined,
        });
    }
}
/**
 * Set user context for error tracking
 */
function setUser(user) {
    if (SENTRY_DSN) {
        Sentry.setUser(user);
    }
}
/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(category, message, level = 'info', data) {
    if (SENTRY_DSN) {
        Sentry.addBreadcrumb({
            category,
            message,
            level,
            data,
        });
    }
}
/**
 * Wrap an async function with error tracking
 */
function wrapAsync(fn, context) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            captureException(error, { ...context, args });
            throw error;
        }
    });
}
/**
 * Flush Sentry events (call before process exit)
 */
async function flush(timeout = 2000) {
    if (SENTRY_DSN) {
        await Sentry.flush(timeout);
        logger_1.default.info('Sentry events flushed');
    }
}
exports.default = Sentry;
//# sourceMappingURL=sentry.js.map