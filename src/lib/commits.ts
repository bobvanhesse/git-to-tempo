import { Commit } from 'gitlog';
import moment from 'moment';

import { GitToTempoConfig, configToWeekLimits } from './config';

export const DATE_FORMAT_GIT: Readonly<string> = 'YYYY-MM-DD hh:mm:ss TZD';

export const getStoryRegEx = (prefix: string): RegExp => {
  return new RegExp(`^\\s*(${prefix}-\\d+):?\\s+`);
};

export const isFormattedCommit = (config: GitToTempoConfig) =>
  (commit: Commit): boolean => {
    return commit.rawBody.match(getStoryRegEx(config.prefix)) instanceof Array;
  };

export const leaveOutNextWeekCommitsExceptFirst = (config: GitToTempoConfig) =>
  (commits: Commit[]): Commit[] => {
    return commits.slice(
      commits.findIndex((commit) =>
        moment(commit.authorDate, DATE_FORMAT_GIT)
          .isBefore(
            configToWeekLimits(config).end
          )
      ) - 1
    );
  };