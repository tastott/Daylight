import * as React from 'react';
import {connect} from 'react-redux';
import { UpdateValue } from "../actions/viz";
import Viz from '../components/viz';
import VizState from "../store/viz-state";
import {ParameterForm, Parameters} from "../components/parameter-form";

interface IVizPageProps extends React.Props<any> {
  DataParameters: VizState;
  UpdateLatitude(value: number): void;
  UpdateLongitude(value: number): void;
};

function mapStateToProps(state: VizState): Partial<IVizPageProps> {
  return {
    DataParameters: state
  };
}

function mapDispatchToProps(dispatch): Partial<IVizPageProps> {
  return {
    UpdateLatitude: (value: number): void => 
      dispatch(UpdateValue("UpdateLatitude", value))
    ,
    UpdateLongitude: (value: number): void =>
      dispatch(UpdateValue("UpdateLongitude", value))
    // increaseCounter: (): void => dispatch(increment()),
    // decreaseCounter: (): void  => dispatch(decrement()),
  };
}

class VizPage extends React.Component<IVizPageProps, void> {

  handleUpdate = (event: React.FormEvent) => {
    this.props.UpdateLatitude(parseFloat(event.target["value"]));
  }

  update = (name: string, value: any): void => {
    if (name == "Longitude"){
      this.props.UpdateLongitude(value);
    }
    else if (name == "Latitude") {
      this.props.UpdateLatitude(value);
    }
  }

  submit = (): void => {
    
  }

  render() {
    const { DataParameters } = this.props;
 
    const formParameters: Parameters = {
      Latitude: {
        type: "number",
        value: DataParameters.Latitude
      },
      Longitude: {
        type: "number",
        value: DataParameters.Longitude
      }
    }

    return (
    <div>
      <h2>
        Daylight hours
      </h2>
      {/*<input type="text" value={DataParameters.Latitude.toString()} onChange={this.handleUpdate} />*/}
      <ParameterForm parameters={formParameters} update={this.update} submit={this.submit} />
      <Viz latitude = {DataParameters.Latitude} longitude = {DataParameters.Longitude} />
    </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VizPage);
