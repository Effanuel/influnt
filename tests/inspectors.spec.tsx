import React from 'react';
import {configureInflunt} from '../src/main';
import {countOf, exists, isDisabled, textOf} from '../src/inspectors';

function TestComponent() {
  return (
    <div>
      <span data-testid="Title1">Title 1 Text</span>
      <span data-testid="Title2">
        <span>Hello</span>
        <span>World</span>
      </span>
      <span data-testid="Title3">
        <span>
          1<span>3</span>
          <span>4</span>
        </span>
        <span>
          2<span>5</span>
          <span>6</span>
        </span>
      </span>
      <footer data-testid="Footer">Footer text</footer>
      {true && <div data-testid="Visible">Visible</div>}
      {false && <div data-testid="Hidden">Hidden</div>}
      {[...Array(13).keys()].map((item) => (
        <div key={item} data-testid="Item1">
          {item}
        </div>
      ))}
      <div data-testid="Item2">ITEM2</div>
      <div data-testid="Item2">ITEM2</div>
      <button data-testid="Button1">Button1</button>
      <button disabled data-testid="Button2">
        Button1
      </button>
    </div>
  );
}

describe('Inspectors', () => {
  const createRenderer = configureInflunt();
  const render = createRenderer(TestComponent);

  it('textOf', async () => {
    const result = await render().inspect({title1: textOf('Title1'), title2: textOf('Title2'), title3: textOf('Title3')});
    expect(result).toEqual({title1: 'Title 1 Text', title2: 'HelloWorld', title3: '134256'});
  });

  it('exists', async () => {
    const result = await render().inspect({elementExists1: exists('Visible'), elementExists2: exists('Hidden')});
    expect(result).toEqual({elementExists1: true, elementExists2: false});
  });

  it('countOf', async () => {
    const result = await render().inspect({elementCount1: countOf('Item1'), elementCount2: countOf('Item2')});
    expect(result).toEqual({elementCount1: 13, elementCount2: 2});
  });

  it('isDisabled', async () => {
    const result = await render().inspect({isButtonDisabled1: isDisabled('Button1'), isButtonDisabled2: isDisabled('Button2')});
    expect(result).toEqual({isButtonDisabled1: false, isButtonDisabled2: true});
  });
});
