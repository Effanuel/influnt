import type {ReactTestRendererJSON} from 'react-test-renderer';
import {Inspector, MatcherOptions} from './types';

function readText(node: ReactTestRendererJSON | null): string | null {
  if (node === null) {
    return null;
  }
  switch (node.type) {
    case 'Text':
      return node.children?.map((it) => (typeof it === 'string' ? it : '')).join('') || null;
    case 'Picker':
    case 'TextInput':
      return node.props.value;
    default:
      return null;
  }
}

export function exists(testID: string): Inspector<boolean> {
  return ({locateAll}) => {
    const nodes = locateAll(testID);
    if (nodes.length > 1) {
      throw new Error(`Found ${nodes.length} matches for '${testID}'`);
    }
    return nodes.length === 1;
  };
}

export function textOf(testID: string, options?: MatcherOptions): Inspector<string> {
  return ({locateAll, locate}) => {
    const node = locate(testID);
    return readText(node) ?? '';
  };
}

export function textOfAll(testID: string): Inspector<string[]> {
  return ({node}) => node.queryAllByTestId(testID).map((node: any) => node.textContent ?? '');
}

export function countOf(testID: string): Inspector<number> {
  return ({node}) => node.queryAllByTestId(testID).length;
}
