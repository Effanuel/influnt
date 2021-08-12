import {SpyModule, SpyModuleConfig} from './types';

export function spyModule(id: string, config: SpyModuleConfig): SpyModule {
  return () => {
    const accumulator: ReturnType<SpyModule> = {[id]: []};
    if ('module' in config) {
      const {module, parseArgs} = config;
      (module as jest.SpyInstance<void, any[]>).mockImplementation((...args: unknown[]) => {
        accumulator[id].push(parseArgs(args));
      });
    }
    if ('factory' in config) {
      config.factory((...args) => accumulator[id].push(args));
    }
    return accumulator;
  };
}
