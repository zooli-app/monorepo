/**
 * Next.js Instrumentation Hook
 * Runs once when the server boots — before any page is rendered.
 *
 * WHY THIS EXISTS:
 * Node.js v22 introduced a built-in `localStorage` global that requires the
 * `--localstorage-file` CLI flag to work. Without a valid file path the object
 * exists but its methods (getItem, setItem, …) are stubs that throw
 * "localStorage.getItem is not a function".
 *
 * Several npm packages (recharts, etc.) call localStorage at module-init time,
 * which crashes Next.js SSR before any page is even rendered.
 *
 * This hook replaces the broken stub with a proper in-memory implementation
 * so those packages initialise safely on the server.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const needsPolyfill =
      typeof globalThis.localStorage === "undefined" ||
      typeof globalThis.localStorage?.getItem !== "function";

    if (needsPolyfill) {
      const store = new Map<string, string>();

      const localStoragePolyfill: Storage = {
        getItem: (key: string): string | null => store.get(key) ?? null,
        setItem: (key: string, value: string): void => {
          store.set(key, String(value));
        },
        removeItem: (key: string): void => {
          store.delete(key);
        },
        clear: (): void => {
          store.clear();
        },
        key: (index: number): string | null =>
          Array.from(store.keys())[index] ?? null,
        get length(): number {
          return store.size;
        },
      };

      Object.defineProperty(globalThis, "localStorage", {
        value: localStoragePolyfill,
        writable: true,
        configurable: true,
      });

      // Also polyfill sessionStorage to be safe
      const sessionStore = new Map<string, string>();
      const sessionStoragePolyfill: Storage = {
        getItem: (key: string): string | null => sessionStore.get(key) ?? null,
        setItem: (key: string, value: string): void => {
          sessionStore.set(key, String(value));
        },
        removeItem: (key: string): void => {
          sessionStore.delete(key);
        },
        clear: (): void => {
          sessionStore.clear();
        },
        key: (index: number): string | null =>
          Array.from(sessionStore.keys())[index] ?? null,
        get length(): number {
          return sessionStore.size;
        },
      };

      Object.defineProperty(globalThis, "sessionStorage", {
        value: sessionStoragePolyfill,
        writable: true,
        configurable: true,
      });
    }
  }
}
