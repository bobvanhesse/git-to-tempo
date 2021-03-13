import { parse } from 'date-fns';
import { Commit as GitLogCommit } from 'gitlog';
import { curryN, identity } from 'ramda';

import { GitToTempoConfig } from './config';
import { roundDateTo, UnaryOperator } from './helpers';
import { Story } from './story';

export type Commit = Pick<GitLogCommit, 'committerDate' | 'rawBody'>;

export const DATE_FORMAT_GIT_COMMITTERDATE: string = 'EEE MMM d HH:mm:ss y XX';

const createRound = (config: GitToTempoConfig): UnaryOperator<Date> => {
  return typeof config.roundTo === 'undefined'
    ? identity
    : roundDateTo(config.roundTo);
};

export const commitsToStories = curryN(2, (config: GitToTempoConfig, commits: Commit[]): Story[] => {
  const round = createRound(config);
  return commits
    .filter(isFormattedCommit(config))
    .reverse()
    .map((commit, commitIndex, commits) => {
      const storyRegEx = getStoryRegEx(config);
      return {
        comment: commit.rawBody.replace(storyRegEx, ''),
        originTaskId: (commit.rawBody.match(storyRegEx) as RegExpMatchArray)[1],
        period: {
          end: round(parse(commit.committerDate, DATE_FORMAT_GIT_COMMITTERDATE, new Date())),
          start: commitIndex > 0
            ? round(parse(commits[commitIndex - 1].committerDate, DATE_FORMAT_GIT_COMMITTERDATE, new Date()))
            : new Date(0)
        },
      };
    });
});

export const getStoryRegEx = (config: GitToTempoConfig): RegExp => {
  if(config.prefixes.length === 0) {
    throw new Error('Provide at least one prefix in the configuration.');
  }
  return new RegExp(`^\\s*((${config.prefixes.join('|')})-\\d+):?\\s+`);
};

export const isFormattedCommit = curryN(2, (config: GitToTempoConfig, commit: Pick<GitLogCommit, 'rawBody'>): boolean => {
  return commit.rawBody.match(getStoryRegEx(config)) instanceof Array;
});