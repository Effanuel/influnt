import React from 'react';
import {textOf} from '../src/inspectors';
import {configureInflunt} from '../src/main';

function TestComponent() {
  const [counter, setCounter] = React.useState<number>(0);

  const increment = React.useCallback(() => setCounter(counter + 1), [counter]);
  const decrement = React.useCallback(() => setCounter(counter - 1), [counter]);

  return (
    <div>
      <span data-testid="Counter">{counter}</span>
      <button data-testid="Increment" onClick={increment}>
        Increment
      </button>
      <button data-testid="Decrement" onClick={decrement}>
        Decrement
      </button>
    </div>
  );
}

describe('actions', () => {
  const createRenderer = configureInflunt({});
  const render = createRenderer(TestComponent, {});

  it('should increment a counter', async () => {
    const result = await render()
      .inspect({counter1: textOf('Counter')})
      .press('Increment')
      .inspect({counter2: textOf('Counter')})
      .press('Increment')
      .press('Increment')
      .inspect({counter3: textOf('Counter')});

    expect(result).toEqual({counter1: '0', counter2: '1', counter3: '3'});
  });

  it('should decrement a counter', async () => {
    const result = await render()
      .inspect({counter1: textOf('Counter')})
      .press('Decrement')
      .inspect({counter2: textOf('Counter')})
      .press('Decrement')
      .press('Decrement')
      .inspect({counter3: textOf('Counter')});

    expect(result).toEqual({counter1: '0', counter2: '-1', counter3: '-3'});
  });

  it('should change counter', async () => {
    const result = await render()
      .inspect({counter1: textOf('Counter')})
      .press('Decrement')
      .inspect({counter2: textOf('Counter')})
      .press('Decrement')
      .press('Increment')
      .inspect({counter3: textOf('Counter')})
      .press('Increment');

    expect(result).toEqual({counter1: '0', counter2: '-1', counter3: '-1'});
  });
});
