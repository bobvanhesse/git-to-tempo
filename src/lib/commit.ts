import { Commit as GitLogCommit } from 'gitlog';
import { default as moment } from 'moment';
import { curryN } from 'ramda';

import { GitToTempoConfig } from './config';
import { Story } from './story';

export type Commit = Pick<GitLogCommit, 'committerDate' | 'rawBody'>;

export const DATE_FORMAT_GIT_COMMITTERDATE: string = 'ddd MMM D HH:mm:ss YYYY Z';

export const commitsToStories = curryN(2, (config: GitToTempoConfig, commits: Commit[]): Story[] => {
  return commits
    .filter(isFormattedCommit(config))
    .reverse()
    .map((commit, commitIndex, commits) => {
      const storyRegEx = getStoryRegEx(config);
      return {
        comment: commit.rawBody.replace(storyRegEx, ''),
        originTaskId: (commit.rawBody.match(storyRegEx) as RegExpMatchArray)[1],
        period: {
          end: moment(commit.committerDate, DATE_FORMAT_GIT_COMMITTERDATE),
          start: commitIndex > 0
            ? moment(commits[commitIndex - 1].committerDate, DATE_FORMAT_GIT_COMMITTERDATE)
            : moment(0, 'x')
        },
      };
    });
})

export const getStoryRegEx = (config: GitToTempoConfig): RegExp => {
  return new RegExp(`^\\s*(${config.prefix}-\\d+):?\\s+`);
};

export const isFormattedCommit = curryN(2, (config: GitToTempoConfig, commit: Pick<GitLogCommit, 'rawBody'>): boolean => {
  return commit.rawBody.match(getStoryRegEx(config)) instanceof Array;
});