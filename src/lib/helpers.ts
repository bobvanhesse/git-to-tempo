import moment, { Moment } from "moment";

export type NonEmptyArray<T> = [T, ...T[]];

export interface Period<T> {
  start: T;
  end: T;
}

export type TimePeriod = Period<Moment>;

export const firstMoment = (...moments: NonEmptyArray<Moment>): Moment => {
  return moments.reduce((first, check, checkIndex) => {
    return checkIndex === 0 || check.isBefore(first as unknown as Moment)
      ? check
      : first;
  }, moment(0, 'x'));
};

export const lastMoment = (...moments: NonEmptyArray<Moment>): Moment => {
  return moments.reduce((last, check, checkIndex) => {
    return checkIndex === 0 || check.isAfter(last as unknown as Moment)
      ? check
      : last;
  }, moment(0, 'x'));
};