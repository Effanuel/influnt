import {ForgedResponse, Logger, NetworkProxy, Tracker} from './types';

export function createNetworkProxy(): NetworkProxy {
  let mocks: ForgedResponse[] = [];
  let logger: Logger = (id, value) => {};
  let tracker: Tracker = (targetKey, mocks, logger, ...args) => {
    console.warn('Tracker is not initialized. Call .setTracker');
    return () => {};
  };
  return {
    setNetworkTarget: (networkTarget, trackerArg) =>
      new Proxy(networkTarget, {
        construct(target, args) {
          const obj = new target(...args);
          return new Proxy(obj, {
            get(target, key) {
              return (...args: unknown[]) => {
                const trackerFactory = trackerArg ?? tracker;
                return trackerFactory(key, mocks, logger, ...args);
              };
            },
          });
        },
      }),
    setMocks: (_mocks) => void (mocks = _mocks),
    setTracker: (_tracker) => void (tracker = _tracker),
    setLogger: (_logger) => void (logger = _logger),
  };
}
