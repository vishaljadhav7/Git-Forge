import { Router } from 'express';
import { validateRequestBody } from '../middlewares/validate.middleware';
import { projectSchema } from '../schema/project.schema';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectService } from '../services/project.service';
import { ProjectController } from '../controllers/project.controller';

const projectRouter = Router();


const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new  ProjectController(projectService)

projectRouter.post("/project", validateRequestBody(projectSchema), authMiddleware, projectController.generateNewProject);


export {projectRouter};