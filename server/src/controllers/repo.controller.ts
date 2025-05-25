import { RepoService } from "../services/repo.service";
import { Request, Response, NextFunction } from "express";
import { loadRepoSchemaType } from "../schema/repo.schema";
import { UnauthorizedError } from "../utils/error.utils";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger";
import { BadRequestError } from "../utils/error.utils";


export interface ProcessedFile {
  id: string;
  fileName: string;
  sourceCode: string;
  summary: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadRepoRequest {
  projectId: string;
}

export interface LoadRepoResponse {
  success: boolean;
  data: ProcessedFile[];
  message: string;
  processedCount: number;
}

export class RepoController {
  private repoService: RepoService;

  constructor(repoService: RepoService) {
    this.repoService = repoService;
  }

  loadRepoToQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const projectData = req.body as loadRepoSchemaType;

      if (!projectData?.projectId?.trim() || !projectData?.branchName.trim()) {
        logger.error("Invalid project ID or branch name provided");
        throw new BadRequestError("Valid project ID or branch name is required");
      }

      logger.info(`Starting repo load process for project: ${projectData.projectId}`);

       await this.repoService.loadGitRepo(projectData.projectId, projectData?.branchName);

      logger.info(`Repo load completed successfully for project: ${projectData.projectId}`);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Repository loaded and processed successfully",
      });
    } catch (error) {
      logger.error("Error in loadRepoToQuery");
      next(error);
    }
  };
}
