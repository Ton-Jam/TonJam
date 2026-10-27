import { useCallback } from 'react';
import { logError, ErrorMetadata, FormattedErrorPayload } from '@/lib/logger';
import { TaskStatus } from '@/components/earn/types';

export interface TaskErrorLoggerOptions {
  onError?: (error: unknown, record: FormattedErrorPayload) => void;
  defaultContext?: Partial<ErrorMetadata>;
}

/**
 * Custom React hook that wraps task completion logic, progress updates, and Firestore state syncs.
 * Uses the centralized logError utility from src/lib/logger to catch runtime errors and dispatch them
 * with consistent metadata (timestamp, user ID, task ID) to the simulated external monitoring service.
 */
export function useTaskErrorLogger(options?: TaskErrorLoggerOptions) {
  const { onError, defaultContext } = options || {};

  /**
   * Directly logs a task-related runtime error to the centralized monitoring service
   */
  const log = useCallback(
    (error: unknown, context?: ErrorMetadata): FormattedErrorPayload => {
      const mergedContext: ErrorMetadata = {
        ...defaultContext,
        ...context,
      };

      const record = logError(error, mergedContext);
      if (onError) {
        try {
          onError(error, record);
        } catch (cbErr) {
          console.warn('[useTaskErrorLogger] onError callback failed:', cbErr);
        }
      }
      return record;
    },
    [defaultContext, onError]
  );

  /**
   * Wraps task completion logic. Catches any runtime errors occurring during
   * status transitions or state updates, and logs them via the centralized logError service.
   *
   * @param taskId Unique identifier of the task being completed
   * @param completionFn The async function performing the task completion and state mutations
   * @param context Additional metadata context for the error report
   * @returns The result of completionFn, or null if an error was caught
   */
  const wrapTaskCompletion = useCallback(
    async <T>(
      taskId: string,
      completionFn: () => Promise<T>,
      context?: Partial<ErrorMetadata>
    ): Promise<T | null> => {
      try {
        return await completionFn();
      } catch (err) {
        log(err, {
          taskId,
          toStatus: 'completed' as TaskStatus,
          eventType: 'TASK_COMPLETION_FAILED',
          severity: 'error',
          message: `Runtime error while completing task "${taskId}"`,
          ...context,
        });
        return null;
      }
    },
    [log]
  );

  /**
   * Wraps task progress updates and status mutations in Firestore.
   * Catches runtime failures and reports to the centralized logError service.
   */
  const wrapStatusUpdate = useCallback(
    async <T>(
      taskId: string,
      updateFn: () => Promise<T>,
      context?: Partial<ErrorMetadata>
    ): Promise<T | null> => {
      try {
        return await updateFn();
      } catch (err) {
        log(err, {
          taskId,
          eventType: 'TASK_STATUS_UPDATE_FAILED',
          severity: 'error',
          message: `Failed to update task progress or status for task "${taskId}"`,
          ...context,
        });
        return null;
      }
    },
    [log]
  );

  /**
   * Wraps Firestore synchronization operations (e.g. setDoc, updateDoc) for task progress.
   * Automatically tracks failures in updating task progress status in Firestore.
   */
  const wrapFirestoreSync = useCallback(
    async <T>(
      path: string,
      syncFn: () => Promise<T>,
      context?: Partial<ErrorMetadata>
    ): Promise<T | null> => {
      try {
        return await syncFn();
      } catch (err) {
        log(err, {
          path,
          eventType: 'TASK_SYNC_FAILED',
          severity: 'error',
          message: `Firestore sync failure at "${path}"`,
          ...context,
        });
        return null;
      }
    },
    [log]
  );

  /**
   * Generic execution wrapper that catches runtime errors and invokes logError
   */
  const wrapTaskAction = useCallback(
    async <T>(
      action: () => Promise<T>,
      context?: ErrorMetadata
    ): Promise<T | null> => {
      try {
        return await action();
      } catch (err) {
        log(err, context);
        return null;
      }
    },
    [log]
  );

  return {
    logError: log,
    wrapTaskCompletion,
    wrapStatusUpdate,
    wrapFirestoreSync,
    wrapTaskAction,
  };
}

export default useTaskErrorLogger;
