import { prisma } from "../utils/client.utils";
import { ICommit, ICommitsWithSummary } from "../models/commit.model";
import { logger } from "../config/logger";
import { InternalServerError } from "../utils/error.utils";

export class CommitRepository {
 async insertManyCommits(commits: ICommitsWithSummary[], projectId: string): Promise<ICommit[]> {
    try {
      logger.info(`Inserting ${commits.length} commits for project: ${projectId}`);
      
      if (!commits || commits.length === 0) {
        throw new Error("No commits provided for insertion");
      }
      
      if (!projectId) {
        throw new Error("Project ID is required");
      }

     
      await prisma.commit.createMany({
        data: commits.map((commit) => ({
          ...commit,
          projectId
        }))
      });

   
      const createdCommits = await prisma.commit.findMany({
        where: {
          projectId,
          commitHash: {
            in: commits.map(commit => commit.commitHash)
          }
        }
      });

      logger.info(`Successfully inserted ${createdCommits.length} commits for project: ${projectId}`);
      return createdCommits;
    } catch (error) {
      logger.error(`Error inserting commits for project ${projectId}: ${error}`);
      throw new InternalServerError(`Failed to save commits: ${(error as Error).message}`);
    }
  }
}