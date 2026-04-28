import type { AxiosError } from "axios";

interface AppyPayErrorResponse {
  id?: string;
  responseStatus?: {
    successful: boolean;
    code: number;
    message: string;
    source?: string;
    sourceDetails?: Record<string, any>;
    attempt?: number;
    type?: string;
    reference?: string | null;
  };
  error?: string;
  error_description?: string;
}

interface AppyPayException {
  original?: AppyPayErrorResponse;
}

export function handleAppyPayException(err: unknown) {
  if (!err) return { success: false, message: "Unknown error" };

  // garante que err tem `original`
  const hasOriginal = (e: any): e is AppyPayException => e && typeof e === "object" && "original" in e;

  const data = hasOriginal(err) ? err.original : undefined;

  let message = "Unknown error";
  let code = 500;

  if (data) {
    if (data.responseStatus) {
      message = data.responseStatus.message || message;
      code = data.responseStatus.code || code;
    } else if (data.error && data.error_description) {
      message = `${data.error}: ${data.error_description}`;
    }
  }

  return {
    success: false,
    code,
    message,
    original: hasOriginal(err) ? err.original : err,
  };
}
