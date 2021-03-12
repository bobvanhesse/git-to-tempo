declare module 'gitlog' {
  export interface Commit {
    committerDate: string;
    authorDate: string;
    rawBody: string;
  }

  export type GitLogFn = (
    options: object,
    callback: (
      error: Error,
      commits: Readonly<Commit>[]
    ) => void
  ) => Readonly<Commit>[];

  const gitlog: GitLogFn;
  
  export interface GitLogOptions {
    all: boolean;
    author: string;
    before: string;
    execOptions: GitLogExecOptions;
    fields: string[];
    nameStatus: boolean;
    number: number;
    repo: string;
    since: string;
  }

  interface GitLogExecOptions {
    maxBuffer: number;
  }

  export default gitlog;
}