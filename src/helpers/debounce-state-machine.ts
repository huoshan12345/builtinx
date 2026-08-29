import type { Nullable } from '@/types/lib';
import { DebounceOptions, type DebounceCallback } from '@/types/debounce-options';

type Timer = ReturnType<typeof setTimeout>;

type DebounceState<TArgs extends any[]> =
  | { phase: 'idle' }
  | WaitingState<TArgs>;

interface WaitingState<TArgs extends any[]> {
  phase: 'waiting';
  debounceTimer: Nullable<Timer>;
  maxWaitTimer: Nullable<Timer>;
  pendingArgs?: TArgs;
}

/**
 * State-machine implementation of `debounce`, provided alongside the existing implementation
 * for behavior and maintainability comparison.
 *
 * The machine has two phases: `idle`, where no debounce window exists, and `waiting`, which
 * owns the inactivity timer, optional maximum-wait timer, and latest pending arguments.
 */
export function debounceWithStateMachine<TArgs extends any[]>(
  callback: DebounceCallback<TArgs>,
  options: Partial<DebounceOptions<TArgs>>,
): DebounceCallback<TArgs> {
  const opts = new DebounceOptions(options);
  let state: DebounceState<TArgs> = { phase: 'idle' };

  const invoke = (args: TArgs) => {
    opts.beforeCallback?.(...args);
    callback(...args);
    opts.afterCallback?.(...args);
  };

  const invokePending = (waiting: WaitingState<TArgs>) => {
    const args = waiting.pendingArgs;
    waiting.pendingArgs = undefined;

    if (args !== undefined) {
      invoke(args);
    }
  };

  const cancelMaxWait = (waiting: WaitingState<TArgs>) => {
    if (waiting.maxWaitTimer != null) {
      clearTimeout(waiting.maxWaitTimer);
      waiting.maxWaitTimer = null;
    }
  };

  const finishWaiting = (waiting: WaitingState<TArgs>) => {
    if (state !== waiting) {
      return;
    }

    cancelMaxWait(waiting);
    state = { phase: 'idle' };

    if (opts.trailing) {
      invokePending(waiting);
    } else {
      waiting.pendingArgs = undefined;
    }
  };

  const scheduleMaxWait = (waiting: WaitingState<TArgs>) => {
    if (opts.maxWaitMs == null || waiting.maxWaitTimer != null) {
      return;
    }

    waiting.maxWaitTimer = setTimeout(() => {
      if (state !== waiting) {
        return;
      }

      waiting.maxWaitTimer = null;
      invokePending(waiting);
    }, opts.maxWaitMs);
  };

  const queuePending = (waiting: WaitingState<TArgs>, args: TArgs) => {
    waiting.pendingArgs = args;
    scheduleMaxWait(waiting);
  };

  const restartDebounceTimer = (waiting: WaitingState<TArgs>) => {
    if (waiting.debounceTimer != null) {
      clearTimeout(waiting.debounceTimer);
    }

    waiting.debounceTimer = setTimeout(
      () => finishWaiting(waiting),
      opts.debounceMs,
    );
  };

  const startWaiting = (args: TArgs) => {
    if (opts.leading) {
      invoke(args);
    }

    const waiting: WaitingState<TArgs> = {
      phase: 'waiting',
      debounceTimer: null,
      maxWaitTimer: null,
    };
    state = waiting;

    if (!opts.leading && (opts.trailing || opts.maxWaitMs != null)) {
      queuePending(waiting, args);
    }

    restartDebounceTimer(waiting);
  };

  const continueWaiting = (waiting: WaitingState<TArgs>, args: TArgs) => {
    if (opts.trailing || opts.maxWaitMs != null) {
      queuePending(waiting, args);
    }

    restartDebounceTimer(waiting);
  };

  return (...args: TArgs) => {
    if (opts.shouldSkip?.(...args) === true) {
      opts.onSkipped?.(...args);
      return;
    }

    if (!opts.leading && !opts.trailing) {
      return;
    }

    if (state.phase === 'idle') {
      startWaiting(args);
    } else {
      continueWaiting(state, args);
    }
  };
}
