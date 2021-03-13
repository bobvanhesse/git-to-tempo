import { add, format, Interval } from 'date-fns';
import gitlog, { GitLogOptions } from 'gitlog';
import { compose, head, last } from 'ramda';

import { Log, storiesToLogs } from './lib/log';
import { getWorkingDays, GitToTempoConfig } from './lib/config';
import { Commit, commitsToStories } from './lib/commit';
import { Story } from './lib/story';

export const DATE_FORMAT_GIT = 'yyyy-MM-dd';

const configToGitLogOptions = (config: GitToTempoConfig): GitLogOptions => {
  const workingDays: Interval[] = getWorkingDays(config);
  return {
    all: true,
    author: config.git.author,
    before: format(
      add((last(workingDays) as Interval).end, {weeks: 1}),
      DATE_FORMAT_GIT
    ),
    execOptions: {
      maxBuffer: 10 ** 3 * 2 ** 10,
    },
    fields: ['committerDate', 'rawBody'],
    nameStatus: false,
    number: 10 ** 3,
    repo: config.git.projectPath,
    since: format(
      (head(workingDays) as Interval).start,
      DATE_FORMAT_GIT
    ),
  };
};

export const gitToTempo = async (config: Readonly<GitToTempoConfig>): Promise<Log[]> => {
  return new Promise((resolve, reject) => {
    gitlog(
      configToGitLogOptions(config),
      (error, commits) => {
        if(error) {
          reject(error);
          return;
        }
        resolve(compose<
          Commit[],
          Story[],
          Log[]
        >(
          storiesToLogs(config),
          commitsToStories(config)
        )(commits));
      }
    );
  });
};

export { Log };

export default gitToTempo;