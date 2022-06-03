// import {fireEvent} from '@testing-library/react-native';
import {Step, MatcherOptions} from './types';

export const press =
  <E>(testID: string, options?: MatcherOptions): Step<E> =>
  ({locateAll}) => {
    const found = locateAll(testID, options);
    if (found[options?.index ?? 0].props.disabled) throw new Error('Can`t press on disabled button.');
    found[options?.index ?? 0].props.onPress();
  };

export const inputText =
  <E>(testID: string, value: string | number): Step<E> =>
  ({locate}) => {
    const found = locate(testID);
    found.props.onChangeText(String(value));
  };
