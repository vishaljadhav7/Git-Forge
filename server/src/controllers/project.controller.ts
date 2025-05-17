import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';
import { projectSchema } from '../schema/project.schema';
import { ProjectService } from '../services/project.service';
import { Request, Response, NextFunction } from 'express';

export class ProjectController{
   private projectService : ProjectService

   constructor(projectService : ProjectService) { 
    this.projectService = projectService;
   }

   generateNewProject = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
     try {
        const projectData = req.body as projectSchema;
        logger.info('Peoject creation request received' + projectData.projectName);
        const newProject = await this.projectService.generateProject(projectData, req.user?.userId as string);
        
        res
        .status(StatusCodes.CREATED)
        .json( 
            {message : "new project created successfully", data : newProject, success: true}
        )  
     } catch (error) {
        next(error)
     }
   }
} 