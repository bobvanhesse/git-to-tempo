import R from 'ramda';

import { Story } from './commits';
import { GitToTempoConfig, getWeek } from './config';
import { firstMoment, lastMoment } from './helpers';

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
  number: number;
  repo: string;
  since: string;
}

interface LogBase {
  attributes?: Object;
  comment: string;
  issueKey: string;
  workerId: string;
}
export interface Log extends LogBase {
  timeSpentSeconds: number;
  started: string;
}

export const DATE_FORMAT_TEMPO: Readonly<string> = 'YYYY-MM-DD';

export const storiesToLogs = R.curryN(2, (config: GitToTempoConfig, stories: Story[]): Log[] => {
  return stories.flatMap((story) => {
    const storyConfig: LogBase = {
      ...config.tempo,
      comment: story.commit.rawBody,
      issueKey: story.issueKey,
    };
    return getWeek(config)
      .filter((day) => story.period.start.isBefore(day.end) && story.period.end.isAfter(day.start))
      .map((day) => {
        return {
          ...storyConfig,
          timeSpentSeconds: firstMoment(story.period.end, day.end).diff(
            lastMoment(day.start, story.period.start),
            'second'
          ),
          started: day.start.format(DATE_FORMAT_TEMPO),
        };
      });
  })
});