export class AppyPayError extends Error {
  public isAppyPayError = true;
  public code: string;
  public original: any;
  constructor(message: string, code: string, original?: any) {
    super(message);
    this.name = "AppyPayError";
    this.code = code;
    this.original = original;
  }
}
