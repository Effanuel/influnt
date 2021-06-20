import {Inspector} from 'types';

export function exists(testID: string): Inspector<boolean> {
  return ({node}) => !!node.queryAllByTestId(testID).length;
}

export function textOf(testID: string): Inspector<string> {
  return ({locateAll}) => locateAll(testID).textContent ?? '';
}

export function countOf(testID: string): Inspector<number> {
  return ({node}) => node.queryAllByTestId(testID).length;
}

export function isDisabled(testID: string): Inspector<boolean> {
  return ({node}) => !(node.queryByTestId(testID)?.getAttribute('disabled') === null);
}
