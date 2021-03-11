import { default as moment } from 'moment';
import { curryN, compose, head, map, prop, sortBy, toPairs } from 'ramda';
import { RequireAtLeastOne } from 'type-fest';

import { Period, TimePeriod } from './helpers';

type DayEntry = [string, StaticWorkingDay];

export interface GitConfig {
  author: string;
  projectPath: string;
}

export interface GitToTempoConfig {
  git: GitConfig;
  locale?: string;
  prefixes: string[];
  reportingPeriod: YearWeek;
  tempo: TempoConfig;
  workingHours: WorkingSchedule;
}

export type StaticWorkingDay = Period<string>;

export interface TempoConfig {
  attributes?: Object;
  workerId: string;
}

export type WeekDayNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type WorkingDay = TimePeriod;

export type WorkingSchedule = RequireAtLeastOne<{
  [D in WeekDayNumber]: StaticWorkingDay;
}>;

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
    sortBy<DayEntry>(head),
    toPairs,
    prop('workingHours')
  )(config);
};