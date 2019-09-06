import { default as moment, Moment } from 'moment';

export type NonOptionalKeys<T> = {
  [k in keyof T]-?: undefined extends T[k]
    ? never
    : k
}[keyof T];

export interface Period<T> {
  start: T;
  end: T;
}

export type TimePeriod = Period<Moment>;

export const firstMoment = (...moments: Moment[]): Moment => {
  return moments.reduce((first, check, checkIndex) => {
    return checkIndex === 0 || check.isBefore(first)
      ? check
      : first;
  }, moment(0, 'x'));
};

export const lastMoment = (...moments: Moment[]): Moment => {
  return moments.reduce((last, check, checkIndex) => {
    return checkIndex === 0 || check.isAfter(last)
      ? check
      : last;
  }, moment(0, 'x'));
};