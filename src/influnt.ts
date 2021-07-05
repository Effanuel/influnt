import {act, fireEvent, Matcher, render} from '@testing-library/react';
import React from 'react';
import {Context, ComponentSettings, Inspector, Step, Snapshot, SpyModule, ForgedResponse, NetworkProxy} from './types';
import {isObject, toArray} from './util';

export class InfluntEngine<E, C extends React.ComponentType<InferProps<C>>> {
  private steps: Step<E>[] = [];
  private snapshot: Snapshot = {network: []};
  private component: React.ComponentType<InferProps<C>>;
  private settings: ComponentSettings<InferProps<C>, E>;
  private spyModulesInterop: ReturnType<SpyModule>[] = [];
  private mocks: ForgedResponse[];
  private extraArgs: E;
  private networkProxy?: NetworkProxy;

  constructor(
    component: React.ComponentType<InferProps<C>>,
    settings: ComponentSettings<InferProps<C>, E>,
    extraArgs: E,
    networkProxy?: NetworkProxy,
  ) {
    this.component = component;
    this.settings = settings;
    this.spyModulesInterop = (settings.spyModules ?? []).map((module) => module());
    this.extraArgs = extraArgs;
    this.mocks = toArray(settings.mocks);
    this.networkProxy = networkProxy;
  }

  private registerStep(step: Step<E>): this {
    this.steps.push(step);
    return this;
  }

  private getContext = (): Context<E> => {
    const node = render(React.createElement(this.component, this.settings.passProps));
    const locateAll = (testID: Matcher, options?: {index?: number}) => {
      const index = options?.index ?? 0;
      const found = node.queryAllByTestId(testID);
      if (found.length > 1 && options?.index === undefined) throw new Error(`Multiple elements for testID={${testID}} were found.`);
      if (index > found.length) throw new Error(`Matching index out of range.`);
      if (!found.length) throw new Error(`Element with testID={${testID}} was not found.`);
      return found[index];
    };
    return {node, locateAll, extraArgs: this.extraArgs};
  };

  private parseSpyModuleInterop() {
    const interopLog: {[key: string]: any} = {};
    this.spyModulesInterop.forEach((module) => {
      const key = Object.keys(module)[0];
      interopLog[key] = [...(interopLog[key] ?? []), module[key]].filter(Boolean);
    });
    return interopLog;
  }

  private result() {
    return {...this.snapshot, ...this.parseSpyModuleInterop()};
  }

  press(testID: string): this {
    return this.registerStep(({locateAll}) => {
      const found = locateAll(testID);
      if (!(found?.getAttribute('disabled') === null)) throw new Error('Can`t press on disabled button.');
      found.click();
    });
  }

  inputText(testID: string, value: string | number): this {
    return this.registerStep(({locateAll}) => {
      const found = locateAll(testID);
      fireEvent.change(found, {target: {value: String(value)}});
    });
  }

  inspect(inspection: Record<string, Inspector<unknown, E>>): this {
    return this.registerStep((context) => {
      for (const [key, assert] of Object.entries(inspection)) {
        if (Object.keys(this.snapshot).includes(key)) throw new Error(`Inspection key ${key} is already in use`);
        this.snapshot[key as keyof Snapshot] = assert(context);
      }
    });
  }

  resolve(forgedPromise: ForgedResponse) {
    return this.registerStep(async () => {
      await act(async () => void forgedPromise.resolve());
    });
  }

  private clearEmptySnaps(): void {
    Object.entries(this.snapshot).forEach(([snap, value]) => {
      const isObjectAndEmpty = isObject(value) && Object.keys(value).length === 0;
      if (isObjectAndEmpty) delete this.snapshot[snap];
    });
  }

  async then(resolve: (value: Snapshot) => Promise<never>, reject: (value: unknown) => Promise<never>) {
    const context = this.getContext();
    this.networkProxy?.setLogger((id, value) => void this.snapshot.network.push({[id]: value}));

    try {
      for (const step of this.steps) {
        await step(context);
      }

      this.clearEmptySnaps();
      return resolve(this.result());
    } catch (e) {
      return reject(e);
    }
  }
}
