import React from 'react';
import {configureInflunt} from '../src/main';
import {respond} from '../src/util';
import {ApiService} from './mocks/mockApi';
import {networkProxy} from './mocks/proxy';

const api = new ApiService();

jest.mock('./mocks/mockApi', () => ({
  ApiService: require('./mocks/proxy').networkProxy.setNetworkTarget(jest.requireActual('./mocks/mockApi').ApiService),
}));

function TestComponent() {
  const sendRequest = async () => await api.getTodos('Id1', 100);

  return (
    <div>
      <button data-testid="Submit" onClick={sendRequest}>
        Send Request
      </button>
    </div>
  );
}

const createRenderer = configureInflunt({networkProxy});

describe('network', () => {
  const render = createRenderer(TestComponent);

  it('should send a network request if submit is pressed', async () => {
    const mock = respond('getTodos', ['Id1', 100]).with({data: {todos: [{id: 1, text: 'SampleTodoText'}]}});

    const result = await render({mocks: [mock]})
      .press('Submit')
      .resolve(mock);

    expect(result).toEqual({
      network: [{getTodos: ['Id1', 100]}],
    });
  });
});
