import {SpyModule, SpyModuleConfig} from './types';

export function spyModule(id: string, {module, parseArgs, actual}: SpyModuleConfig): SpyModule {
  return () => {
    const accumulator: ReturnType<SpyModule> = {[id]: []};
    (module as jest.SpyInstance<void, any[]>).mockImplementation((...args: unknown[]) => {
      accumulator[id].push(parseArgs(args));
      if (actual) return actual(...args);
    });
    return accumulator;
  };
}
