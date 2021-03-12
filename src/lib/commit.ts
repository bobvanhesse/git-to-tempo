import { Commit as GitLogCommit } from 'gitlog';
import { default as moment, Moment } from 'moment';
import { curryN, identity } from 'ramda';

import { GitToTempoConfig } from './config';
import { roundMomentTo } from './helpers';
import { Story } from './story';

export type Commit = Pick<GitLogCommit, 'committerDate' | 'rawBody'>;

export const DATE_FORMAT_GIT_COMMITTERDATE: string = 'ddd MMM D HH:mm:ss YYYY Z';

const createRound = (config: GitToTempoConfig): (x: Moment) => Moment => {
  return typeof config.roundTo === 'undefined'
    ? identity
    : roundMomentTo(config.roundTo);
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
          end: round(moment(commit.committerDate, DATE_FORMAT_GIT_COMMITTERDATE)),
          start: commitIndex > 0
            ? round(moment(commits[commitIndex - 1].committerDate, DATE_FORMAT_GIT_COMMITTERDATE))
            : moment(0, 'x')
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