import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { isRecord } from './record';


type NewPollProps = {

  onBackClick: () => void,
  onPollClick: (name: string) => void,

};

type NewPollState = {

  minutes : string,
  options: string,
  name: string,
  endTime: string,
  error : string;

};


// Allows the user to create a new auction.
export class NewPoll extends Component<NewPollProps, NewPollState> {

  constructor(props: NewPollProps) {
    super(props);
    this.state = { minutes : "1",  options : "", name: "", endTime: "", error : ""};
  }

  render = (): JSX.Element => {
    return (
      <div>
        <h2>New Poll</h2>
        <div>
          <label>Name:</label>
          <input id="name" type="text" onChange ={this.doNameChange}
              value ={this.state.name}></input>
        </div>
        <div>
          <label htmlFor="endTime">Minutes:</label>
          <input id="endTime" type="number" min = '1' onChange={this.doEndTimeChange}
              value = {this.state.endTime}></input>
        </div>
        <div></div>
        <div>
            <label>Options (one per line, minimum 2 lines): </label>
            
        </div>
        <textarea id="options" rows = {3} cols = {20} 
        onChange = {this.doOptionsChange} value = {this.state.options}></textarea>
        <div></div>
        <button type="button" onClick={this.doCreateClick}>Create</button>
        <button type="button" onClick={this.doBackClick}>Back</button>
        {this.renderError()}

      </div>);
  };

  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
          border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
      return (<div style={{marginTop: '15px'}}>
          <span style={style}><b>Error</b>: {this.state.error}</span>
        </div>);
    }
  };

  
  doAddResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doAddJson)
          .catch(() => this.doAddError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.json().then(this.doAddError)
          .catch(() => this.doAddError("400 response is not text"));
    } else {
      this.doAddError(`bad status code from /api/savePoll: ${resp.status}`);
    }
  };

  doAddJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/savePoll: not a record", data);
      return;
    }

    this.props.onBackClick();  // show the updated list
  };

  doAddError = (msg: string): void => {
    this.setState({error: msg})
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();  // tell the parent this was clicked
  };

  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({name: evt.target.value, error: ""});
  };

  doEndTimeChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({endTime: evt.target.value, error: ""});
  }; 

  doOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {

    this.setState({options: evt.target.value, error: ""});

  };

  doCreateClick = (_: MouseEvent<HTMLButtonElement>): void => {

    // Verify that the user entered all required information.
    if(this.state.options.length <= 1) {
      this.setState({error: "Uh oh, poll must have 2 elements"});
      return;
    }

    if (this.state.name.trim().length === 0 ||
        this.state.options.trim().length === 0 ||
        this.state.endTime.trim().length === 0) {
      this.setState({error: "a required field is missing."});
      return;
    }

    const minutes = parseFloat(this.state.endTime);
    if (isNaN(minutes) || minutes < 1 || Math.floor(minutes) !== minutes) {
      this.setState({error: "minutes is not a positive integer"});
      return;
    }

    const args = { 
        options: this.state.options.split("\n"),
        name: this.state.name,
        endTime: minutes,
        };

        console.log(args);

    fetch("/api/savePoll", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"}})
      .then(this.doAddResp)
      .catch(() => this.doAddError("failed to connect to server"));
    };

}   
