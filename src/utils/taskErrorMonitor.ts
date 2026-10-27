import { Task, TaskStatus } from '@/components/earn/types';

export type TaskEventType =
  | 'TASK_STATUS_UPDATE_FAILED'
  | 'TASK_CLAIM_FAILED'
  | 'TASK_PROGRESS_FAILED'
  | 'TASK_COMPLETION_FAILED'
  | 'TASK_SYNC_FAILED'
  | 'TASK_ACTIVITY_RECORD_FAILED'
  | 'TASK_VALIDATION_ERROR';

export type TaskSeverity = 'warning' | 'error' | 'critical';

export interface TaskErrorPayload {
  eventType: TaskEventType;
  taskId?: string;
  taskTitle?: string;
  fromStatus?: TaskStatus | string;
  toStatus?: TaskStatus | string;
  error: unknown;
  message?: string;
  severity?: TaskSeverity;
  context?: {
    userId?: string;
    userBalance?: number;
    progress?: number;
    total?: number;
    incrementAmount?: number;
    rewardAmount?: number;
    completedAt?: string;
    activityType?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface StructuredTaskErrorRecord {
  id: string;
  timestamp: string;
  eventType: TaskEventType;
  severity: TaskSeverity;
  taskId: string | null;
  taskTitle: string | null;
  statusTransition: {
    from: string | null;
    to: string | null;
  };
  error: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
  context: {
    userId?: string;
    userBalance?: number;
    progress?: number;
    total?: number;
    incrementAmount?: number;
    rewardAmount?: number;
    completedAt?: string;
    activityType?: string;
    path?: string;
    metadata?: Record<string, unknown>;
    environment: string;
    url: string;
    userAgent: string;
    online: boolean;
  };
  handledGracefully: boolean;
}

const MAX_IN_MEMORY_LOGS = 50;
const errorLogBuffer: StructuredTaskErrorRecord[] = [];
const subscribers = new Set<(record: StructuredTaskErrorRecord) => void>();

// Helper to safely parse unknown errors
function normalizeError(err: unknown): { name: string; message: string; code?: string; stack?: string } {
  if (err instanceof Error) {
    return {
      name: err.name || 'Error',
      message: err.message || 'Unknown error occurred',
      code: (err as any).code || (err as any).status || undefined,
      stack: err.stack,
    };
  }
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    return {
      name: typeof errorObj.name === 'string' ? errorObj.name : 'TaskRuntimeError',
      message:
        typeof errorObj.message === 'string'
          ? errorObj.message
          : JSON.stringify(err),
      code: typeof errorObj.code === 'string' || typeof errorObj.code === 'number' ? String(errorObj.code) : undefined,
      stack: typeof errorObj.stack === 'string' ? errorObj.stack : undefined,
    };
  }
  return {
    name: 'TaskRuntimeError',
    message: String(err || 'Unknown error'),
  };
}

// Generate unique log id
function generateErrorId(): string {
  return `task_err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured error reporting utility for all task-related operations and state updates.
 * Logs to internal buffer, developer console, and remote monitoring service endpoint.
 */
export function reportTaskError(payload: TaskErrorPayload): StructuredTaskErrorRecord {
  const normalizedErr = normalizeError(payload.error);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'unknown';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  const environment = process.env.NODE_ENV || 'production';

  const record: StructuredTaskErrorRecord = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    eventType: payload.eventType,
    severity: payload.severity || 'error',
    taskId: payload.taskId || null,
    taskTitle: payload.taskTitle || null,
    statusTransition: {
      from: payload.fromStatus ? String(payload.fromStatus) : null,
      to: payload.toStatus ? String(payload.toStatus) : null,
    },
    error: {
      name: normalizedErr.name,
      message: payload.message || normalizedErr.message,
      code: normalizedErr.code,
      stack: normalizedErr.stack,
    },
    context: {
      userId: payload.context?.userId,
      userBalance: payload.context?.userBalance,
      progress: payload.context?.progress,
      total: payload.context?.total,
      incrementAmount: payload.context?.incrementAmount,
      rewardAmount: payload.context?.rewardAmount,
      completedAt: payload.context?.completedAt,
      activityType: payload.context?.activityType,
      path: payload.context?.path,
      metadata: payload.context?.metadata,
      environment,
      url: currentUrl,
      userAgent,
      online: isOnline,
    },
    handledGracefully: true,
  };

  // Add to local circular in-memory buffer
  errorLogBuffer.unshift(record);
  if (errorLogBuffer.length > MAX_IN_MEMORY_LOGS) {
    errorLogBuffer.pop();
  }

  // Backup in sessionStorage for production diagnostics
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tonjam_task_error_logs', JSON.stringify(errorLogBuffer.slice(0, 20)));
    }
  } catch {
    // Ignore storage quota / privacy mode issues
  }

  // Structured console log for developers
  const style =
    record.severity === 'critical'
      ? 'color: #ff334b; font-weight: bold;'
      : record.severity === 'warning'
      ? 'color: #f59e0b; font-weight: bold;'
      : 'color: #38bdf8; font-weight: bold;';

  console.error(
    `%c[TaskMonitor] [${record.severity.toUpperCase()}] ${record.eventType}: ${record.error.message}`,
    style,
    {
      taskId: record.taskId,
      transition: `${record.statusTransition.from || 'none'} -> ${record.statusTransition.to || 'none'}`,
      context: record.context,
      error: record.error,
    }
  );

  // Notify active subscribers
  subscribers.forEach((subscriber) => {
    try {
      subscriber(record);
    } catch (subErr) {
      console.warn('[TaskMonitor] Subscriber callback error:', subErr);
    }
  });

  // Dispatches to remote monitoring service endpoint asynchronously
  sendToMonitoringService(record).catch(() => {
    // Swallowed safely to ensure error reporting never causes secondary crashes
  });

  return record;
}

/**
 * Sends structured error payload to the server monitoring endpoint
 */
async function sendToMonitoringService(record: StructuredTaskErrorRecord): Promise<void> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return;
  }

  const endpoint = '/api/monitoring/task-errors';
  const bodyString = JSON.stringify(record);

  // Try sendBeacon first if browser supports it
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([bodyString], { type: 'application/json' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return;
    } catch {
      // Fallback to fetch
    }
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
      keepalive: true,
    });
  } catch (netErr) {
    // Server might be in static mode or offline; log notice once without crashing
    if (!(window as any)._taskMonitoringServiceNotice) {
      console.info('[TaskMonitor] Remote monitoring service unreachable; logs stored locally in session.');
      (window as any)._taskMonitoringServiceNotice = true;
    }
  }
}

/**
 * Retrieve recent structured task errors from in-memory cache
 */
export function getRecentTaskErrors(): StructuredTaskErrorRecord[] {
  return [...errorLogBuffer];
}

/**
 * Clear task error logs
 */
export function clearTaskErrors(): void {
  errorLogBuffer.length = 0;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tonjam_task_error_logs');
    }
  } catch {
    // Ignore
  }
}

export interface LogErrorContext {
  taskId?: string;
  taskTitle?: string;
  fromStatus?: TaskStatus | string;
  toStatus?: TaskStatus | string;
  eventType?: TaskEventType;
  severity?: TaskSeverity;
  message?: string;
  userId?: string;
  userBalance?: number;
  progress?: number;
  total?: number;
  incrementAmount?: number;
  rewardAmount?: number;
  completedAt?: string;
  activityType?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Centralized logError service for task-related logic, state updates, and Firestore failures
 */
export function logError(
  error: unknown,
  context?: LogErrorContext
): StructuredTaskErrorRecord {
  return reportTaskError({
    eventType: context?.eventType || 'TASK_STATUS_UPDATE_FAILED',
    taskId: context?.taskId,
    taskTitle: context?.taskTitle,
    fromStatus: context?.fromStatus,
    toStatus: context?.toStatus,
    error,
    message: context?.message,
    severity: context?.severity || 'error',
    context: {
      userId: context?.userId,
      userBalance: context?.userBalance,
      progress: context?.progress,
      total: context?.total,
      incrementAmount: context?.incrementAmount,
      rewardAmount: context?.rewardAmount,
      completedAt: context?.completedAt,
      activityType: context?.activityType,
      path: context?.path,
      metadata: context?.metadata,
    },
  });
}

/**
 * Subscribe to task error events for diagnostic views or alerts
 */
export function subscribeToTaskErrors(listener: (error: StructuredTaskErrorRecord) => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

// Attach developer diagnostics to window for debugging in production console
if (typeof window !== 'undefined') {
  (window as any).__TONJAM_TASK_MONITOR__ = {
    reportTaskError,
    logError,
    getRecentTaskErrors,
    clearTaskErrors,
    subscribeToTaskErrors,
    simulateTestError: (status = 'claimable') => {
      return reportTaskError({
        eventType: 'TASK_STATUS_UPDATE_FAILED',
        taskId: 't-test-simulated',
        taskTitle: 'Simulated Debug Task',
        fromStatus: 'in_progress',
        toStatus: status,
        error: new Error('Simulated task status transition failure for monitoring validation'),
        severity: 'warning',
        context: {
          progress: 3,
          total: 3,
          metadata: { isSimulation: true },
        },
      });
    },
  };
}
