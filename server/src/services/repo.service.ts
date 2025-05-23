import { ProjectRepository } from "../repositories/project.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/error.utils";
import { logger } from "../config/logger";
import { repoSummaryAndEmbeddings } from "../utils/loadRepo.utils";
import { RepoRepository } from "../repositories/repo.repository";

export class RepoService {
  private projectRepository: ProjectRepository;
  private repoRepository: RepoRepository;

  constructor(projectRepository: ProjectRepository, repoRepository: RepoRepository) {
    this.projectRepository = projectRepository;
    this.repoRepository = repoRepository;
  }

  async loadGitRepo(projectId: string) {
    if (!projectId?.trim()) {
      throw new BadRequestError("Project ID is required");
    }

    const existingProject = await this.projectRepository.findProjectById(projectId);

    if (!existingProject) {
      logger.error(`Project not found with ID: ${projectId}`);
      throw new NotFoundError("Project not found");
    }

    if (!existingProject.githubUrl?.trim()) {
      logger.error(`Project ${projectId} has no GitHub URL`);
      throw new BadRequestError("Project has no associated GitHub repository URL");
    }

    try {
      logger.info(`Loading GitHub repo for URL: ${existingProject.githubUrl}`);
      const repoData = await repoSummaryAndEmbeddings(existingProject.githubUrl);

      const savedResults = await this.repoRepository.addFileswithSummaryAndEmbeddingsTransaction(
        repoData, 
        existingProject.id
      );

      logger.info(`Successfully processed ${savedResults.length} files for project ${projectId}`);
      return savedResults;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to load GitHub repo for project ${projectId}: ${errorMessage}`);
      throw new InternalServerError("Failed to load and process repository");
    }
  }
}