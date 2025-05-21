import { Router } from "express";
import { CommitRepository } from "../repositories/commit.repository";
import { CommitService } from "../services/commit.service";
import { CommitController } from "../controllers/commit.controller";
import { ProjectRepository } from "../repositories/project.repository";
import { validateRequestBody} from "../middlewares/validate.middleware";
import { commitSchema } from "../schema/commit.schema";
import { authMiddleware } from "../middlewares/auth.middleware";

const commitRouter = Router();

const commitRepository = new CommitRepository();
const projectRepository = new ProjectRepository();
const commitService = new CommitService(commitRepository, projectRepository);
const commitController = new CommitController(commitService);

commitRouter.post("/commit-summary", authMiddleware, validateRequestBody(commitSchema), commitController.summarizeAndSaveCommits);

commitRouter.get("/commit-summary/:projectId", authMiddleware,  commitController.getSummarisedCommits);

export {commitRouter};