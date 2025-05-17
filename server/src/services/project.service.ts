import { ProjectRepository } from "../repositories/project.repository";
import { logger } from "../config/logger";
import { ICreateProjectData, IProject } from "../models/project.model";
import { InternalServerError } from "../utils/error.handler";

export class ProjectService {
   private projectRepository : ProjectRepository;

   constructor(projectRepository : ProjectRepository){
    this.projectRepository = projectRepository
   };

   async generateProject(projectData : ICreateProjectData, userId : string) : Promise<IProject| null>{
        logger.info(`Attempting to create project : ${projectData.projectName}`); 

        const newProject = await this.projectRepository.createProject(projectData, userId);

        if(!newProject){
              throw new InternalServerError("Failed to create project");
        }

        logger.info(`new project created`);
        
        return newProject;
   }
}