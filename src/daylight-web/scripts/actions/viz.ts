
export interface UpdateAction {
    type: "UpdateLatitude" | "UpdateLongitude";
    Value: number;
}

export type Action = UpdateAction
| {
    type: "Default"
}

export function UpdateValue(type: "UpdateLatitude" | "UpdateLongitude", value: number): UpdateAction {
    return {
        type: type,
        Value: value
    };
}

export default Action;