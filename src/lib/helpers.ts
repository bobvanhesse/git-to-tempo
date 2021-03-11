import { Moment } from 'moment';

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