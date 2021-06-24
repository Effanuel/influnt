import {Matcher, RenderResult} from '@testing-library/react';
// using interfaces for performance reasons

interface CommonSettings {
  spyModules?: SpyModule[];
}

export interface InfluntSettings<T> extends CommonSettings {
  providerHoc?: (
    extraArgs: T extends unknown ? void : T,
  ) => <C>(args: React.ComponentType<Readonly<InferProps<C>>>) => C;
}

export interface ComponentSettings<P> extends CommonSettings {
  passProps?: P;
}

export interface Inspector<T, C = void> {
  (context: Context<C>): T;
}

export interface Context<T> {
  node: RenderResult;
  locateAll: (testID: Matcher, options?: {index?: number}) => HTMLElement;
  extraArgs: T;
}

export interface Step<C> {
  (context: Context<C>): void | Promise<unknown>;
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

export interface HocFacadeConfig<P extends Record<string, unknown>> {
  providers: (React.ComponentType<any> | [React.ComponentType<any>, {props: P}])[];
}
