import { prisma } from "../utils/client.utils";
import { ICommit, ICommitsWithSummary } from "../models/commit.model";
import { logger } from "../config/logger";
import { InternalServerError, BadRequestError } from "../utils/error.utils";

export class CommitRepository {
  async insertManyCommits(commits: ICommitsWithSummary[], projectId: string): Promise<ICommit[]> {
    try {
      if(!projectId){
        throw new BadRequestError("Project ID required!")
      } 

      logger.info(`Inserting ${commits.length} commits for project: ${projectId}`);
      
      await prisma.commit.createMany({
        data: commits.map((commit) => ({  
          ...commit,
          projectId
        }))
      });
      
      return await prisma.commit.findMany({
        where: {
          projectId,
          commitHash: {
            in: commits.map(commit => commit.commitHash)
          }
        }
      });
    } catch (error) {
      if(error instanceof BadRequestError){
        throw error;
      }

      logger.error(`Error inserting commits: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to insert commits: ${(error as Error).message}`);
    }
  }
  
  async findCommits(projectId: string): Promise<ICommit[]> {
    try {
      return await prisma.commit.findMany({
        where: {
          projectId
        }
      });
    } catch (error) {
      logger.error(`Error finding commits: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to find commits: ${(error as Error).message}`);
    }
  }

  async deleteCommits(projectId: string){
    try {
      if(!projectId){
        throw new BadRequestError("Project ID required!")
      } 

      await prisma.commit.deleteMany({
        where : {
          projectId : projectId
        }
      })
      
      return;
    } catch (error) {
      if(error instanceof BadRequestError){
        throw error;
      }

      logger.error(`Error inserting commits: ${(error as Error).message}`);
      throw new InternalServerError(`Failed to delete commits: ${(error as Error).message}`);
    }
  }
}