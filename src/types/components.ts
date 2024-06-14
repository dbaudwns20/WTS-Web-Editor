export type Required = {
  isRequired: boolean;
  invalidMessage: string;
};

export type Pattern = {
  regExp: RegExp | null;
  invalidMessage: string;
};
