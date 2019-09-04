import moment, { Moment } from 'moment';
import R from 'ramda';

export interface GitConfig {
  author: string;
  projectPath: string;
}

export interface GitToTempoConfig {
  git: GitConfig;
  locale?: string;
  prefix: string;
  reportingPeriod: YearWeek;
  workingHours: WorkingHours;
}

export interface TimePeriod {
  start: string;
  stop: string;
}

export interface WorkingHours {
  [weekDay: string]: TimePeriod;
}

export interface WeekLimits {
  end: Moment;
  start: Moment;
}

export interface YearWeek {
  week: number;
  year: number;
}

const weekLimitToMoment = (config: GitToTempoConfig) => (limit: 'start' | 'end'): Moment => {
  return moment([
    config.reportingPeriod.year,
    config.reportingPeriod.week,
    R.compose(
      ([day, timePeriod]) => `${day} ${timePeriod[limit]}`,
      R[limit === 'start' ? 'head' : 'last'],
      R.sortBy(R.head),
      R.toPairs,
      R.prop('workingHours')
    )(config)
  ].join('.'), 'YYYY.W.E hh:mm')
};


export const configToWeekLimits = (config: GitToTempoConfig): WeekLimits => {
  return {
    end: weekLimitToMoment(config)('end'),
    start: weekLimitToMoment(config)('start'),
  };
};