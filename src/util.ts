import {ForgedResponse} from './types';

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
      return {id: responseId, response, promise, resolve: () => resolve(response), params};
    },
  };
}
