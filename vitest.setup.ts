import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './src/test/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const IntersectionObserverMock = function () {
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
    takeRecords: () => [],
  };
} as unknown as typeof IntersectionObserver;

window.IntersectionObserver = IntersectionObserverMock;
