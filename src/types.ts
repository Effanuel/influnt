import {Matcher, RenderResult} from '@testing-library/react';
// using interfaces for performance reasons

export interface ForgedResponse<P extends unknown[] = unknown[], R = unknown> {
  readonly _promiseId: symbol;
  id: string;
  response: R;
  params: P;
  promise: Promise<R>;
  resolve: () => void;
}

interface CommonSettings {
  spyModules?: SpyModule[];
  mocks?: Record<string, ForgedResponse> | ForgedResponse | ForgedResponse[];
}

export interface InfluntSettings<E> extends CommonSettings {
  providerHoc?: (
    extraArgs: E extends void ? void : E,
  ) => <C>(args: React.ComponentType<InferProps<C>>) => React.ComponentType<InferProps<C>>;
  networkProxy?: NetworkProxy;
}

export interface ComponentSettings<P, E> extends CommonSettings {
  passProps?: P;
  extraArgs?: E extends void ? void : E;
}

export interface SuiteSettings<P, E> extends CommonSettings {
  passProps?: P;
  extraArgs?: E extends void ? void : E;
}

export interface Inspector<T, C = unknown> {
  (context: Context<C>): T;
}

export interface Context<E> {
  node: RenderResult;
  locateAll: (testID: Matcher, options?: {index?: number}) => HTMLElement;
  extraArgs: E;
}

export interface Step<E> {
  (context: Context<E>): void | Promise<unknown>;
}

export interface ReservedSnapshot {
  network: Record<string, any>;
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

export interface ComponentInfo<C extends React.ComponentType<InferProps<C>>> {
  component: React.ComponentType<InferProps<C>>;
  hocProps: InferProps<C>;
}

export interface Tracker {
  (targetKey: string | symbol, mocks: ForgedResponse[], logger: Logger, ...args: unknown[]): any;
}

export interface Logger {
  (id: string, value: unknown): void;
}

export interface NetworkProxy {
  setNetworkTarget: (networkTarget: Constructor) => Constructor<Record<string, unknown>>;
  setMocks: (mocks: ForgedResponse[]) => void;
  setTracker: (tracker: Tracker) => void;
  setLogger: (logger: Logger) => void;
}
