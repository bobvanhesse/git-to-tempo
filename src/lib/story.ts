import { areIntervalsOverlapping, Interval } from 'date-fns';
import { curryN } from 'ramda';
export interface Story {
  comment: string;
  originTaskId: string;
  period: Interval;
}

export const storyWasInProgressOn = curryN(2, (story: Story, day: Interval): boolean => {
  return areIntervalsOverlapping(story.period, day);
});