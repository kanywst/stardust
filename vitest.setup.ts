import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './src/test/mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Reports every observed element as immediately intersecting so that
// viewport-gated logic (e.g. `useInView`) activates synchronously in jsdom,
// where there is no real layout/scrolling.
const IntersectionObserverMock = function (
  this: IntersectionObserver,
  callback: IntersectionObserverCallback
) {
  return {
    observe: (element: Element) => {
      callback(
        [{ isIntersecting: true, target: element, intersectionRatio: 1 } as IntersectionObserverEntry],
        this
      );
    },
    unobserve: () => null,
    disconnect: () => null,
    takeRecords: () => [],
  };
} as unknown as typeof IntersectionObserver;

window.IntersectionObserver = IntersectionObserverMock;
