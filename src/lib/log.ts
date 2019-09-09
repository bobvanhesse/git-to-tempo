import { curryN, eqProps, head, partial } from 'ramda';
import adjust from 'ramda/src/adjust';

import { GitToTempoConfig, getWeek, WorkingDay } from './config';
import { firstMoment, lastMoment } from './helpers';
import { Story, storyWasInProgressOn } from './story';

export interface Log {
  attributes?: Object;
  comment: string;
  originTaskId: string;
  started: string;
  timeSpentSeconds: number;
  workerId: string;
}

export const DATE_FORMAT_TEMPO: Readonly<string> = 'YYYY-MM-DD';

export const createLog = curryN(3, (config: GitToTempoConfig, story: Story, day: WorkingDay): Log => ({
  ...config.tempo,
  comment: story.comment,
  originTaskId: story.originTaskId,
  started: day.start.format(DATE_FORMAT_TEMPO),
  timeSpentSeconds: firstMoment(story.period.end, day.end)
    .diff(lastMoment(day.start, story.period.start), 'second'),
}));

const mergeDuplicatesReducer = (logs: Log[], log: Log): Log[] => {
  const updateLogIndex = logs.findIndex((compareLog) =>
    ['originTaskId', 'started'].every((prop) => eqProps(prop, log, compareLog))
  );
  return updateLogIndex >= 0
    ? adjust(updateLogIndex, partial(mergeLogs, [log]), logs)
    : [...logs, log];
};

export const mergeLogs = (...logs: Log[]): Log => {
  return {
    ...head(logs) as Log,
    timeSpentSeconds: logs.reduce((time, log) => time + log.timeSpentSeconds, 0),
    comment: logs.reduce((comment, log) => [comment, log.comment].join(' '), ''),
  };
};

export const storiesToLogs = curryN(2, (config: GitToTempoConfig, stories: Story[]): Log[] => {
  return stories
    .flatMap((story) => {
      return getWeek(config)
        .filter((day) => storyWasInProgressOn(story, day))
        .map<Log>((day) => createLog(config, story, day));
    })
    .reduce<Log[]>(mergeDuplicatesReducer, []);
});