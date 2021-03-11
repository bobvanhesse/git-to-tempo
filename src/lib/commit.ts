import { Commit } from 'gitlog';
import { default as moment } from 'moment';
import { curryN } from 'ramda';

import { GitToTempoConfig } from './config';
import { Story } from './story';

export const DATE_FORMAT_GIT: Readonly<string> = 'YYYY-MM-DD HH:mm:ss ZZ';

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
          end: moment(commit.authorDate, DATE_FORMAT_GIT),
          start: commitIndex > 0
            ? moment(commits[commitIndex - 1].authorDate, DATE_FORMAT_GIT)
            : moment(0, 'x')
        },
      };
    });
})

export const getStoryRegEx = (config: GitToTempoConfig): RegExp => {
  if(config.prefixes.length === 0) {
    throw new Error('Provide at least one prefix in the configuration.');
  }
  return new RegExp(`^\\s*((${config.prefixes.join('|')})-\\d+):?\\s+`);
};

export const isFormattedCommit = curryN(2, (config: GitToTempoConfig, commit: Commit): boolean => {
  return commit.rawBody.match(getStoryRegEx(config)) instanceof Array;
});