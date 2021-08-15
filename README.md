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

All usage examples can be seen [here](https://github.com/Effanuel/influnt/wiki/Examples)

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

### Spying on a module

```ts

// TestComponent.tsx
import React from 'react';
import {showToast} from '<path>'; // function that is responsible for showing a toast

export default function TestComponent() {
  const showSuccessToast = () => showToast('Success!');
  const showErrorToast = () => showToast('Error!');

  return (
    <div>
      <button data-testid="Success" onClick={showSuccessToast}>
        Show success toast
      </button>
      <button data-testid="Error" onClick={showErrorToast}>
        Show error toast
      </button>
    </div>
  );
}

// jest setup file
jest.mock('<path-to-file-that-exports-showToast-function>', () => {
  const actual = jest.requireActual('<path-to-file-that-exports-showToast-function>');
  Object.assign(actual, {showToast: jest.fn()});
  return actual;
});

// influnt.ts file
import {configureInflunt, spyModule} from 'influnt';

const toastSpy = spyModule('toast', {
  module: showToast,
  parseArgs: (value) => ({message: value[0]}), // extract only the information that is relevant to us for logging
});

export const createRenderer = configureInflunt({
  spyModules: [toastSpy], // Register toastSpy for all tests
});


// TestComponent.spec.ts
import {createRenderer} from './influnt.ts';
import TestComponent from './TestComponent.tsx';

const render = createRenderer(TestComponent);

describe('spyModules', () => {
  it('should show success toast', async () => {
    const result = await render().press('Success');
    expect(result).toEqual({toast: [{message: 'Success!'}]});
  });

  it('should show success and error toasts', async () => {
    const result = await render().press('Success').press('Error');
    expect(result).toEqual({toast: [{message: 'Success!'}, {message: 'Error!'}]});
  });
});

```
