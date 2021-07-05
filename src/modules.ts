import {SpyModule, SpyModuleConfig} from './types';

export function spyModule(id: string, {module, parseArgs}: SpyModuleConfig): SpyModule {
  return () => {
    const accumulator: ReturnType<SpyModule> = {[id]: []};
    (module as jest.SpyInstance<void, any[]>).mockImplementation((...args: unknown[]) => {
      accumulator[id].push({args: parseArgs(args)});
    });
    return accumulator;
  };
}
