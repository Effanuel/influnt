import {Matcher, RenderResult} from '@testing-library/react';
// using interfaces for performance reasons

interface CommonSettings {
  spyModules?: SpyModule[];
}

export interface InfluntSettings<T> extends CommonSettings {
  providerHoc?: (extraArgs: T) => any
}

export interface ComponentSettings<P> extends CommonSettings {
  passProps?: P;
}

export interface Inspector<T> {
  (context: Context): T;
}

export interface Context {
  node: RenderResult;
  locateAll: (testID: Matcher, options?: {index?: number}) => HTMLElement;
}

export interface Step {
  (context: Context): void | Promise<unknown>;
}

export interface ReservedSnapshot {
  api: Record<string, any>;
}

export interface Snapshot extends ReservedSnapshot {
  [key: string]: unknown;
}

export interface SpyModule extends Brand {
  (): {[key: string]: any};
}

export interface SpyModuleConfig {
  module: any;
  parseArgs: (value: any[]) => any;
}
