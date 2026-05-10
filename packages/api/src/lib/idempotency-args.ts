export type WithIdempotencyKey<T> = T & {
  idempotencyKey?: string;
};
