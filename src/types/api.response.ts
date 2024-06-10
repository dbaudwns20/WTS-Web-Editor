export type PageInfo = {
  offset: number;
  currentPage: number;
  totalPage: number;
  totalCount: number;
};

export type OrderInfo = {
  sort: string;
  order: string;
};

export type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  pageInfo?: PageInfo;
};

export type FileResponse = {
  fileName: string;
  fileContent: string;
};

export class ErrorResponse extends Error {
  errorCode: string;
  arg?: any;

  constructor(errorCode: string, arg?: string) {
    super();
    this.errorCode = errorCode;
    this.arg = arg;
  }
}
