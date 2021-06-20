import {fireEvent, Matcher, render, RenderResult} from '@testing-library/react';
import React from 'react';
import {Context, Config, Inspector, Step, Snapshot} from './types';
import Queue from './Queue';

type ForgedPromise = any;

export class InfluntEngine<P> {
  private promiseQueue: Queue;
  private steps: Step[] = [];
  private snapshot: Snapshot = {api: {}};
  private component: React.ComponentType<P>;
  private parameters: Config<P>;

  constructor(component: React.ComponentType<P>, parameters: Config<P>) {
    this.promiseQueue = new Queue();
    this.component = component;
    this.parameters = parameters;
  }

  private registerStep(step: Step): this {
    this.steps.push(step);
    return this;
  }

  private getContext = (): Context => {
    const node = render(React.createElement(this.component, this.parameters.passProps));
    const locateAll = (testID: Matcher, options?: {index?: number}) => {
      const index = options?.index ?? 0;
      const found = node.queryAllByTestId(testID);
      if (found.length > 1 && options?.index === undefined)
        throw new Error(`Multiple elements for testID={${testID}} were found.`);
      if (index > found.length) throw new Error(`Matching index out of range.`);
      if (!found.length) throw new Error(`Element with testID={${testID}} was not found.`);
      return found[index];
    };
    return {node, locateAll};
  };

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

  inspect(inspection: Record<string, Inspector<unknown>>): this {
    return this.registerStep((context) => {
      for (const [key, assert] of Object.entries(inspection)) {
        if (Object.keys(this.snapshot).includes(key)) throw new Error(`Inspection key ${key} is already in use`);
        this.snapshot[key as keyof Snapshot] = assert(context);
      }
    });
  }

  // resolve<T>(forgedPromises: Record<string, ForgedPromise>) {
  //   this.promiseQueue.enqueue(promisify(forgedPromises));
  //   Object.assign(this.snapshot['api'], forgedPromises);

  //   return this.registerStep(async () => {
  //     await act(async () => Object.keys(forgedPromises).forEach((k) => this.promiseQueue.dequeue(k)));
  //   });
  // }

  private clearEmptySnaps() {
    Object.entries(this.snapshot).forEach(([snap, value]) => {
      const isObjectEmpty = typeof value === 'object' && value !== null && Object.keys(value).length === 0;
      if (isObjectEmpty) delete this.snapshot[snap];
    });
  }

  private async then(resolve: (value: Snapshot) => Promise<never>, reject: (value: unknown) => Promise<never>) {
    const context = this.getContext();
    try {
      for (const step of this.steps) {
        await step(context);
      }

      this.clearEmptySnaps();
      return resolve(this.snapshot);
    } catch (e) {
      return reject(e);
    }
  }
}
