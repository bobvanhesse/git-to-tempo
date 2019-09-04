import {Commit} from 'gitlog';
import moment from 'moment';

import { DATE_FORMAT_GIT, getStoryRegEx } from './commits';
import { GitToTempoConfig } from './config';

export interface GitLogExecOptions {
  maxBuffer: number;
}

export interface GitLogOptions {
  all: boolean;
  author: string;
  before: string;
  execOptions: GitLogExecOptions;
  fields: string[];
  nameStatus: boolean;
  repo: string;
  since: string;
}

export interface Log {
  date: string;
  description: string;
  story: string;
}

export const DATE_FORMAT_TEMPO: Readonly<string> = 'YYYY-MM-DD';

export const commitToLog = (config: GitToTempoConfig) =>
  (commit: Commit): Log => {
    return {
      date: moment(commit.authorDate, DATE_FORMAT_GIT).format(DATE_FORMAT_TEMPO),
      description: commit.rawBody.replace(getStoryRegEx(config.prefix), ''),
      story: (commit.rawBody.match(getStoryRegEx(config.prefix)) as RegExpMatchArray)[1],
    };
  };