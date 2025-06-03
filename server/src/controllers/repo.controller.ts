import { RepoService } from "../services/repo.service";
import { Request, Response, NextFunction } from "express";
import {
  loadRepoSchemaType,
  createQuestionSchemaType,
} from "../schema/repo.schema";
import { UnauthorizedError } from "../utils/error.utils";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger";
import { BadRequestError } from "../utils/error.utils";
import { queryParamsSchemaType } from "../schema/repo.schema";

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
        throw new BadRequestError(
          "Valid project ID or branch name is required"
        );
      }

      logger.info(
        `Starting repo load process for project: ${projectData.projectId}`
      );

      await this.repoService.loadGitRepo(
        projectData.projectId,
        projectData?.branchName,
        req.user.userId
      );

      logger.info(
        `Repo load completed successfully for project: ${projectData.projectId}`
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Repository loaded and processed successfully",
      });
    } catch (error) {
      logger.error("Error in loadRepoToQuery");
      next(error);
    }
  };

  saveQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError("User not authenticated");
      }
      logger.info(`processing the request to save the question!`);
      const question = req.body as createQuestionSchemaType;

      await this.repoService.saveQuestion(question, req.user.userId);

      logger.info(`done saving the question!`);

      res.status(StatusCodes.CREATED).json({
        message: "Succesfully saved question!",
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  queryQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { question, projectId } = req.query as queryParamsSchemaType;

      if (!question || !projectId) {
        throw new BadRequestError("Missing question or projectId");
      }

      const result = await this.repoService.queryRepositoryByQuestion(
        question,
        projectId
      );

      res.status(200).json({
        message: "query response generated successfully!",
        data: result,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  getQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId
      if(!userId){
        throw new BadRequestError("project or user ID required")
      } 

      const questions = await this.repoService.getQuestions( userId);

      res.status(StatusCodes.OK).json({
        message : "All questions retrieved successfully",
        data : questions,
        success : true
      })
    } catch (error) {
      next(error)
    }
  }
}
