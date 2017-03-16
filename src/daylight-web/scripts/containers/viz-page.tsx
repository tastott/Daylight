import * as React from 'react';
import {connect} from 'react-redux';

import { increment, decrement } from '../actions/counter';
import Viz from '../components/viz';

interface IVizPageProps extends React.Props<any> {
  counter: number;
  increaseCounter: () => void;
  decreaseCounter: () => void;
};

function mapStateToProps(state) {
  return {
    counter: state.get('count'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    increaseCounter: (): void => dispatch(increment()),
    decreaseCounter: (): void  => dispatch(decrement()),
  };
}

class VizPage extends React.Component<IVizPageProps, void> {
  render() {
    const { counter, increaseCounter, decreaseCounter } = this.props;
 
    return (
    <div>
      <h2
        data-testid="counter-heading"
        className="center caps"
        id="qa-counter-heading">
        Counter
      </h2>

      <Viz
        counter={ counter }
        increment={ increaseCounter }
        decrement={ decreaseCounter } />
    </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterPage);
