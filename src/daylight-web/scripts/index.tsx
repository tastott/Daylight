import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
// const { Router, browserHistory } = require('react-router');
// const { syncHistoryWithStore } = require('react-router-redux');

// import routes from './store/routes';
import rootReducer from "./reducers"
import {createStore} from "redux";
import VizPage from "./containers/viz-page";

const store = createStore(rootReducer);
// const history = syncHistoryWithStore(browserHistory, store);

  ReactDOM.render(
    <div>
      <Provider store={ store }>
        <div>
          <VizPage />
        </div>
      </Provider>
    </div>,
    document.getElementById('root')
  );
