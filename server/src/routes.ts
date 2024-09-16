import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check


// TODO: remove the dummy route

/**
 * Create a new poll with the given list of options and closing in the given
 * number of minutes. Returns a unique ID for the poll.
 * @param req The request object
 * @param res The response object
 */
export const dummy = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.query.name;
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  }

  res.send({msg: `Hi, ${name}!`});
};

// Description of an individual poll
type Poll = {

  name: string,
  endTime: number,
  options : string[],
  pollUsers: string[],
  votesPerOption: [string, number][];

  userData: Map<string, string>;

};

// Array from name to poll details.
const polls: Array<Poll> = new Array();

/** Testing function to remove all the added auctions. */
export const resetForTesting = (): void => {

  polls.splice(0, polls.length);

};

/**
 * Saves items to a Poll
 * @param req The request object
 * @param res The response object
 */
export const savePoll = (req: SafeRequest, res: SafeResponse): void => {

  const name = req.body.name;

  if (typeof name !== 'string') {
    res.status(400).send("invalid 'name' parameter");
    return;
  } 
  
  const endTime = req.body.endTime;

  if (typeof endTime !== "number" || endTime === 0) {
    res.status(400).send("invalid 'endTime' parameter");
    return;
  } 

  for (const poll of polls) {
    if (poll.name === name) {
      res.status(400).send("invalid duplicate poll");
      return;
    }
  }

  const options = req.body.options;

  if(!Array.isArray(options)) {
    res.status(400).send("invalid 'options' parameter");
    return;
  }
  

  let x : [string, number][] = [];

  for(const option of options) {

    x.push([option, 0]);

  }


  const newPoll : Poll = {
    
    name: name,
    endTime: Date.now() + endTime * 60 * 1000, // convert to ms
    options : options,

    userData : new Map<string, string>(),
    pollUsers:[],
    votesPerOption:x,

  }

  polls.push(newPoll);
  res.send(newPoll);

};

const comparePolls = (a: Poll, b: Poll): number => {

  const now : number = Date.now();
  const endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
  const endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
  return endA - endB;

}

/**
 * Loads the current state of the given poll
 * @param req the request
 * @param res the response
 * @returns 
 */
export const loadPoll = (req: SafeRequest, res: SafeResponse): void => {

  const name = req.body.name;
  if(typeof name !== "string") {
    res.status(400).send("missing or invalid parameters");
    return;
  }

  const poll = polls.find((p) => p.name === name);

  if(poll === undefined) {
    res.status(400).send(`no poll with name '${name}'`);
    return;
  }


  res.send({poll: poll});
  
}

/**
 * Votes in a poll and performs manipulation based off of option chosen
 * @param req the request
 * @param req the response
 */
export const voteInPoll = (req: SafeRequest, res: SafeResponse): void => {
  
  const voter = req.body.voter;
  if(typeof voter !== "string") {
    res.status(400).send("missing or invalid 'voter' parameter");
    return;
  }

  const name = req.body.name;
  if(typeof name !== "string") {
    res.status(400).send("missing or invalid 'name' parameter");
    return;
  }

  const poll = polls.find((p) => p.name === name);
  
  if(poll === undefined) {
    res.status(400).send(`no poll with name '${name}'`);
    return;
  }

  const option = req.body.option;
  if(typeof option !== "string") {
    res.status(400).send("missing or invalid 'option' parameter");
    return;
  }

  const now = Date.now();
  if(now >= poll.endTime) {
    res.status(400).send(`poll for "${poll.name}" has already ended`);
    return;
  }

  for (const x of poll.votesPerOption) {

    if (x[0] === option) {

      x[1] = x[1] + 1;

    }
  }

  res.send(poll);
  return;

}


/**
 * Retrieves the current state of a given poll
 * @param _req the request
 * @param res the response
 */
export const listPoll = (_req: SafeRequest, res: SafeResponse): void => {

  const vals = Array.from(polls.values()); 
  vals.sort(comparePolls);
  res.send({polls: vals})

}