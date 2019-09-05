import { curryN, head, partial, prop, propEq, sum, map } from 'ramda';
import { adjust } from 'ramda/src/adjust';

import { GitToTempoConfig, getWeek, WorkingDay } from './config';
import { firstMoment, lastMoment, NonEmptyArray, NonOptionalKeys } from './helpers';
import { Story, storyWasInProgressOn } from './story';

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

export const mergeLogs = (...logs: NonEmptyArray<Log>) => {
  const mapProp: <T extends NonOptionalKeys<Log>>(p: T) => Log[T][] = map(prop);
  return {
    ...head(logs),
    timeSpentSeconds: sum(mapProp('timeSpentSeconds')),
    comment: mapProp('comment').join(' '),
  } as Log;
};

export const storiesToLogs = curryN(2, (config: GitToTempoConfig, stories: Story[]): Log[] => {
  return stories.flatMap((story) => {
    return getWeek(config)
      .filter((day) => storyWasInProgressOn(story, day))
      .map<Log>((day) => createLog(config, story, day))
      .reduce<Log[]>(mergeDuplicatesReducer, []);
  })
});