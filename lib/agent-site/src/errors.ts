export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    hint: string;
  };
};

export function apiError(code: string, message: string, hint: string): ApiErrorBody {
  return { error: { code, message, hint } };
}
