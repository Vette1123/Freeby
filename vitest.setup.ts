import "@testing-library/jest-dom/vitest";

// matchMedia — used by next-themes; jsdom doesn't ship it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// scrollTo / scrollY — jsdom stubs.
window.scrollTo = () => {};
Object.defineProperty(window, "scrollY", { writable: true, value: 0 });

// ResizeObserver — some libs expect it; jsdom doesn't ship it.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
