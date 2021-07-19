import {fireEvent} from '@testing-library/react';
import {Step} from './types';

export const press =
  <E>(testID: string): Step<E> =>
  ({locateAll}) => {
    const found = locateAll(testID);
    if (!(found?.getAttribute('disabled') === null)) throw new Error('Can`t press on disabled button.');
    found.click();
  };

export const inputText =
  <E>(testID: string, value: string | number): Step<E> =>
  ({locateAll}) => {
    const found = locateAll(testID);
    fireEvent.change(found, {target: {value: String(value)}});
  };

export const toggle =
  <E>(testID: string, value: string): Step<E> =>
  ({locateAll}) => {
    const found = locateAll(testID);
    const radioNode = [...found.childNodes].find(({textContent}) => textContent === value);

    if (!radioNode) {
      console.error(`Radio with value ${value} cannot be found.`);
    } else {
      fireEvent.click(radioNode);
    }
  };
