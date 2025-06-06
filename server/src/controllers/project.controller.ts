import { logger } from "../config/logger";
import { StatusCodes } from "http-status-codes";
import { createProjectSchema } from "../schema/project.schema";
import { ProjectService } from "../services/project.service";
import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../utils/error.utils";
import axios from "axios";

export class ProjectController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  generateNewProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Verify user authentication
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const projectData = req.body as createProjectSchema;
      logger.info(
        `Project creation request received for: ${projectData.projectName}`
      );

       await this.validateGithubUrl(projectData.githubUrl);

      const newProject = await this.projectService.generateProject(
        projectData,
        req.user.userId
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "New project created successfully",
        data: newProject,
      });
    } catch (error) {
      next(error);
    }
  };


validateGithubUrl = async (githubUrl: string): Promise<void> => {
  try {
    const [owner, repo] = githubUrl.split("/").slice(-2);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
     await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'YourApp/1.0',
        'Authorization': `token ${process.env.GITHUB_TOKEN!}`
      },
    });
    
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new BadRequestError("GitHub repository not found!");
      }
      if (error.response?.status === 403) {
        throw new BadRequestError("GitHub repository access denied!");
      }
    }

    throw new InternalServerError("Could not connect with GitHub repository!");
  }
};

  retrieveAllSavedProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Verify user authentication
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      logger.info(
        `Project retrieval request received for user: ${req.user.userId}`
      );

      const allProjects = await this.projectService.retrieveProjects(
        req.user.userId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Projects retrieved successfully",
        data: allProjects,
      });
    } catch (error) {
      next(error);
    }
  };


}
