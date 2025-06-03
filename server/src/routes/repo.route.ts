import { Router } from "express";
import {
  validateQueryParams,
  validateRequestBody,
} from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RepoService } from "../services/repo.service";
import { RepoController } from "../controllers/repo.controller";
import { ProjectRepository } from "../repositories/project.repository";
import { RepoRepository } from "../repositories/repo.repository";
import { loadRepoSchema, createQuestionSchema } from "../schema/repo.schema";
import { queryParamsSchema } from "../schema/repo.schema";


const repoRouter = Router();

const repoRepository = new RepoRepository();
const projectRepository = new ProjectRepository();
const repoService = new RepoService(projectRepository, repoRepository);
const repoController = new RepoController(repoService);

repoRouter.post(
  "/load",
  authMiddleware,
  validateRequestBody(loadRepoSchema),
  repoController.loadRepoToQuery
);

repoRouter.get(
  "/query",
  authMiddleware,
  validateQueryParams(queryParamsSchema),
repoController.queryQuestion
);


repoRouter.post(
  "/query-save", 
  authMiddleware, 
  validateRequestBody(createQuestionSchema), 
  repoController.saveQuestion
);


repoRouter.get(
  "/questions",
  authMiddleware,
  repoController.getQuestions
)

export { repoRouter };