/**
 * Deno port of `localstorate-memory`
 * @link https://github.com/gr2m/localstorage-memory
 */
export class LocalStorageMemory {
  localStorageMemory = {};
  cache: { [key: string]: string } = {};
  /**
   * Number of stored items.
   */
  length = 0;

  /**
   * Returns item for passed key, or null
   *
   * @param key name of item to be returned
   */
  getItem = (key: string): string | null => {
    if (key in this.cache) {
      return this.cache[key];
    }

    return null;
  };

  /**
   * Sets item for key to passed value, as String
   * @param key name of item to be set
   * @param value value, will always be turned into a String
   */
  setItem = (key: string, value: string): void => {
    if (typeof value === "undefined") {
      this.removeItem(key);
    } else {
      const keyInCache = Object.keys(this.cache).includes(key);
      if (!keyInCache) {
        this.length++;
      }

      this.cache[key] = value;
    }
  };

  /**
   * removes item for passed key
   *
   * @param key name of item to be removed
   */
  removeItem = (key: string): void => {
    const keyInCache = Object.keys(this.cache).includes(key);
    if (keyInCache) {
      delete this.cache[key];
      this.length--;
    }
  };

  /**
   * Returns name of key at passed index
   * @param index Position for key to be returned (starts at 0)
   */
  key = (index: number): string | null => {
    return Object.keys(this.cache)[index] || null;
  };

  /**
   * Removes all stored items and sets length to 0
   */
  clear = (): void => {
    this.cache = {};
    this.length = 0;
  };
}
