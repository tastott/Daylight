
export interface UpdateDataParameterAction {
    type: "UpdateDataParameter";
    name: string;
    value: any;
}

export type Action = UpdateDataParameterAction
| {
    type: ""
}

export function UpdateDataParameter(name: string, value: number): UpdateDataParameterAction {
    return {
        type: "UpdateDataParameter",
        name,
        value
    };
}

export default Action;