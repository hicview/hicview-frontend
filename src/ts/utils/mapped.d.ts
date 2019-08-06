
// Use TypeScript Mapped Types, for readonly/optional member access
// See TypeScript Handbook for more details
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
export type Readonly<T> = {
    readonly [P in keyof T]: T[P];
}
export type Partial<T> = {
    [P in keyof T]?: T[P];
}
