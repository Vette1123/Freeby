import "@testing-library/jest-dom/vitest";

/**
 * A controllable IntersectionObserver mock. The last created instance is
 * exposed on globalThis as `__lastIntersectionObserver` so tests can drive
 * section visibility via `setVisible(ids)` / `setNoneVisible()`.
 */
interface ObserverEntry {
  target: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: DOMRectReadOnly;
  intersectionRect: DOMRectReadOnly;
  rootBounds: DOMRectReadOnly | null;
  time: number;
}

interface TestObserver {
  setVisible: (ids: string[]) => void;
  setNoneVisible: () => void;
}

class MockIntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private callback: IntersectionObserverCallback;
  private entries = new Map<Element, ObserverEntry>();

  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    // Register on the global so tests can reach this instance.
    (globalThis as unknown as { __lastIntersectionObserver?: TestObserver }).__lastIntersectionObserver =
      {
        setVisible: (ids: string[]) => {
          // Mark only the named targets intersecting; fire callback.
          const idSet = new Set(ids);
          const fired: IntersectionObserverEntry[] = [];
          for (const [target, entry] of this.entries) {
            const id = target.getAttribute("data-obs-id") ?? target.id;
            const want = idSet.has(id);
            if (entry.isIntersecting !== want) {
              entry.isIntersecting = want;
              fired.push({ ...entry, target });
            }
          }
          if (fired.length) this.callback(fired, this as unknown as IntersectionObserver);
        },
        setNoneVisible: () => {
          const fired: IntersectionObserverEntry[] = [];
          for (const [target, entry] of this.entries) {
            if (entry.isIntersecting) {
              entry.isIntersecting = false;
              fired.push({ ...entry, target });
            }
          }
          if (fired.length) this.callback([], this as unknown as IntersectionObserver);
        },
      };
  }
  observe(target: Element) {
    this.entries.set(target, {
      target,
      isIntersecting: false,
      intersectionRatio: 0,
      boundingClientRect: { top: 0 } as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    });
  }
  unobserve(target: Element) {
    this.entries.delete(target);
  }
  disconnect() {
    this.entries.clear();
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [...this.entries.values()];
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

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

// ResizeObserver — not used by the nav but some libs expect it.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
