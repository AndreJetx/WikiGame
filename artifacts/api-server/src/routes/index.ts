import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import searchRouter from "./search";
import statsRouter from "./stats";
import toolsRouter from "./tools";
import adminRouter from "./admin";
import agentRouter from "./agent";
import mcpRouter from "./mcp";
import { sendApiError } from "../lib/json-error";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(searchRouter);
router.use(statsRouter);
router.use(toolsRouter);
router.use(agentRouter);
router.use(mcpRouter);

router.use((req, res) => {
  sendApiError(
    res,
    404,
    "NOT_FOUND",
    `No API route for ${req.method} ${req.path}`,
    "List operations in /openapi.json or read /docs",
  );
});

export default router;
