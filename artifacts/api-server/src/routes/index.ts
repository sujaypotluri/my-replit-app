import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyticsRouter from "./analytics";
import clientsRouter from "./clients";
import departmentsRouter from "./departments";
import usersRouter from "./users";
import licensesRouter from "./licenses";
import auditRouter from "./audit";
import aiRouter from "./ai";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(clientsRouter);
router.use(departmentsRouter);
router.use(usersRouter);
router.use(licensesRouter);
router.use(auditRouter);
router.use(aiRouter);
router.use(portalRouter);

export default router;
