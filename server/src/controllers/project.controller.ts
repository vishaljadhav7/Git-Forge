import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';
import { createProjectSchema } from '../schema/project.schema';
import { ProjectService } from '../services/project.service';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/error.utils';

export class ProjectController{
   private projectService : ProjectService

   constructor(projectService : ProjectService) { 
    this.projectService = projectService;
   }

   generateNewProject = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
     try {
        const projectData = req.body as createProjectSchema;
        logger.info('Project creation request received' + projectData.projectName);
        const newProject = await this.projectService.generateProject(projectData, req.user?.userId as string);
        
        res
        .status(StatusCodes.CREATED)
        .json( 
            {message : "new project created successfully", newProject, success: true}
        )  
     } catch (error) {
        next(error)
     }
   }

   retrieveAllSavedProjects = async (req: Request, res: Response, next: NextFunction) : Promise<void> =>{
      try {
         const projectData = req.user;
         
         if(!req.user?.userId){
            throw new BadRequestError("unauthorized route")
         }

         logger.info('Project retrieval request received for userId ' + projectData?.userId);

        const allProjects = await this.projectService.retrieveProjects(projectData?.userId as string);
        
        res
        .status(StatusCodes.OK)
        .json( 
            {message : "new project created successfully", allProjects , success: true}
        )  
        
      } catch (error) {
           next(error)
      }
   }
} 