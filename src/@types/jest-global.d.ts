declare type AsyncTestFn = () => Promise<void> | void;

declare function describe(description: string, fn: AsyncTestFn): void;
declare function it(description: string, fn: AsyncTestFn): void;
declare function test(description: string, fn: AsyncTestFn): void;

declare function beforeEach(fn: AsyncTestFn): void;
declare function afterEach(fn: AsyncTestFn): void;

declare type JestMatcher<T> = {
  toBe(value: T): void;
  toBeDefined(): void;
  toBeGreaterThan(value: number): void;
  toBeLessThan(value: number): void;
  toEqual(value: unknown): void;
  toContain(value: string): void;
};

declare function expect<T>(actual: T): JestMatcher<T>;
