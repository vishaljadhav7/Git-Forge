import { prisma } from "../utils/client.utils";
import { ICreateProjectData , IProject} from "../models/project.model";
import { logger } from "../config/logger";
import { InternalServerError } from "../utils/error.utils";

export class ProjectRepository {
  async createProject(projectData: ICreateProjectData, userId: string): Promise<IProject> {
    try {
      logger.info(`Creating project: ${projectData.projectName} for user: ${userId}`);
      
      return await prisma.project.create({
        data: {
          projectName: projectData.projectName,
          githubUrl: projectData.githubUrl,
          collaborators: {
            create: {
              userId: userId,
            }
          },
          ownerId: userId
        },
      });
    } catch (error) {
      logger.error(`Failed to create project: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to create project: ${(error as Error).message}`);
    }
  }

  async findProjectById(projectId: string): Promise<IProject | null> {
    try {
      logger.info(`Finding project by ID: ${projectId}`);
      
      return await prisma.project.findUnique({
        where: {
          id: projectId
        }
      });
    } catch (error) {
      logger.error(`Failed to find project by ID: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to find project: ${(error as Error).message}`);
    }
  }

  async findProjectsByUserId(userId: string): Promise<IProject[]> {
    try {
      logger.info(`Finding projects for user: ${userId}`);
      
      return await prisma.project.findMany({
        where: {
          ownerId: userId
        }
      });
    } catch (error) {
      logger.error(`Failed to find projects for user: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to find projects: ${(error as Error).message}`);
    }
  }
}