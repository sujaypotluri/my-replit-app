import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyticsRouter from "./analytics";
import clientsRouter from "./clients";
import departmentsRouter from "./departments";
import usersRouter from "./users";
import licensesRouter from "./licenses";
import auditRouter from "./audit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(clientsRouter);
router.use(departmentsRouter);
router.use(usersRouter);
router.use(licensesRouter);
router.use(auditRouter);

export default router;
