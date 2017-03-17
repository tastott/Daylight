import * as React from 'react';
import {connect} from 'react-redux';
import { UpdateDataParameter } from "../actions/viz";
import Viz from '../components/viz';
import VizState from "../store/viz-state";
import {ParameterForm} from "../components/parameter-form";
import {Parameters} from "../shared/models/parameter";

interface IVizPageProps extends React.Props<any> {
    Parameters: Readonly<Parameters>;
    Updates: Parameters;
    Update(name: string, value: any): void
};

function mapStateToProps(state: VizState): Partial<IVizPageProps> {
  return {
      Parameters: state.DataParameters,
      Updates: {}
  };
}

function mapDispatchToProps(dispatch): Partial<IVizPageProps> {
  return {
    Update: (name: string, value: any) => {
      dispatch(UpdateDataParameter(name, value));
    }
  };
}

class VizPage extends React.Component<IVizPageProps, void> {

  update = (name: string, value: any): void => {
    this.props.Update(name, value);
  }

  submit = (): void => {
    
  }

  render() {
    const { Parameters } = this.props;

    return (
    <div>
      <h2>
        Daylight hours
      </h2>
      {/*<input type="text" value={DataParameters.Latitude.toString()} onChange={this.handleUpdate} />*/}
      <ParameterForm parameters={Parameters} update={this.update} submit={this.submit} />
      <Viz DataParameters={Parameters} />
    </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VizPage);
