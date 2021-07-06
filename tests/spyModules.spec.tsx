import React from 'react';
import {configureInflunt} from '../src/main';
import {spyModule} from '../src/modules';
import {showToast} from './mocks/toast';

const toastSpy = spyModule('toast', {
  module: showToast,
  parseArgs: (value) => ({message: value[0]}),
});

jest.mock('./mocks/toast', () => {
  const actual = jest.requireActual('./mocks/toast');
  Object.assign(actual, {showToast: jest.fn()});
  return actual;
});

function TestComponent() {
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

const createRenderer = configureInflunt({
  spyModules: [toastSpy],
});

const render = createRenderer(TestComponent);

describe('spyModules', () => {
  it('should not log toast if its spied on but not triggered', async () => {
    const result = await render();
    expect(result).toEqual({});
  });

  it('should log toast', async () => {
    const result = await render().press('Success');
    expect(result).toEqual({toast: [{message: 'Success!'}]});
  });

  it('should log 2 toasts', async () => {
    const result = await render().press('Success').press('Error');
    expect(result).toEqual({toast: [{message: 'Success!'}, {message: 'Error!'}]});
  });
});
