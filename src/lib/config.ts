import { default as moment } from 'moment';

import { Period, TimePeriod } from './helpers';

export interface GitConfig {
  author: string;
  projectPath: string;
}

export interface GitToTempoConfig {
  git: GitConfig;
  locale?: string;
  prefixes: string[];
  reportingPeriod: Period<string>;
  tempo: TempoConfig;
  workingHours: WorkingSchedule;
}

export interface TempoConfig {
  attributes?: Object;
  workerId: string;
}

export type WorkingSchedule = {
  [day: string]: Period<string>;
};

export interface YearWeek {
  week: number;
  year: number;
}

export const DAY_FORMAT_CONFIG: string = 'E';
export const DATE_FORMAT_CONFIG: string = 'YYYY-MM-DD';
export const TIME_FORMAT_CONFIG: string = 'HH:mm';
export const DATETIME_FORMAT_CONFIG: string = `${DATE_FORMAT_CONFIG}T${TIME_FORMAT_CONFIG}`;

export const getWorkingDays = (config: GitToTempoConfig): TimePeriod[] => {
  const currentDate = moment(config.reportingPeriod.start, DATETIME_FORMAT_CONFIG).startOf('day');
  const stopAtDate = moment(config.reportingPeriod.end, DATETIME_FORMAT_CONFIG).startOf('day');
  const workingDays: TimePeriod[] = [];

  do {
    const day = currentDate.format(DAY_FORMAT_CONFIG);
    if(day in config.workingHours) {
      const date: string  = currentDate.format(DATE_FORMAT_CONFIG);
      workingDays.push({
        start: moment.max(moment(config.reportingPeriod.start, DATETIME_FORMAT_CONFIG), moment(`${date}T${config.workingHours[day].start}`, DATETIME_FORMAT_CONFIG)),
        end: moment.min(moment(config.reportingPeriod.end, DATETIME_FORMAT_CONFIG), moment(`${date}T${config.workingHours[day].end}`, DATETIME_FORMAT_CONFIG)),
      });
    }
  } while(currentDate.add(1, 'days').diff(stopAtDate) <= 0);

  return workingDays;
};