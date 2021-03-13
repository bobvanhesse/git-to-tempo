import { differenceInSeconds, format, Interval, max, min, parse } from 'date-fns';
import { curryN, eqProps, head, partial } from 'ramda';
import adjust from 'ramda/src/adjust';

import { TIME_FORMAT_CONFIG, DAY_FORMAT_CONFIG, getWorkingDays, GitToTempoConfig } from './config';
import { ConfigInterval } from './helpers';
import { Story, storyWasInProgressOn } from './story';

export interface Log {
  attributes?: Object;
  comment: string;
  originTaskId: string;
  started: string;
  timeSpentSeconds: number;
  workerId: string;
}

export const DATETIME_FORMAT_TEMPO: string = `yyyy-MM-dd'T'HH:mm:ss.SSS`;

export const createLog = curryN(3, (config: GitToTempoConfig, story: Story, day: Interval): Log => {
  const todaysWorkingHours: ConfigInterval = config.workingHours[format(day.start, DAY_FORMAT_CONFIG)];
  const todaysStart: Date = parse(todaysWorkingHours.start, TIME_FORMAT_CONFIG, day.start);
  return {
    ...config.tempo,
    comment: story.comment,
    originTaskId: story.originTaskId,
    started: format(max([todaysStart, story.period.start]), DATETIME_FORMAT_TEMPO),
    timeSpentSeconds: differenceInSeconds(
      min([story.period.end, day.end]),
      max([day.start, story.period.start])
    ),
  };
});

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
      return getWorkingDays(config)
        .filter((day) => storyWasInProgressOn(story, day))
        .map<Log>((day) => createLog(config, story, day));
    })
    .reduce<Log[]>(mergeDuplicatesReducer, [])
    .filter((log) => log.timeSpentSeconds > 0);
});