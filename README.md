# influnt

#### Flow based component integration testing library wrapped around @testing-library/react


[![CI](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml)


### Install:
```sh
npm install --save-dev influnt
```

### Counter Example:
```tsx
// CounterComponent.tsx
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

// in a general test env setup file
const createRenderer = configureInflunt({});

// CounterComponent.spec.ts

describe('CounterComponent', () => {
  const render = createRenderer(CounterComponent, {}); // Create test case specific renderer
  
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

### Passing props Example:
```tsx

// MyComponent.tsx
interface Props {
  title: string;
  showButton: boolean;
}

function MyComponent({title, showButton}: Props) {
  return (
    <div>
      <span data-testid="Title1">{title}</span>
      {showButton && <button data-testid="Button1">ButtonText</button>}
    </div>
  );
}

// in a general test env setup file
const createRenderer = configureInflunt();

// MyComponent.spec.ts
const defaultProps = {title: 'DefaultTitle', showButton: false};

describe('MyComponent', () => {
  const render = createRenderer(MyComponent, {passProps: defaultProps});

  it('should display title', async () => {
    const result = await render()
      .inspect({title: textOf('Title1')});
      
    expect(result).toEqual({title: 'DefaultTitle'});
  });

  it('should display title2', async () => {
    const result = await render({passProps: {title: 'SuiteTitle'}})
      .inspect({title: textOf('Title1')});
      
    expect(result).toEqual({title: 'SuiteTitle'});
  });

  it('should display a button and title', async () => {
    const result = await render({passProps: {showButton: true}})
      .inspect({buttonExists: exists('Button1'), title: textOf('Title1')});
      
    expect(result).toEqual({buttonExists: true, title: 'DefaultTitle'});
  });
});

```
