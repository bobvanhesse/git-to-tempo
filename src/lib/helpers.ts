import { add, Duration, Interval, parse } from 'date-fns';
import { curryN, mapObjIndexed } from 'ramda';

export type ConfigInterval = Record<keyof Interval, string>;

export type Shift<T extends Array<any>> = ((...a: T) => any) extends ((a: any, ...result: infer Result) => any) 
  ? Result 
  : never;

export type UnaryOperator<T> = (x: T) => T;

export const parseInterval = (interval: ConfigInterval, ...parseParams: Shift<Parameters<typeof parse>>): Interval => mapObjIndexed(
  (time) => parse(time, ...parseParams),
  interval
);

export const roundDateTo = curryN(2, (to: Duration | number, date: Readonly<Date>): Date => {
  const timeStamp: number = date.getTime();
  const roundToMilliseconds: number = typeof to === "number"
    ? to * 1000
    : add(0, to).getTime();
  const roundedTimeStamp = Math.round(timeStamp / roundToMilliseconds) * roundToMilliseconds;
  return new Date(roundedTimeStamp);
});