import { Router } from 'express';
import { validateQueryParams, validateRequestBody } from '../middlewares/validate.middleware';
import { createProjectSchema} from '../schema/project.schema';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from '../services/project.service';
import { ProjectController } from '../controllers/project.controller';

const projectRouter = Router();


const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new  ProjectController(projectService)

projectRouter.post("/project", validateRequestBody(createProjectSchema), authMiddleware, projectController.generateNewProject);

projectRouter.get("/project" ,authMiddleware, projectController.retrieveAllSavedProjects)


export {projectRouter};