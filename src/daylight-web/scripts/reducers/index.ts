
import immutable = require('immutable');
import {Action} from "../actions/viz";
import VizState from "../store/viz-state";
import {Mutate} from "../shared/utilities";

const initialState: VizState = {
  VizName: "Daylight",
  DataParameters: {
    Latitude: {
      type: "number",
      value: 50
    },
    Longitude: {
      type: "number",
      value: 0
    }
  }
}

function vizStateReducer(state: VizState = initialState , action: Action = {type: ""}): VizState {
  switch(action.type){
    default: return state;
    case "UpdateDataParameter":
      return <any>immutable.Map(state.DataParameters)
        .update(action.name, existing => Mutate(existing, { value: action.value}) )
        .toObject() as VizState;
  }
}

export default vizStateReducer;
