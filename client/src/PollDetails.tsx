import React, { Component, MouseEvent, ChangeEvent } from 'react';
//import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { Poll, parsePoll } from './poll';
import { isRecord } from './record';


type DetailsProps = {

  name: string,
  onBackClick: () => void,

};

type DetailsState = {

  now: number,
  voteNums: string,
  minutes : number,
  error : string,
  poll: Poll | undefined,
  savedPolls : string,

  name : string,
  voter : string,
  option : string,
  
};


// Shows an individual poll and allows voting (if ongoing).
export class PollDetails extends Component<DetailsProps, DetailsState> {

  constructor(props: DetailsProps) {
    super(props);

    this.state = {now: Date.now(), voteNums: "0",
                  minutes: 0, error: "", poll: undefined, savedPolls : "", name: "", voter: "", option : ""};
  }

  componentDidMount = (): void => {
    this.doRefreshClick();
  };

  renderOption = (): JSX.Element => {

   
  if (this.state.poll===undefined) {
      return <div>Getting list options...</div>
    }

    let totalVotes = 0;
    for (const nums of this.state.poll.votesPerOption) {
      totalVotes = totalVotes + nums[1];
    }
 
    const Polls: JSX.Element[] = [];

    for (const val of this.state.poll.votesPerOption) {
      Polls.push(<li>{val[0]+ " " + ((val[1] / totalVotes ) * 100) +"%"} </li>)
    }
    
    return <ul>{Polls}</ul>

  }

  render = (): JSX.Element => {
    if (this.state.poll === undefined) {
      return <p>Loading poll "{this.props.name}"...</p>
    } else 
    
    {
      
      if (this.state.poll.endTime <= this.state.now) {
        console.log(this.state.poll);
        return this.renderCompleted(this.state.poll);

      } 
      
      else {
        return this.renderOngoing(this.state.poll);
      }
    }
  };

  renderCompleted = (poll: Poll): JSX.Element => {

    return (
      <div>
        <h2>{poll.name}</h2>
        <p>Closed {Math.abs(Math.round((poll.endTime - this.state.now) / 60 / 100) / 10)} minutes ago</p>

      <this.renderOption></this.renderOption>

      <button type="button" onClick={this.doRefreshClick}>Refresh</button>
      <button type="button" onClick={this.doDoneClick}>Done</button>
      
      </div>);

  };

  renderOngoing = (poll: Poll): JSX.Element => {

    const min = Math.round((poll.endTime - this.state.now) / 60 / 100) / 10;

    const optionsButtons: JSX.Element[] = [];

    for(var option of poll.options) {

    optionsButtons.push(

      <div key={option}>
            <input type="radio" id={option} name="item" value={option}
                checked={ option === this.state.option ? true : false}
                onChange={this.doOptionsButtonChange}/>
                <label htmlFor={option}>{option}</label>
      </div>

      );

    }

    return (
      <div>
        <h2>{poll.name}</h2>
        <p><i>Poll ends in {min} minutes...</i></p>
        
        <ul>

          {optionsButtons}
          <br></br>

          <label>Voter Name: </label>
          <input id="voteName" type="text" onChange = {this.doVoterNameChange}
              value ={this.state.voter}></input>

        </ul>


        <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        <button type="button" onClick={this.doDoneClick}>Done</button>
        <button type="button" onClick={this.doVoteClick}>Vote</button>

        {this.renderError()}


      </div>);
  };

  
  doVoterNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({voter: evt.target.value, error: ""});
  };

  doOptionsButtonChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    console.log(evt.target.value);
    this.setState({option: evt.target.value, error: ""});
  };

  //<button type="button" onClick={this.doVoteClick}>Vote</button>

  doVoteClick = (_: MouseEvent<HTMLButtonElement>): void => {

    if (this.state.poll === undefined)
      throw new Error("impossible");

    const args = {voter: this.state.voter, name: this.state.poll.name, option: this.state.option };

    console.log("voter" + this.state.voter);
    console.log("name" + this.state.poll.name);
    console.log("option" + this.state.option);

    alert(`Recorded vote of "${this.state.voter}" as "${this.state.option}"`);

    //console.log("Recorded vote of " + this.state.voter + " as " + this.state.option);

    fetch("/api/voteInPoll", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"} })
      .then(this.doVoteResp)
      .catch(() => this.doVoteError("failed to connect to server"));

  }

  doVoteResp = (resp: Response): void => {

    if (resp.status === 200) {
      resp.json().then(this.doListJson)
          .catch(() => this.doVoteError("200 response is not valid JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doVoteError)
          .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code from /api/voteInPoll: ${resp.status}`);
    }
  }

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /voteInPoll: ${msg}`);
  };


  doRefreshClick = (): void => {
    const args = {name: this.props.name};
    fetch("/api/loadPoll", {
        method: "POST", body: JSON.stringify(args),
        headers: {"Content-Type": "application/json"} })
      .then(this.doGetResp)
      .catch(() => this.doGetError("failed to connect to server"));
  };

  doListResponse = (resp: Response): void => {

    if (resp.status === 200) {

      resp.json().then(this.doListJson)
          .catch(() => this.doSaveError("200 response is not valid JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doSaveError)
          .catch(() => this.doSaveError("400 response is not text"));
    } else {
      this.doSaveError(`bad status code from /api/listPoll: ${resp.status}`);
    }

  };

  doSaveError = (msg: string): void => {
    console.error(`Error fetching /savePoll: ${msg}`);
  };

  doLoadError = (msg: string): void => {
    console.error(`Error fetching /listPoll: ${msg}`);
  };

  doGetResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doGetJson)
          .catch(() => this.doGetError("200 res is not JSON"));
    } else if (res.status === 400) {
      res.json().then(this.doGetError)
          .catch(() => this.doGetError("400 response is not text"));
    } else {
      this.doGetError(`bad status code from /api/refresh: ${res.status}`);
    }
  };

  doGetJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/refresh: not a record", data);
      return;
    }

    this.doPollChange(data);
  }

  doPollChange = (data: {poll?: unknown}): void => {
    const pollData = parsePoll(data.poll);

    if (pollData !== undefined) {

      // If the current bid is too small, let's also fix that.
      const amount = parseFloat(this.state.voteNums);
      if (isNaN(amount)) {
        this.setState({poll : pollData, now: Date.now(), error: ""});
      } else {
        this.setState({poll: pollData, now: Date.now(), error: ""});
      }
    } 
    else {
      console.error("poll from /api/refresh did not parse", data.poll)
    }
  };

  doListJson = (data: unknown): void => {

    if (!isRecord(data)) {
      console.error("bad data from /api/listPoll: not a record", data);
      return;
      
    }

    const dataVals = data.value;

    if (dataVals !== undefined && Array.isArray(dataVals)) {
    }
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


  doGetError = (msg: string): void => {
    console.error(`Error fetching /api/refresh: ${msg}`);
  };

  doDoneClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick();  // tell the parent to show the full list again
  };

}

