declare module 'gitlog' {
  export interface Commit {
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

  export default gitlog;
}