import { Commit } from 'gitlog';
import moment from 'moment';
import R from 'ramda';

import { GitToTempoConfig } from './config';
import { Story } from './story';

export const DATE_FORMAT_GIT: Readonly<string> = 'YYYY-MM-DD HH:mm:ss ZZ';

export const commitsToStories = R.curryN(2, (config: GitToTempoConfig, commits: Commit[]): Story[] => {
  return commits
    .filter(isFormattedCommit(config))
    .reverse()
    .map((commit, commitIndex, commits) => ({
      commit,
      issueKey: (commit.rawBody.match(getStoryRegEx(config)) as RegExpMatchArray)[1],
      period: {
        end: moment(commit.authorDate, DATE_FORMAT_GIT),
        start: commitIndex > 0
          ? moment(commits[commitIndex - 1].authorDate, DATE_FORMAT_GIT)
          : moment(0, 'x')
      },
    }));
})

export const getStoryRegEx = (config: GitToTempoConfig): RegExp => {
  return new RegExp(`^\\s*(${config.prefix}-\\d+):?\\s+`);
};

export const isFormattedCommit = R.curryN(2, (config: GitToTempoConfig, commit: Commit): boolean => {
  return commit.rawBody.match(getStoryRegEx(config)) instanceof Array;
});