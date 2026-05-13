export class AppyPayError extends Error {
  public isAppyPayError = true;
  public code: string;
  public original: any;
  public httpStatusCode?: number | null;
  constructor(message: string, code: string, original?: any, httpStatusCode?: number | null) {
    super(message);
    this.name = "AppyPayError";
    this.code = code;
    this.original = original;
    this.httpStatusCode = httpStatusCode;
  }
}
