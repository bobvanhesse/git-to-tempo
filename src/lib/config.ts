import { default as moment } from 'moment';
import { curryN, compose, head, map, prop, sortBy, toPairs } from 'ramda';

import { TimePeriod, Period } from './helpers';

type DayEntry = [string, StaticWorkingDay];

export interface GitConfig {
  author: string;
  projectPath: string;
}

export interface GitToTempoConfig {
  git: GitConfig;
  locale?: string;
  prefix: string;
  reportingPeriod: YearWeek;
  tempo: TempoConfig;
  workingHours: WorkingSchedule;
}

export type StaticWorkingDay = Period<string>;

export interface TempoConfig {
  attributes?: Object;
  workerId: string;
}

export type WorkingDay = TimePeriod;

export interface WorkingSchedule {
  [weekDay: string]: StaticWorkingDay;
}

export interface YearWeek {
  week: number;
  year: number;
}

const dayEntryToWorkingDay = curryN(2, (config: GitToTempoConfig, [day, timePeriod]: DayEntry): WorkingDay => {
  return map((time: string) => {
    return moment(
      `${config.reportingPeriod.year}.${config.reportingPeriod.week}.${day} ${time}`,
      'YYYY.W.E HH:mm'
    );
  }, timePeriod);
});

export const getWeek = (config: GitToTempoConfig): WorkingDay[] => {
  const convertDayEntryToWorkingDay = dayEntryToWorkingDay(config);
  return compose<
    GitToTempoConfig,
    WorkingSchedule,
    DayEntry[],
    DayEntry[],
    WorkingDay[]
  >(
    map(convertDayEntryToWorkingDay),
    sortBy(head),
    toPairs,
    prop('workingHours')
  )(config);
};