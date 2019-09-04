import gitlog, { Commit } from 'gitlog';
import moment from 'moment';
import R from 'ramda';

import { commitToLog, GitLogOptions, Log } from "./lib/logs";
import { configToWeekLimits, GitToTempoConfig, WeekLimits } from './lib/config';
import { DATE_FORMAT_GIT, isFormattedCommit, leaveOutNextWeekCommitsExceptFirst } from './lib/commits';

const configToGitLogOptions = (config: GitToTempoConfig): GitLogOptions => {
  const weekLimits: WeekLimits = configToWeekLimits(config);
  return {
    all: true,
    author: config.git.author,
    before: weekLimits.end
      .add(1, 'week')
      .format(DATE_FORMAT_GIT),
    execOptions: {
      maxBuffer: 10 ** 3 * 2 ** 10,
    },
    fields: ['authorDate', 'rawBody'],
    nameStatus: false,
    repo: config.git.projectPath,
    since: weekLimits.start
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
        resolve(
          R.compose(
            R.map<Commit, Log>(commitToLog(config)),
            leaveOutNextWeekCommitsExceptFirst(config),
            R.filter<Commit, 'array'>(isFormattedCommit(config))
          )(commits)
        );
      }
    );
  });
};

export {gitToTempo as default, Log};