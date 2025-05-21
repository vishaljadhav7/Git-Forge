import { Request, Response, NextFunction } from 'express';
import { commitSchemaType } from '../schema/commit.schema';
import { StatusCodes } from 'http-status-codes';
import { CommitService } from '../services/commit.service';
import { logger } from '../config/logger';
import { BadRequestError } from '../utils/error.utils';


export class CommitController {
  private commitService: CommitService;
  
  constructor(commitService: CommitService) {
    this.commitService = commitService;
  }
  
  summarizeAndSaveCommits = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('Processing request to summarize and save commits');
      
      const { projectId } = req.body as commitSchemaType;
      
      if (!projectId) {
        throw new BadRequestError('Project ID is required');
      }
      
      const savedAndSummarisedCommits = await this.commitService.insertCommits(projectId);
      
      logger.info(`Successfully processed ${savedAndSummarisedCommits.length} commits for project ${projectId}`);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: savedAndSummarisedCommits,
        message: "Commits successfully processed and summarized"
      });
    } catch (error) {
      next(error); 
    }
  };
  
  getSummarisedCommits = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        throw new BadRequestError('Project ID is required');
      }
      
      const allCommits = await this.commitService.findCommits(projectId as string);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: allCommits,
        message: "Commits successfully retrieved"
      });
    } catch (error) {
      next(error); 
    }
  };
}
