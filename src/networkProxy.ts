import {ForgedResponse, NetworkProxy, Tracker} from './types';

export function createNetworkProxy(): NetworkProxy {
  let mocks: ForgedResponse[] = [];
  let logger: (mock: ForgedResponse) => void = (mock) => {};
  let tracker: Tracker = (targetKey, mocks, ...args) => {
    console.warn('Tracker is not setup');
    return () => {};
  };
  return {
    setNetworkTarget: (networkTarget) =>
      new Proxy(networkTarget, {
        construct(target, args) {
          const obj = new target(...args);
          return new Proxy(obj, {
            get(target, key) {
              return (...args: unknown[]) => tracker(key, mocks, logger, ...args);
            },
          });
        },
      }),
    setMocks: (_mocks): void => void (mocks = _mocks),
    setTracker: (_tracker): void => void (tracker = _tracker),
    setLogger: (_logger) => void (logger = _logger),
  };
}
