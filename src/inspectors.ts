import {Inspector, MatcherOptions} from './types';

export function exists(testID: string): Inspector<boolean> {
  return ({node}) => !!node.queryAllByTestId(testID).length;
}

export function textOf(testID: string, options?: MatcherOptions): Inspector<string> {
  return ({locateAll}) => locateAll(testID, options).textContent ?? '';
}

export function textOfAll(testID: string): Inspector<string[]> {
  return ({node}) => node.queryAllByTestId(testID).map((node) => node.textContent ?? '');
}

export function countOf(testID: string): Inspector<number> {
  return ({node}) => node.queryAllByTestId(testID).length;
}

export function isDisabled(testID: string): Inspector<boolean> {
  return ({locateAll}) => !(locateAll(testID).getAttribute('disabled') === null);
}
