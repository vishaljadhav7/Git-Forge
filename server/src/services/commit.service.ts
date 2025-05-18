import { CommitRepository } from "../repositories/commit.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { 
  InternalServerError, 
  NotFoundError, 
  BadRequestError 
} from "../utils/error.utils";
import { getCommitSummaries } from "../utils/commitSummary.utils";
import { ICommitsWithSummary } from "../models/commit.model";
import { logger } from "../config/logger"; 

/**
 * Service responsible for commit-related business logic
 */
export class CommitService {
  private commitRepository: CommitRepository;
  private projectRepository: ProjectRepository;

 
  constructor(
    commitRepository: CommitRepository, 
    projectRepository: ProjectRepository
  ) {
    this.commitRepository = commitRepository;
    this.projectRepository = projectRepository;
  }


  async insertCommits(projectId: string): Promise<ICommitsWithSummary[]> {
    logger.info(`Processing commits for project: ${projectId}`);
    
    if (!projectId) {
      throw new BadRequestError("Project ID is required");
    }

    
    const existingProject = await this.projectRepository.findProjectById(projectId);
    
    if (!existingProject) {
      logger.error(`Project not found with ID: ${projectId}`);
      throw new NotFoundError("Could not find the project to save the commits");
    }

    if (!existingProject.githubUrl) {
      logger.error(`Project ${projectId} has no GitHub URL`);
      throw new BadRequestError("Project has no associated GitHub repository URL");
    }

    try {
      
      logger.info(`Fetching commit summaries for project ${projectId} from: ${existingProject.githubUrl}`);
      const commitsWithSummaries = await getCommitSummaries(existingProject.githubUrl);
      
      if (!commitsWithSummaries || commitsWithSummaries.length === 0) {
        logger.error(`No valid commits found for project ${projectId}`);
        throw new InternalServerError("Could not retrieve or summarize commits");
      }

      // Save the commits to the database
      logger.info(`Saving ${commitsWithSummaries.length} commits for project ${projectId}`);
      const savedCommits = await this.commitRepository.insertManyCommits(
        commitsWithSummaries, 
        projectId
      );
      
      if (!savedCommits || savedCommits.length === 0) {
        logger.error(`Failed to save commits for project ${projectId}`);
        throw new InternalServerError("Could not save commits to the database");
      }

      logger.info(`Successfully saved ${savedCommits.length} commits for project ${projectId}`);
      return savedCommits;
    } catch (error) {
      logger.error(`Error processing commits for project ${projectId}: ${error}`);
      
      // Re-throw specific errors
      if (error instanceof NotFoundError || 
          error instanceof BadRequestError || 
          error instanceof InternalServerError) {
        throw error;
      }
      
      // Convert generic errors to InternalServerError
      throw new InternalServerError(`Failed to process commits: ${(error as Error).message}`);
    }
  }
}