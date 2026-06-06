/**
 * Lightweight, environment-aware structured logger.
 *
 * - `debug`/`info` are silenced in production builds to keep the console clean.
 * - `warn`/`error` always emit so real problems are never swallowed.
 * - Context is passed as a plain object and `Error` values are serialized so
 *   stack traces survive (a raw Error logs as `{}` in some transports).
 *
 * This is the single seam for wiring a remote sink later (Sentry, Datadog,
 * LogRocket, …): forward from `emit` instead of touching every call site.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const isProduction = import.meta.env.PROD;

function serializeError(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function normalizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const normalized: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    normalized[key] = value instanceof Error ? serializeError(value) : value;
  }
  return normalized;
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (isProduction && (level === "debug" || level === "info")) return;

  const payload = normalizeContext(context);
  const args: unknown[] = [`[${level.toUpperCase()}] ${message}`];
  if (payload) args.push(payload);

  // The logger is the single sanctioned console boundary for the app.
  console[level](...args);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
};
