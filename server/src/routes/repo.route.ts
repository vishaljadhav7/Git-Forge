import { Router } from "express";
import { commitSchema } from "../schema/commit.schema";
import { validateRequestBody } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RepoService } from "../services/repo.service";
import { RepoController } from "../controllers/repo.controller";
import { ProjectRepository } from "../repositories/project.repository";
import { RepoRepository } from "../repositories/repo.repository";

const repoRouter = Router();

const repoRepository = new RepoRepository()
const projectRepository = new ProjectRepository()
const repoService = new RepoService(projectRepository, repoRepository);
const repoController = new RepoController(repoService);

repoRouter.post("/load-repo", authMiddleware, validateRequestBody(commitSchema), repoController.loadRepoToQuery)

export {repoRouter};