import moment from 'moment';
import R from 'ramda';

import { TimePeriod, Period } from './helpers';

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

type DayEntry = [string, StaticWorkingDay];

const dayEntryToWorkingDay = R.curryN(2, (config: GitToTempoConfig, [day, timePeriod]: DayEntry): WorkingDay => {
  return R.map((time: string) => {
    return moment(
      `${config.reportingPeriod.year}.${config.reportingPeriod.week}.${day} ${time}`,
      'YYYY.W.E HH:mm'
    );
  }, timePeriod);
});

export const getWeek = (config: GitToTempoConfig): WorkingDay[] => {
  const convertDayEntryToWorkingDay = dayEntryToWorkingDay(config);
  return R.compose<
    GitToTempoConfig,
    WorkingSchedule,
    DayEntry[],
    DayEntry[],
    WorkingDay[]
  >(
    R.map(convertDayEntryToWorkingDay),
    R.sortBy(R.head),
    R.toPairs,
    R.prop('workingHours')
  )(config);
};