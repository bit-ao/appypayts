export class AppyPayError extends Error {
    isAppyPayError = true;
    code;
    original;
    constructor(message, code, original) {
        super(message);
        this.name = "AppyPayError";
        this.code = code;
        this.original = original;
    }
}
