
interface NumberParameter {
    type: "number",
    value: number;
}

export type Parameter = NumberParameter;
export interface Parameters {
    [name: string]: Parameter
}