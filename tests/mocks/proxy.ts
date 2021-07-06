import isEqual from 'lodash.isequal';
import {createNetworkProxy} from '../../src/networkProxy';

export const networkProxy = createNetworkProxy();

networkProxy.setTracker((key, mocks, logger, ...args2) => {
  if (!mocks.length) console.error('No mocks found');

  const matchedMock = mocks.find(({id, params}) => id === key && isEqual(params, args2));

  if (!matchedMock) {
    console.error(
      `No mock defined for request: ${String(key)}:`,
      ...args2,
      `\nDefined mocks: `,
      ...mocks.map((mock) => [mock.id, mock.params]),
    );
  }
  return matchedMock?.promise.then((value) => {
    logger(matchedMock.id, matchedMock.params);
    return value;
  });
});
