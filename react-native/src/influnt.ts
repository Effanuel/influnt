import {act, fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {ReactTestRendererJSON} from 'react-test-renderer';
import {inputText, press} from './action-steps';
import {Context, ComponentSettings, Inspector, Step, Snapshot, SpyModule, ForgedResponse, NetworkProxy, MatcherOptions} from './types';
import {flushPromises, isObject, toArray} from './util';

export class InfluntEngine<E, C extends React.ComponentType<InferProps<C>>> {
  private steps: Step<E>[] = [];
  private snapshot: Snapshot = {network: []};
  private component: React.ComponentType<InferProps<C>>;
  private settings: ComponentSettings<InferProps<C>, E>;
  private spyModulesInterop: ReturnType<SpyModule>[] = [];
  private mocks: ForgedResponse[];
  private lazyMocks: ForgedResponse[];
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
    this.lazyMocks = toArray(settings.mocks);
    this.networkProxy = networkProxy;
  }

  private registerStep(step: Step<E>): this {
    this.steps.push(step);
    return this;
  }

  private getContext = (): Context<E> => {
    //@ts-ignore
    const node = render(React.createElement(this.component, this.settings.passProps));
    const locateAll = (testID: string, options?: {index?: number}) => {
      const index = options?.index ?? 0;
      const found = node.queryAllByTestId(testID);
      if (found.length > 1 && options?.index === undefined) throw new Error(`Multiple elements for testID={${testID}} were found.`);
      if (index > found.length) throw new Error(`Matching index out of range.`);
      if (!found.length) throw new Error(`Element with testID={${testID}} was not found.`);
      return found as ReactTestRendererJSON[];
    };

    const locate = (testID: string, options?: {index?: number}): ReactTestRendererJSON => {
      const index = options?.index ?? 0;
      const found = node.queryAllByTestId(testID);
      if (found.length > 1 && options?.index === undefined) throw new Error(`Multiple elements for testID={${testID}} were found.`);
      if (index > found.length) throw new Error(`Matching index out of range.`);
      if (!found.length) throw new Error(`Element with testID={${testID}} was not found.`);
      return found[options?.index ?? 0] as ReactTestRendererJSON;
    };
    return {node, locateAll, locate, extraArgs: this.extraArgs};
  };

  private parseSpyModuleInterop() {
    const interopLog: {[key: string]: any} = {};
    this.spyModulesInterop.forEach((module) => {
      const key = Object.keys(module)[0];
      const interop = [...(interopLog[key] ?? []), ...module[key]].filter(Boolean);
      if (interop.length) interopLog[key] = interop;
    });
    return interopLog;
  }

  private result() {
    return {...this.snapshot, ...this.parseSpyModuleInterop()};
  }

  execute(...steps: Step<E>[]) {
    steps.forEach((step) => {
      this.registerStep(async (context) => {
        await act(async () => void step(context));
      });
    });
    return this;
  }

  apply(operations: (engine: this) => void) {
    operations(this);
    return this;
  }

  press = (testID: string, options?: MatcherOptions) => this.registerStep(press(testID, options));

  click = (testID: string, options?: MatcherOptions) => this.registerStep(press(testID, options));

  //   toggle = (testID: string, value: string, options?: MatcherOptions) => this.registerStep(toggle(testID, value, options));

  inputText = (testID: string, value: string | number) => this.registerStep(inputText(testID, value));

  selectOption = (testID: string, value: string | number) => this.registerStep(inputText(testID, value));

  inspect(inspection: Record<string, Inspector<unknown, E>>): this {
    return this.registerStep((context) => {
      for (const [key, assert] of Object.entries(inspection)) {
        if (Object.keys(this.snapshot).includes(key)) throw new Error(`Inspection key ${key} is already in use`);
        this.snapshot[key as keyof Snapshot] = assert(context);
      }
    });
  }

  resolve(forgedPromise: ForgedResponse) {
    const eagerForgedSignatures = this.mocks.map((mock) => mock._signature);
    if (eagerForgedSignatures.includes(forgedPromise._signature)) {
      console.error(`Mock ${forgedPromise.id}`, forgedPromise.params, 'has already been registered as an eager mock ({mocks})');
    } else {
      this.mocks.push(forgedPromise);
    }
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
    this.networkProxy?.setLogger((id, value) => void this.snapshot.network.push({[id]: value}));
    this.networkProxy?.setMocks(this.mocks);
    this.lazyMocks.forEach((mock) => void mock.resolve());

    const context = this.getContext();

    await act(flushPromises);
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
