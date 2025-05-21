import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';
import { createProjectSchema } from '../schema/project.schema';
import { ProjectService } from '../services/project.service';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError } from '../utils/error.utils';

export class ProjectController {
  private projectService: ProjectService;
  
  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  generateNewProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify user authentication
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }
      
      const projectData = req.body as createProjectSchema;
      logger.info(`Project creation request received for: ${projectData.projectName}`);
      
      const newProject = await this.projectService.generateProject(projectData, req.user.userId);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "New project created successfully",
        data: newProject
      });
    } catch (error) {
      next(error);
    }
  };

  retrieveAllSavedProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verify user authentication
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }
      
      logger.info(`Project retrieval request received for user: ${req.user.userId}`);
      
      const allProjects = await this.projectService.retrieveProjects(req.user.userId);
      
   

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Projects retrieved successfully",
        data: allProjects
      });
    } catch (error) {
      next(error);
    }
  };
}