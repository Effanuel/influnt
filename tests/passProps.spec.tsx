import React from 'react';
import {configureInflunt} from '../src/main';
import {exists, textOf} from '../src/inspectors';

interface Props {
  title: string;
  showButton: boolean;
}

function TestComponent({title, showButton}: Props) {
  return (
    <div>
      <span data-testid="Title1">{title}</span>
      {showButton && <button data-testid="Button1">ButtonText</button>}
    </div>
  );
}

const defaultProps = {title: 'DefaultTitle', showButton: false};

const createRenderer = configureInflunt();
const render = createRenderer(TestComponent, {passProps: defaultProps});

describe('passProps', () => {
  it('should set props in renderer scope', async () => {
    const result = await render().inspect({title: textOf('Title1')});
    expect(result).toEqual({title: 'DefaultTitle'});
  });

  it('should override props in suite scope', async () => {
    const result = await render({passProps: {title: 'SuiteTitle'}}).inspect({title: textOf('Title1')});
    expect(result).toEqual({title: 'SuiteTitle'});
  });

  it('should override only a single prop', async () => {
    const result = await render({passProps: {showButton: true}}).inspect({buttonExists: exists('Button1'), title: textOf('Title1')});
    expect(result).toEqual({buttonExists: true, title: 'DefaultTitle'});
  });
});
