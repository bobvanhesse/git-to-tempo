import gitlog, { Commit, GitLogOptions } from 'gitlog';
import { default as moment } from 'moment';
import { compose, head, last } from 'ramda';

import { Log, storiesToLogs } from './lib/log';
import { getWeek, GitToTempoConfig, WorkingDay } from './lib/config';
import { commitsToStories, DATE_FORMAT_GIT } from './lib/commit';
import { Story } from './lib/story';

const configToGitLogOptions = (config: GitToTempoConfig): GitLogOptions => {
  const week: WorkingDay[] = getWeek(config);
  return {
    all: true,
    author: config.git.author,
    before: (last(week) as WorkingDay).end
      .add(1, 'week')
      .format(DATE_FORMAT_GIT),
    execOptions: {
      maxBuffer: 10 ** 3 * 2 ** 10,
    },
    fields: ['authorDate', 'rawBody'],
    nameStatus: false,
    number: 10 ** 3,
    repo: config.git.projectPath,
    since: (head(week) as WorkingDay).start
      .format(DATE_FORMAT_GIT),
  };
};

export const gitToTempo = async (config: Readonly<GitToTempoConfig>): Promise<Log[]> => {
  if(config.locale) {
    await import(`moment/locale/${config.locale}`);
    moment.locale(config.locale);
  }
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