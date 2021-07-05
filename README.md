# influnt

#### Flow based component integration testing library wrapped around @testing-library/react


[![CI](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml)


### Install:
```sh
npm install --save-dev influnt
```

### Examples:
```tsx
// Counter.tsx
function CounterComponent() {
  const [counter, setCounter] = React.useState<number>(0);

  const increment = React.useCallback(() => setCounter(counter + 1), [counter]);
  const decrement = React.useCallback(() => setCounter(counter - 1), [counter]);

  return (
    <div>
      <span data-testid="Counter-test-id">{counter}</span>
      <button data-testid="Increment-test-id" onClick={increment}>
        Increment
      </button>
      <button data-testid="Decrement-test-id" onClick={decrement}>
        Decrement
      </button>
    </div>
  );
}

//Counter.spec.ts
//This variable should be shared between different tests and not be local
const createRenderer = configureInflunt({});
const render = createRenderer(CounterComponent, {}); // Create test case specific renderer

describe('Counter', () => {
  it('should increment a counter', async () => {
    const result = await render()
      .inspect({counterBefore: textOf('Counter-test-id')})
      .press('Increment-test-id')
      .inspect({counterAfter: textOf('Counter-test-id')});

    expect(result).toEqual({counterBefore: '0', counterAfter: '1'});
  });

  it('should decrement a counter', async () => {
    const result = await render()
      .inspect({counterBefore: textOf('Counter-test-id')})
      .press('Decrement-test-id')
      .inspect({counterAfter: textOf('Counter-test-id')});

    expect(result).toEqual({counterBefore: '0', counterAfter: '-1'});
  });
});

```
