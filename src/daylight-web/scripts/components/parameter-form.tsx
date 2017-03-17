import * as React from 'react';
import immutable = require("immutable");

interface NumberParameter {
    type: "number",
    value: number;
}

export type Parameter = NumberParameter;
export interface Parameters {
    [name: string]: Parameter
}
export interface IParameterFormProps extends React.Props<any> {
    parameters: Parameters;
    update(name: string, value: any): void;
    submit(): void;
};

export function ParameterForm({
  parameters,
  update,
  submit
}: IParameterFormProps) {

    const inputs = immutable.Map(parameters)
        .map((parameter, name) => {
            return <li>
                <label>{name}</label>
                <input  type="text" 
                        value={parameter.value.toString()} 
                        onChange={event => update(name, event.target["value"])} />
            </li>
        })
        .toArray();

    return (
        <ul>{inputs}</ul>
    );
}
