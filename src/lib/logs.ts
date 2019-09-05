import { adjust, curryN, head, partial, propEq, sum } from 'ramda';

import { GitToTempoConfig, getWeek, WorkingDay } from './config';
import { firstMoment, lastMoment, NonOptionalKeys } from './helpers';
import { Story, storyWasInProgressOn } from './story';

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

export interface Log {
  attributes?: Object;
  comment: string;
  issueKey: string;
  started: string;
  timeSpentSeconds: number;
  workerId: string;
}

export const DATE_FORMAT_TEMPO: Readonly<string> = 'YYYY-MM-DD';

export const createLog = curryN(3, (config: GitToTempoConfig, story: Story, day: WorkingDay): Log => ({
  ...config.tempo,
  comment: story.commit.rawBody,
  issueKey: story.issueKey,
  started: day.start.format(DATE_FORMAT_TEMPO),
  timeSpentSeconds: firstMoment(story.period.end, day.end)
    .diff(lastMoment(day.start, story.period.start), 'second'),
}));

const mergeDuplicatesReducer = (logs: Log[], log: Log): Log[] => {
  const updateLogIndex = logs.findIndex((compareLog) =>
    ['issueKey', 'started'].every((prop) => propEq(prop, log, compareLog))
  );
  return updateLogIndex >= 0
    ? adjust(updateLogIndex, partial(mergeLogs, [log]), logs)
    : [...logs, log];
};

export const mergeLogs = (...logs: [Log, ...Log[]]) => {
  const mapProp = <T extends NonOptionalKeys<Log>>(prop: T): Log[T][] => {
    return logs.map((log) => log[prop]);
  };
  return {
    ...head(logs),
    timeSpentSeconds: sum(mapProp('timeSpentSeconds')),
    comment: mapProp('comment').join(' '),
  };
};

export const storiesToLogs = curryN(2, (config: GitToTempoConfig, stories: Story[]): Log[] => {
  return stories.flatMap((story) => {
    return getWeek(config)
      .filter((day) => storyWasInProgressOn(story, day))
      .map<Log>((day) => createLog(config, story, day))
      .reduce<Log[]>(mergeDuplicatesReducer, []);
  })
});