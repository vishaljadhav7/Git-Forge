import { ProjectRepository } from "../repositories/project.repository";
import { logger } from "../config/logger";
import { ICreateProjectData, IProject } from "../models/project.model";
import { InternalServerError , BadRequestError} from "../utils/error.utils";

export class ProjectService {
   private projectRepository : ProjectRepository;

   constructor(projectRepository : ProjectRepository){
    this.projectRepository = projectRepository
   };

   async generateProject(projectData : ICreateProjectData, userId : string) : Promise<IProject| null>{
     
        if (!projectData || !userId) {
        throw new BadRequestError("Project data and user ID are required");
        }

        logger.info(`Attempting to create project : ${projectData.projectName}`); 

        const newProject = await this.projectRepository.createProject(projectData, userId);

        if(!newProject){
              throw new InternalServerError("Failed to create project");
        }

        logger.info(`new project created`);
        
        return newProject;
   }

   async retrieveProjects(userId : string){
        if (!userId) {
         throw new BadRequestError("User ID is required");
        }
        logger.info(`Attempting to retrieve projects for userId : ${userId}`); 

        const allProjects = await this.projectRepository.findProjectsByUserId(userId);

        if(!allProjects){
             throw new InternalServerError("Failed to fetch project");
        }

        logger.info(`all projects retrieved`);

        return allProjects;
   }
}

