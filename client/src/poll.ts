import { isRecord } from "./record";


// Description of an individual auction

export type Poll = {

    readonly name: string,
    readonly endTime: number,
    readonly options: string[],
    readonly votesPerOption: [string, number][];

};

/**
 * 
 * @param val 
 * @returns 
 */
export const isMap = (val: unknown): val is Map<string, string> => {

  return val !== null && typeof val === "object";

};


/**
 * Parses unknown data into an Poll. Will log an error and return undefined
 * if it is not a valid Poll.
 * @param val unknown data to parse into a Poll
 * @return Poll if val is a valid Auction and undefined otherwise
 */
export const parsePoll = (val: unknown): undefined | Poll => {

  if (!isRecord(val)) {
    console.error("not a poll", val);
    return undefined;
  }

  if (typeof val.name !== "string") {
    console.error("not a poll: missing 'name'", val);
    return undefined;
  }

  if (typeof val.endTime !== "number") {
    console.error("not a poll: missing 'endTime'", val);
    return undefined;
  }


  if(!(isMap(val.userData))) {
    console.error("not a poll: missing 'userData'", val);
    return undefined;
  }


  return {

    name: val.name, 
    endTime: val.endTime, 
    options: Array.isArray(val.options) ? val.options: [],
    votesPerOption: Array.isArray(val.votesPerOption) ? val.votesPerOption : []

  };
};