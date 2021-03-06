// Using interfaces for performance reasons
// import {Matcher, RenderResult} from '@testing-library/react-native';

import type {ReactTestRendererJSON} from 'react-test-renderer';

export type ExtraArgs<E> = E extends void ? void : E;

export interface ForgedResponse<P extends unknown[] = unknown[], R = unknown> {
  readonly _signature: symbol;
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
  providerHoc?: (...extraArgs: ExtraArgs<E>[]) => <C>(args: React.ComponentType<InferProps<C>>) => React.ComponentType<InferProps<C>>;
  networkProxy?: NetworkProxy;
}

export interface ComponentSettings<P, E> extends CommonSettings {
  passProps?: P;
  extraArgs?: () => ExtraArgs<E>;
}

export interface SuiteSettings<P, E> extends CommonSettings {
  passProps?: Partial<P>;
  extraArgs?: ExtraArgs<E>;
}

export interface Inspector<T, C = unknown> {
  (context: Context<C>): T;
}

export interface Context<E> {
  node: any;
  locateAll: (testID: string, options?: {index: number}) => ReactTestRendererJSON[];
  locate: (testID: string, options?: {index: number}) => ReactTestRendererJSON;
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

export type SpyModuleConfig = {module: any; parseArgs: (value: any[]) => any} | {factory: (logger: (...args: any[]) => void) => void};

export interface HocFacadeConfig<P extends Record<string, unknown>> {
  providers: (React.ComponentType<any> | [React.ComponentType<any>, {props: P}])[];
}

export interface Tracker {
  (targetKey: string | symbol, mocks: ForgedResponse[], logger: Logger, ...args: unknown[]): any;
}

export interface Logger {
  (id: string, value: unknown): void;
}

export interface NetworkProxy {
  setNetworkTarget: (networkTarget: Constructor, tracker?: Tracker) => Constructor<Record<string, unknown>>;
  setMocks: (mocks: ForgedResponse[]) => void;
  setTracker: (tracker: Tracker) => void;
  setLogger: (logger: Logger) => void;
}

export interface MatcherOptions {
  index: number;
}
