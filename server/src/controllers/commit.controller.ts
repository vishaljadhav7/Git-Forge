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
      
      // Validate request body
      const commitData = req.body as commitSchemaType;
      const { projectId } = commitData;
      
      if (!projectId) {
        throw new BadRequestError('Project ID is required');
      }

      // Process the request through the service layer
      const savedAndSummarisedCommits = await this.commitService.insertCommits(projectId);
      
      logger.info(`Successfully processed ${savedAndSummarisedCommits.length} commits for project ${projectId}`);
      
     
      res.status(StatusCodes.CREATED).json({
        data: savedAndSummarisedCommits,
        message: "Commits successfully processed and summarized"
      });
    } catch (error) {
      logger.error('Error in summarizeAndSaveCommits: error');
      next(error);
    }
  };
}