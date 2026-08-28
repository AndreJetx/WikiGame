import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import searchRouter from "./search";
import statsRouter from "./stats";
import toolsRouter from "./tools";

const router: IRouter = Router();

router.use(healthRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(searchRouter);
router.use(statsRouter);
router.use(toolsRouter);

export default router;
