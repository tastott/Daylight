import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants';
import { fromJS } from 'immutable';

import VizState from "../store/viz-state";

const INITIAL_STATE = fromJS({
  count: 0,
});

function counterReducer(state = INITIAL_STATE, action = { type: '' }) {
  switch (action.type) {

  case INCREMENT_COUNTER:
    return state.update('count', (value) => value + 1);

  case DECREMENT_COUNTER:
    return state.update('count', (value) => value - 1);
    
  default:
    return state;
  }
}

const initialState: VizState = {
  Latitude: 50,
  Longitude: 0
}

function vizStateReducer(state: VizState = initialState , action: any = {}) {
  return state;
}

export default vizStateReducer;
