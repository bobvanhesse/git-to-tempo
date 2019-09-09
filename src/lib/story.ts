import { curryN } from 'ramda';

import { WorkingDay } from './config';
import { TimePeriod } from './helpers';

export interface Story {
  comment: string;
  originTaskId: string;
  period: TimePeriod;
}

export const storyWasInProgressOn = curryN(2, (story: Story, day: WorkingDay): boolean => {
  return story.period.start.isBefore(day.end) && story.period.end.isAfter(day.start);
});