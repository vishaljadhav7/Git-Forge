import { RepoService } from "../services/repo.service";
import { Request, Response, NextFunction } from "express";
import { commitSchemaType } from "../schema/commit.schema";
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

      const projectData = req.body as commitSchemaType;

      if (!projectData?.projectId?.trim()) {
        logger.error("Invalid project ID provided");
        throw new BadRequestError("Valid project ID is required");
      }

      logger.info(`Starting repo load process for project: ${projectData.projectId}`);

      const result = await this.repoService.loadGitRepo(projectData.projectId);

      logger.info(`Repo load completed successfully for project: ${projectData.projectId}`);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: result,
        message: "Repository loaded and processed successfully",
        processedCount: result.length
      } as LoadRepoResponse);
    } catch (error) {
      logger.error("Error in loadRepoToQuery");
      next(error);
    }
  };
}
