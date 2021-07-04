import {ForgedResponse} from './types';

export function promisify<P extends unknown[], R>(item: ForgedResponse<P, R>): Record<symbol, () => Promise<ForgedResponse<P, R>>> {
  return {[item._promiseId]: () => Promise.resolve(item)};
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function toArray<T>(value: T | T[] | Record<string, T> | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (isObject(value)) return Object.values(value);
  return [value];
}

function createDeferredPromise<T>(): [Promise<T>, (value: T) => void] {
  let resolver: (value: T) => void = () => {};
  return [new Promise<T>((resolve) => void (resolver = resolve)), resolver];
}

export function respond<P extends unknown[]>(responseId: string, params: [...P]) {
  return {
    with<R>(response: R): ForgedResponse<P, R> {
      const [promise, resolve] = createDeferredPromise<R>();
      return {id: responseId, _promiseId: Symbol(responseId), response, promise, resolve: () => resolve(response), params};
    },
  };
}
