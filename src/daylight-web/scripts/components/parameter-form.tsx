import * as React from 'react';
import immutable = require("immutable");
import {Parameters} from "../shared/models/parameter";

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
