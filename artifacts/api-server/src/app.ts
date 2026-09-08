import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getCookieSecret } from "./lib/admin-auth";
import { sendApiError } from "./lib/json-error";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser(getCookieSecret()));
// Default 5mb; override with JSON_BODY_LIMIT (e.g. "10mb") if articles grow larger.
const jsonBodyLimit = process.env.JSON_BODY_LIMIT?.trim() || "5mb";
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonBodyLimit }));

app.use("/api", router);

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const err = error as {
    name?: string;
    type?: string;
    status?: number;
    statusCode?: number;
  };
  if (
    err?.name === "PayloadTooLargeError" ||
    err?.type === "entity.too.large" ||
    err?.status === 413 ||
    err?.statusCode === 413
  ) {
    sendApiError(
      res,
      413,
      "PAYLOAD_TOO_LARGE",
      "Request body is too large",
      `Max body size is ${jsonBodyLimit}. Raise JSON_BODY_LIMIT or keep images as remote URLs`,
    );
    return;
  }

  logger.error({ err: error }, "Unhandled API error");
  sendApiError(
    res,
    500,
    "INTERNAL_ERROR",
    "Unexpected server error",
    "Retry the request or see /docs and /openapi.json",
  );
});

export default app;
