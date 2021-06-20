import {Matcher, RenderResult} from '@testing-library/react';
// using interfaces for performance reasons

export interface InfluntSettings {
  providerHoc?: any;
  spyModules?: any;
}

export interface Inspector<T> {
  (context: Context): T;
}

export interface Config<P> {
  passProps?: P;
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
