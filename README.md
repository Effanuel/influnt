# influnt

#### Flow based component integration testing library wrapped around @testing-library/react


[![CI](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Effanuel/influnt/actions/workflows/node.js.yml)


### Install
```sh
npm install --save-dev influnt
```


### Misc
* Nodes are found using [`node.queryAllByTestId(testID)`](https://testing-library.com/docs/queries/about#types-of-queries)

## Actions

* `press(testID: string)`
   * Triggers `node.click()` event on a found node;
* `inputText(testID: string, value: string | number)`
   * Triggers [`fireEvent.change(found, {target: {value: String(value)}})`](https://github.com/testing-library/dom-testing-library/blob/main/src/event-map.js#L59) event on a found node;
* `selectOption(testID: string, value: string | number)`
   * Triggers [`fireEvent.change(found, {target: {value: String(value)}})`](https://github.com/testing-library/dom-testing-library/blob/main/src/event-map.js#L59) event on a found node;
* `toggle(testID: string, value: string)`
   * Triggers `fireEvent.click(radioNode)` on a radio node that is found by text content *(`value` argument)*;
* `inspect(inspection: Record<string, Inspector<unknown, ExtraArgument>>)`
   *  Used for inspecting and later asserting a certain component state using inspectors *(see Inspectors section)*;

## Inspectors

* `exists(testID: string): Inspector<boolean>`
   * Returns a boolean if a node was matched by that testID;
* `textOf(testID: string): Inspector<string>`
   * Returns a string using `node.textContent` value;
* `textOfAll(testID: string): Inspector<string[]>`
   * Returns an array of text found by `node.textContent`;
* `countOf(testID: string): Inspector<number>`
   * Returns the length of number of nodes found by testID;
* `isDisabled(testID: string): Inspector<boolean>`
   * Return false, if a node doesn't have a `disabled` attribute.

You can also create your own inspector, just `import type {Inspector} from 'influnt'`. Examples can be seen [here](https://github.com/Effanuel/influnt/blob/master/src/inspectors.ts)

### Increment/Decrement Counter Example:
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
