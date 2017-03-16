import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants';
import immutable = require('immutable');
import {Action} from "../actions/viz";
import VizState from "../store/viz-state";


const initialState: VizState = {
  Latitude: 50,
  Longitude: 0
}

function vizStateReducer(state: VizState = initialState , action: Action = {type: "Default"}): VizState {
  switch(action.type){
    default: return state;
    case "UpdateLatitude":
      return <any>immutable.Map(state)
        .set("Latitude", action.Value)
        .toObject() as VizState;

     case "UpdateLongitude":
      return <any>immutable.Map(state)
        .set("Longitude", action.Value)
        .toObject() as VizState;
  }
}

export default vizStateReducer;
