import { Router, type IRouter } from "express";
import healthRouter from "./health";
import licensesRouter from "./licenses";
import adminRouter from "./admin";
import adminExtrasRouter from "./admin-extras";
import downloadsRouter from "./downloads";
import settingsRouter from "./settings";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(licensesRouter);
router.use(adminRouter);
router.use(adminExtrasRouter);
router.use(downloadsRouter);
router.use(settingsRouter);
router.use(statsRouter);

export default router;
