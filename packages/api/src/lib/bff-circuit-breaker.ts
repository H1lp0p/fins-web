import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type BffCircuitBreakerConfig = {
  /** Подряд «плохих» ответов до размыкания (по умолчанию 5). */
  failureThreshold?: number;
  /** Мс до попытки half-open (по умолчанию 30_000). */
  recoveryMs?: number;
  enabled?: boolean;
};

const DEFAULT_THRESHOLD = 5;
const DEFAULT_RECOVERY_MS = 30_000;

export class BffCircuitBreaker {
  private state: "closed" | "open" | "half_open" = "closed";
  private failures = 0;
  private openedAt: number | null = null;
  private readonly threshold: number;
  private readonly recoveryMs: number;
  private readonly enabled: boolean;

  constructor(config: BffCircuitBreakerConfig = {}) {
    this.enabled = config.enabled !== false;
    this.threshold = Math.max(1, config.failureThreshold ?? DEFAULT_THRESHOLD);
    this.recoveryMs = Math.max(100, config.recoveryMs ?? DEFAULT_RECOVERY_MS);
  }

  /** true — не вызывать fetch, вернуть синтетическую ошибку. */
  shouldBlock(): boolean {
    if (!this.enabled) {
      return false;
    }
    if (this.state === "closed") {
      return false;
    }
    if (this.state === "open") {
      const now = Date.now();
      if (
        this.openedAt !== null &&
        now - this.openedAt >= this.recoveryMs
      ) {
        this.state = "half_open";
        return false;
      }
      return true;
    }
    return false;
  }

  recordFromFetchBaseResult(result: {
    error?: FetchBaseQueryError | unknown;
    data?: unknown;
    meta?: unknown;
  }): void {
    if (!this.enabled) {
      return;
    }
    if ("error" in result && result.error !== undefined) {
      if (isCircuitFailure(result.error as FetchBaseQueryError)) {
        this.recordFailure();
      } else {
        this.recordSuccess();
      }
      return;
    }
    this.recordSuccess();
  }

  private recordSuccess(): void {
    if (!this.enabled) {
      return;
    }
    if (this.state === "half_open") {
      this.failures = 0;
      this.state = "closed";
      this.openedAt = null;
      return;
    }
    this.failures = 0;
  }

  private recordFailure(): void {
    if (!this.enabled) {
      return;
    }
    if (this.state === "half_open") {
      this.failures = this.threshold;
      this.state = "open";
      this.openedAt = Date.now();
      return;
    }
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }
}

function isCircuitFailure(error: unknown): boolean {
  if (error === null || typeof error !== "object" || !("status" in error)) {
    return false;
  }
  const { status } = error as { status: unknown };
  if (
    status === "FETCH_ERROR" ||
    status === "PARSING_ERROR" ||
    status === "TIMEOUT_ERROR"
  ) {
    return true;
  }
  if (typeof status === "number" && status >= 500) {
    return true;
  }
  return false;
}

let sharedBreaker: BffCircuitBreaker | null = null;
let explicitlyDisabled = false;

export function resetSharedBffCircuitBreakerForTests(): void {
  sharedBreaker = null;
  explicitlyDisabled = false;
}

/** Экземпляр после первого RTK-запроса (или null, если отключено / ещё не создавали). */
export function getSharedBffCircuitBreaker(): BffCircuitBreaker | null {
  return sharedBreaker;
}

export function resolveSharedBffCircuitBreaker(
  circuitBreaker: BffClientCircuitBreakerOption,
): BffCircuitBreaker | null {
  if (circuitBreaker === false) {
    sharedBreaker = null;
    explicitlyDisabled = true;
    return null;
  }
  if (explicitlyDisabled) {
    return null;
  }
  if (sharedBreaker !== null) {
    return sharedBreaker;
  }
  const cfg =
    circuitBreaker === true || circuitBreaker === undefined
      ? {}
      : circuitBreaker;
  sharedBreaker = new BffCircuitBreaker(cfg);
  return sharedBreaker;
}

export type BffClientCircuitBreakerOption =
  | boolean
  | BffCircuitBreakerConfig
  | undefined;
