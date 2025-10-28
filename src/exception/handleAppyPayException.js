export function handleAppyPayException(err) {
    if (!err)
        return { success: false, message: "Unknown error" };
    const data = err.original;
    let message = "Unknown error";
    let code = 500;
    if (data) {
        if ("responseStatus" in data && data.responseStatus) {
            message = data.responseStatus.message || message;
            code = data.responseStatus.code || code;
        }
        else if ("error" in data && "error_description" in data) {
            message = `${data.error}: ${data.error_description}`;
        }
    }
    return {
        success: false,
        code,
        message,
        original: err.original,
    };
}
