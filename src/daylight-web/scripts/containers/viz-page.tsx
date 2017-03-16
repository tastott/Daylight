import * as React from 'react';
import {connect} from 'react-redux';
import { increment, decrement } from '../actions/counter';
import Viz from '../components/viz';
import VizState from "../store/viz-state";

interface IVizPageProps extends React.Props<any> {
  DataParameters: VizState;
};

function mapStateToProps(state: VizState): IVizPageProps {
  return {
    DataParameters: state
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // increaseCounter: (): void => dispatch(increment()),
    // decreaseCounter: (): void  => dispatch(decrement()),
  };
}

class VizPage extends React.Component<IVizPageProps, void> {
  render() {
    const { DataParameters } = this.props;
 
    return (
    <div>
      <h2>
        Visualization
      </h2>

      <Viz latitude = {DataParameters.Latitude} longitude = {DataParameters.Longitude} />
    </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VizPage);
