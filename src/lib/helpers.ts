import { default as moment, duration, DurationInputObject, Moment } from 'moment';
import { curryN } from 'ramda';

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

export const roundMomentTo = curryN(2, (to: DurationInputObject | number, momentObj: Readonly<Moment>): Moment => {
  const timeStamp: number = momentObj.unix();
  const roundToSeconds: number = typeof to === "number" ? to : duration(to).asSeconds();
  const roundedTimeStamp = Math.round(timeStamp / roundToSeconds) * roundToSeconds;
  return moment.unix(roundedTimeStamp);
});