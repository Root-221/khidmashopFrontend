export function getSafeStorage() {
  if (typeof window === "undefined") {
    return {
      length: 0,
      clear() {},
      getItem() {
        return null;
      },
      key() {
        return null;
      },
      removeItem() {},
      setItem() {},
    };
  }

  return window.localStorage;
}
