export function Mutate<T extends Object>(original: T, changes: Partial<T>): T {
    return {...<any>original, changes};
}