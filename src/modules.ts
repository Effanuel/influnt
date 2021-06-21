import {SpyModule, SpyModuleConfig} from 'types';

export function spyModule(id: string, {module, parseArgs}: SpyModuleConfig): SpyModule {
  return () => {
    const accumulator: ReturnType<SpyModule> = {[id]: undefined};
    (module as jest.SpyInstance<void, any[]>).mockImplementation(
      (...args) => void Object.assign(accumulator, {[id]: parseArgs(args)}),
    );
    return accumulator;
  };
}

// export const toastSpy = spyModule('toast', {
//   module: toast,
//   parseArgs: (value) => value[0].props,
// });
