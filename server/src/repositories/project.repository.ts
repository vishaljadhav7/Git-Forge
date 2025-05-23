import { prisma } from "../utils/client.utils";
import { ICreateProjectData, IProject } from "../models/project.model";
import { logger } from "../config/logger";
import { InternalServerError } from "../utils/error.utils";

export class ProjectRepository {
  async createProject(projectData: ICreateProjectData, userId: string): Promise<IProject> {
    if (!projectData?.projectName?.trim() || !userId?.trim()) {
      throw new Error("Project name and user ID are required");
    }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to create project: ${errorMessage}`);
      throw new InternalServerError(`Failed to create project: ${errorMessage}`);
    }
  }

  async findProjectById(projectId: string): Promise<IProject | null> {
    if (!projectId?.trim()) {
      throw new Error("Project ID is required");
    }

    try {
      logger.info(`Finding project by ID: ${projectId}`);
      
      return await prisma.project.findUnique({
        where: {
          id: projectId
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to find project by ID: ${errorMessage}`);
      throw new InternalServerError(`Failed to find project: ${errorMessage}`);
    }
  }

  async findProjectsByUserId(userId: string): Promise<IProject[]> {
    if (!userId?.trim()) {
      throw new Error("User ID is required");
    }

    try {
      logger.info(`Finding projects for user: ${userId}`);
      
      return await prisma.project.findMany({
        where: {
          ownerId: userId
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to find projects for user: ${errorMessage}`);
      throw new InternalServerError(`Failed to find projects: ${errorMessage}`);
    }
  }
}