import '@testing-library/jest-dom';

// Mock IntersectionObserver for Framer Motion
const IntersectionObserverMock = function () {
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  };
} as unknown as typeof IntersectionObserver;

window.IntersectionObserver = IntersectionObserverMock;