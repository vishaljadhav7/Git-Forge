import { CommitRepository } from "../repositories/commit.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { 
  InternalServerError, 
  NotFoundError, 
  BadRequestError 
} from "../utils/error.utils";
import { getCommitSummaries } from "../utils/commitSummary.utils";
import { ICommit , ICommitsWithSummary} from "../models/commit.model";
import { logger } from "../config/logger"; 
import { IProject } from "../models/project.model";

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
  
  async insertCommits(projectId: string, userId: string): Promise<ICommit[]> {
    const existingProject = await this.validateProject(projectId, userId);
    
    logger.info(`Processing commits for project: ${projectId}`);
    
    // Separate concerns: fetch/process vs save
    const commitsWithSummaries = await this.fetchAndProcessCommits(existingProject.githubUrl, projectId);
    return await this.saveCommits(commitsWithSummaries, projectId);
  }
  
  async findCommits(projectId: string, userId: string): Promise<ICommit[]> {
    await this.validateProject(projectId, userId);
    
    logger.info(`Fetching commits for project: ${projectId}`);
    const commits = await this.commitRepository.findCommits(projectId);
    
    if (!commits || commits.length === 0) {
      logger.error(`No commits found for project ${projectId}`);
      throw new NotFoundError("No commits found for this project");
    }
    
    return commits;
  }

  async pullLatestCommits(projectId: string, userId: string): Promise<ICommit[]> {
    if (!projectId) {
      throw new BadRequestError("Project ID is required");
    }

    const existingProject = await this.validateProject(projectId, userId);
    
    // Fetch and process new commits
    const latestCommits = await this.fetchAndProcessCommits(existingProject.githubUrl, projectId);

    // Delete existing commits
    await this.commitRepository.deleteCommits(projectId);
    
    // Save new commits
    return await this.saveCommits(latestCommits, projectId);
  }

  /**
   * Validates if project exists and user has access
   */
  private async validateProject(projectId: string, userId: string): Promise<IProject> {
    const project = await this.projectRepository.findProjectById(projectId, userId);
    
    if (!project) {
      logger.error(`Project not found with ID: ${projectId} for User with ID: ${userId}`);
      throw new NotFoundError("Could not find the project");
    }
    
    return project;
  }

  /**
   * Fetches commits from external API and processes them with summaries
   * This method is pure - it doesn't have side effects (no database operations)
   * @private
   */
  private async fetchAndProcessCommits(githubUrl: string, projectId: string): Promise<ICommitsWithSummary[]> {
    try {
      logger.info(`Fetching commit summaries for project ${projectId} from: ${githubUrl}`);
      
      const commitsWithSummaries = await getCommitSummaries(githubUrl);
      
      if (!commitsWithSummaries || commitsWithSummaries.length === 0) {
        logger.error(`No valid commits found for project ${projectId}`);
        throw new InternalServerError("Could not retrieve or summarize commits");
      }
      
      logger.info(`Successfully processed ${commitsWithSummaries.length} commits for project ${projectId}`);
      return commitsWithSummaries;
      
    } catch (error) {
      // Re-throw known errors
      if (error instanceof NotFoundError ||
          error instanceof BadRequestError ||
          error instanceof InternalServerError) {
        throw error;
      }
      
      // Wrap unknown errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to fetch/process commits for project ${projectId}: ${errorMessage}`);
      throw new InternalServerError(`Failed to process commits: ${errorMessage}`);
    }
  }

  /**
   * Saves processed commits to database
   * @private
   */
  private async saveCommits(commits: ICommitsWithSummary[], projectId: string): Promise<ICommit[]> {
    try {
      logger.info(`Saving ${commits.length} commits for project ${projectId}`);
      
      const savedCommits = await this.commitRepository.insertManyCommits(commits, projectId);
      
      if (!savedCommits || savedCommits.length === 0) {
        logger.error(`Failed to save commits for project ${projectId}`);
        throw new InternalServerError("Could not save commits to the database");
      }
      
      logger.info(`Successfully saved ${savedCommits.length} commits for project ${projectId}`);
      return savedCommits;
      
    } catch (error) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Service layer error saving commits for project ${projectId}: ${errorMessage}`);
      throw new InternalServerError(`Failed to save commits: ${errorMessage}`);
    }
  }

  // fetch commits only
  async getCommitSummariesOnly(githubUrl: string, projectId: string): Promise<ICommitsWithSummary[]> {
    return await this.fetchAndProcessCommits(githubUrl, projectId);
  }
}