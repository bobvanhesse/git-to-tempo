import gitlog, { Commit } from 'gitlog';
import moment from 'moment';
import R from 'ramda';

import { GitLogOptions, Log, storiesToLogs } from "./lib/logs";
import { getWeek, GitToTempoConfig, WorkingDay } from './lib/config';
import { commitsToStories, DATE_FORMAT_GIT } from './lib/commits';
import { Story } from './lib/story';

const configToGitLogOptions = (config: GitToTempoConfig): GitLogOptions => {
  const week: WorkingDay[] = getWeek(config);
  return {
    all: true,
    author: config.git.author,
    before: R.last(week).end
      .add(1, 'week')
      .format(DATE_FORMAT_GIT),
    execOptions: {
      maxBuffer: 10 ** 3 * 2 ** 10,
    },
    fields: ['authorDate', 'rawBody'],
    nameStatus: false,
    number: 10 ** 3,
    repo: config.git.projectPath,
    since: R.head(week).start
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
        resolve(R.compose<
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

export {gitToTempo as default, Log};

(async () => {
  try {
    console.log(await gitToTempo({
      git: {
        author: 'Bob van Hesse',
        projectPath: '/Users/Bob/projects/governance',
      },
      locale: 'nl',
      prefix: 'GOV',
      reportingPeriod: {
        week: 33,
        year: 2019,
      },
      tempo: {
        attributes: {
          _Account_: {
            workAttributeId: 2,
            value: '2GEARSNONB',
          },
        },
        workerId: '5d14cdd1f46aa30c271c9a75',
      },
      workingHours: {
        '1': {
          start: '09:00',
          end: '17:00',
        },
        '2': {
          start: '09:00',
          end: '17:00',
        },
        '3': {
          start: '09:00',
          end: '13:00',
        },
      },
    }));
  } catch(error) {
    console.error(error.message);
  }
})();