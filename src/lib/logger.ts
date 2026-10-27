/**
 * Centralized Logger & Error Monitoring Service
 * 
 * Provides consistent error formatting with unified metadata (timestamp, user ID, task ID)
 * and simulated external monitoring service transport (e.g., Sentry/Datadog/Cloud Monitoring).
 */

import { auth } from './firebase';
import { reportTaskError, TaskEventType, TaskSeverity } from '../utils/taskErrorMonitor';

// Re-export base console filters and logger utilities
export * from '../../lib/logger';
export { default } from '../../lib/logger';

export interface ErrorMetadata {
  taskId?: string;
  userId?: string;
  taskTitle?: string;
  fromStatus?: string;
  toStatus?: string;
  eventType?: TaskEventType | string;
  severity?: TaskSeverity | 'info';
  message?: string;
  progress?: number;
  total?: number;
  rewardAmount?: number;
  completedAt?: string;
  path?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FormattedErrorPayload {
  id: string;
  timestamp: string;
  userId: string;
  taskId: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata: ErrorMetadata;
  environment: string;
  url: string;
  userAgent: string;
  simulatedService: string;
}

// In-memory queue of errors dispatched to monitoring service
const monitoringQueue: FormattedErrorPayload[] = [];
const MAX_QUEUE_SIZE = 50;

/**
 * Normalizes any caught runtime error object into a standard representation
 */
function normalizeError(err: unknown): { name: string; message: string; stack?: string; code?: string } {
  if (err instanceof Error) {
    return {
      name: err.name || 'Error',
      message: err.message || 'An unexpected runtime error occurred',
      stack: err.stack,
      code: (err as any).code || (err as any).status ? String((err as any).code || (err as any).status) : undefined,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;
    return {
      name: typeof obj.name === 'string' ? obj.name : 'RuntimeError',
      message: typeof obj.message === 'string' ? obj.message : JSON.stringify(err),
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
      code: typeof obj.code === 'string' || typeof obj.code === 'number' ? String(obj.code) : undefined,
    };
  }

  return {
    name: 'RuntimeError',
    message: String(err || 'Unknown error occurred'),
  };
}

/**
 * Generates an idempotent, unique monitoring trace ID
 */
function generateTraceId(): string {
  return `mon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Simulates transmission to an external monitoring service (e.g. Sentry / Datadog / Google Cloud Logging)
 * while also sending to the local backend ingestion endpoint when available.
 */
async function transmitToExternalMonitoring(payload: FormattedErrorPayload): Promise<void> {
  // 1. Maintain in-memory monitoring queue for production developer diagnostics
  monitoringQueue.unshift(payload);
  if (monitoringQueue.length > MAX_QUEUE_SIZE) {
    monitoringQueue.pop();
  }

  // 2. Dispatch simulated telemetry event for dev inspection
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('tonjam:monitoring:error', {
          detail: payload,
        })
      );
    } catch {
      // Ignore
    }
  }

  // 3. Asynchronously transmit to production monitoring endpoint
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    const endpoint = '/api/monitoring/task-errors';
    const bodyStr = JSON.stringify(payload);

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        if (navigator.sendBeacon(endpoint, blob)) {
          return;
        }
      }

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      });
    } catch {
      // Failsafe: External monitoring simulation logs locally without throwing secondary failures
    }
  }
}

/**
 * Centralized logError function:
 * Formats errors with consistent metadata (timestamp, user ID, task ID)
 * and dispatches them to the external monitoring service.
 *
 * @param error The caught error or exception
 * @param metadata Contextual metadata including taskId, userId, status transitions, etc.
 * @returns The structured and formatted error payload
 */
export function logError(error: unknown, metadata?: ErrorMetadata): FormattedErrorPayload {
  const normalized = normalizeError(error);
  const timestamp = new Date().toISOString();
  
  // Resolve user ID consistently: explicit metadata > Firebase authenticated user > anonymous
  const resolvedUserId = metadata?.userId || auth.currentUser?.uid || 'anonymous_user';
  const resolvedTaskId = metadata?.taskId || 'unspecified_task';
  const environment = process.env.NODE_ENV || 'production';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'unknown';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

  const formattedPayload: FormattedErrorPayload = {
    id: generateTraceId(),
    timestamp,
    userId: resolvedUserId,
    taskId: resolvedTaskId,
    error: {
      name: normalized.name,
      message: metadata?.message || normalized.message,
      stack: normalized.stack,
      code: normalized.code,
    },
    metadata: {
      ...metadata,
      taskId: resolvedTaskId,
      userId: resolvedUserId,
    },
    environment,
    url: currentUrl,
    userAgent,
    simulatedService: 'CloudMonitoringService::TonJam-External-Telemetry-v1',
  };

  // Structured console log for developers with distinctive formatting
  const severity = metadata?.severity || 'error';
  const badgeColor =
    severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#38bdf8';

  console.error(
    `%c[ExternalMonitoring::${severity.toUpperCase()}]%c [Task: ${resolvedTaskId}] [User: ${resolvedUserId}] ${formattedPayload.error.message}`,
    `background: ${badgeColor}; color: #000; font-weight: bold; border-radius: 2px; padding: 1px 4px;`,
    'color: inherit; font-weight: normal;',
    {
      traceId: formattedPayload.id,
      timestamp: formattedPayload.timestamp,
      taskId: formattedPayload.taskId,
      userId: formattedPayload.userId,
      error: formattedPayload.error,
      metadata: formattedPayload.metadata,
    }
  );

  // Synchronize with taskErrorMonitor for app-wide parity
  try {
    reportTaskError({
      eventType: (metadata?.eventType as TaskEventType) || 'TASK_STATUS_UPDATE_FAILED',
      taskId: resolvedTaskId,
      taskTitle: metadata?.taskTitle,
      fromStatus: metadata?.fromStatus,
      toStatus: metadata?.toStatus,
      error,
      message: metadata?.message,
      severity: severity === 'info' ? 'warning' : severity,
      context: {
        userId: resolvedUserId,
        progress: metadata?.progress,
        total: metadata?.total,
        incrementAmount: typeof metadata?.incrementAmount === 'number' ? metadata.incrementAmount : undefined,
        rewardAmount: metadata?.rewardAmount,
        completedAt: metadata?.completedAt,
        path: metadata?.path,
        metadata: metadata?.context || metadata,
      },
    });
  } catch {
    // Failsafe
  }

  // Transmit to simulated external monitoring transport
  transmitToExternalMonitoring(formattedPayload).catch(() => {});

  return formattedPayload;
}

/**
 * Retrieve recent telemetry payloads from the simulated external monitoring queue
 */
export function getMonitoringQueue(): FormattedErrorPayload[] {
  return [...monitoringQueue];
}

/**
 * Clear the simulated external monitoring queue
 */
export function clearMonitoringQueue(): void {
  monitoringQueue.length = 0;
}
