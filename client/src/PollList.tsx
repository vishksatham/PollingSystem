import React, { Component, MouseEvent } from 'react';
import { Poll } from './poll';
import { isRecord } from './record';


type ListProps = {

  onNewClick: () => void,
  onPollClick: (name: string) => void

};

type ListState = {

  time: number, 
  openPolls: Poll[] | undefined,
  closedPolls: Poll[] | undefined,

};

// Shows the list of all the polls.
export class PollsList extends Component<ListProps, ListState> {

  constructor(props: ListProps) {
    super(props);
    this.state = {time: Date.now(), openPolls: [],  closedPolls: []};
  }

  render = (): JSX.Element => {
    return (
      <div>
        <h2>Current Polls</h2>
        <div></div>
        <h2>Still Open</h2>
        {this.renderOpenPolls()}
        <div></div>
        <h2>Closed</h2>
        {this.renderClosedPolls()}
        <button type="button" onClick={this.doReloadClick}>Refresh</button>
        <button type="button" onClick={this.doNewClick}>New Poll</button>
      </div>);

  };

  renderOpenPolls = (): JSX.Element => {

    const openPolls: JSX.Element[] = [];

    if (this.state.closedPolls === undefined) {
      return <p>Loading Poll list...</p>;
    } 
    
    else {
    if(this.state.openPolls !== undefined) {
      for(const poll of this.state.openPolls) {
      const min = (poll.endTime - this.state.time) / 60 / 1000;
      const desc = (min < 0) ? "" :
          <span>&nbsp;&ndash; {Math.round(min)} minutes remaining</span>;
      openPolls.push(
        <li key={poll.name}>
          <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
          {desc}
        </li>);
      }
      }
  }
  return <ul>{openPolls}</ul>;
};


renderClosedPolls = (): JSX.Element => {

  const closedPolls: JSX.Element[] = [];

  if (this.state.closedPolls === undefined) {
    return <p>Loading Poll list...</p>;
  } 
  
  else {

  if(this.state.closedPolls !== undefined) {
    for(const poll of this.state.closedPolls) {
    const min = (poll.endTime - this.state.time) / 60 / 1000;
    const desc = (min >= 0) ? "" :
        <span>&nbsp;&ndash; closed {Math.abs(Math.round(min))} minutes ago</span>;
    closedPolls.push(
      <li key={poll.name}>
        <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
        {desc}
      </li>);
    }
    }
  }
  
  return <ul>{closedPolls}</ul>;

};

  componentDidMount = (): void => {
    this.doRefreshClick();
  }

  componentDidUpdate = (prevProps: ListProps): void => {
    if (prevProps !== this.props) {
      this.setState({time: Date.now()});  // Force a refresh
    }
  };


  doReloadClick = (): void => {

    window.location.reload();
    
  }


  doListResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doListJson)
          .catch(() => this.doListError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.json().then(this.doListError)
          .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code from /api/listPoll: ${resp.status}`);
    }
  };

  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/loadPoll: not a record", data);
      return;
    }

    if (!Array.isArray(data.polls)) {
      console.error("bad data from /api/loadPoll: polls is not an array", data);
      return;
    }


    const openPolls: Poll[] = []
    const closedPolls: Poll[] = []
    
    for (const poll of data.polls){
      if(this.state.time <= poll.endTime){
        openPolls.push(poll)
      } else {
        closedPolls.push(poll)
      }
    }
     
    this.setState({ openPolls : openPolls, closedPolls : closedPolls, time: Date.now()});  // fix time also

  };

  doListError = (msg: string): void => {
    console.error(`Error fetching /api/listPoll: ${msg}`);
  };

  doRefreshClick = (): void => {
    fetch("/api/listPoll").then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  };

  doNewClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onNewClick();  // tell the parent to show the new poll page
  };

  doPollClick = (evt: MouseEvent<HTMLAnchorElement>, name: string): void => {
    evt.preventDefault();
    this.props.onPollClick(name);
  };

}
