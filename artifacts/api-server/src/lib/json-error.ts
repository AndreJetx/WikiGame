import type { Response } from "express";
import { apiError } from "@workspace/agent-site";

export function sendApiError(
  res: Response,
  status: number,
  code: string,
  message: string,
  hint: string,
) {
  res.status(status).json(apiError(code, message, hint));
}
