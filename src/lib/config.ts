import { Duration, eachDayOfInterval, format, Interval, max, min } from 'date-fns';
import { ConfigInterval, parseInterval } from './helpers';

export interface GitConfig {
  author: string;
  projectPath: string;
}

export interface GitToTempoConfig {
  git: GitConfig;
  prefixes: string[];
  reportingPeriod: ConfigInterval;
  roundTo?: Duration | number;
  tempo: TempoConfig;
  workingHours: WorkingSchedule;
}

export interface TempoConfig {
  attributes?: Object;
  workerId: string;
}

export type WorkingSchedule = {
  [day: string]: ConfigInterval;
};

export const DAY_FORMAT_CONFIG = 'i';
export const DATE_FORMAT_CONFIG = 'yyyy-MM-dd';
export const TIME_FORMAT_CONFIG = 'HH:mm';
export const DATETIME_FORMAT_CONFIG = `${DATE_FORMAT_CONFIG}'T'${TIME_FORMAT_CONFIG}`;

export const getWorkingDays = (config: GitToTempoConfig): Interval[] => {
  const reportingPeriod = parseInterval(config.reportingPeriod, DATETIME_FORMAT_CONFIG, new Date());

  return eachDayOfInterval(reportingPeriod).flatMap((date) => {
    const day = format(date, DAY_FORMAT_CONFIG);
    if(day in config.workingHours === false) return [];
    const workingHours = parseInterval(config.workingHours[day], TIME_FORMAT_CONFIG, date);
    return [
      {
        start: max([reportingPeriod.start, workingHours.start]),
        end: min([reportingPeriod.end, workingHours.end]),
      }
    ];
  });
};