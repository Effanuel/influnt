import {ForgedResponse, NetworkProxy, Tracker} from './types';

export function createNetworkProxy(): NetworkProxy {
  let mocks: ForgedResponse[] = [];
  let tracker: Tracker = (targetKey, mocks, ...args) => {
    console.warn('Tracker is not setup');
    return () => {};
  };
  return {
    setNetworkTarget: (networkTarget: Constructor) =>
      new Proxy(networkTarget, {
        construct(target, args) {
          const obj = new target(...args);
          return new Proxy(obj, {
            get(target, key) {
              return (...args: unknown[]) => tracker(key, mocks, ...args);
            },
          });
        },
      }),
    setMocks: (_mocks: ForgedResponse[]): void => void (mocks = _mocks),
    setTracker: (_tracker: Tracker): void => void (tracker = _tracker),
  };
}
