declare module 'fuse.js' {
  export interface FuseOptions<T> {
    keys?: Array<string | { name: string; weight?: number }>;
    threshold?: number;
    includeScore?: boolean;
    minMatchCharLength?: number;
  }

  export interface FuseResult<T> {
    item: T;
    score?: number;
    refIndex?: number;
  }

  export default class Fuse<T> {
    constructor(list: T[], options?: FuseOptions<T>);
    search(query: string): FuseResult<T>[];
  }
}
