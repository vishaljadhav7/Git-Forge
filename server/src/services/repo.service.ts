import { ProjectRepository } from "../repositories/project.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/error.utils";
import { logger } from "../config/logger";
import { repoSummaryAndEmbeddings } from "../utils/loadRepo.utils";
import { RepoRepository } from "../repositories/repo.repository";
import { Question } from "../types";
import { IProject } from "../models/project.model";
import { promptForQueryOnRepo } from "../utils/prompt.utils";
import { model, aiModel } from "../utils/gemini.utils";
import { QueryResult } from "../types";

export class RepoService {
  private projectRepository: ProjectRepository;
  private repoRepository: RepoRepository;

  constructor(
    projectRepository: ProjectRepository,
    repoRepository: RepoRepository
  ) {
    this.projectRepository = projectRepository;
    this.repoRepository = repoRepository;
  }

  async loadGitRepo(projectId: string, branchName: string, userId: string) {
    if (!projectId?.trim() || !branchName || !userId) {
      throw new BadRequestError(
        "Project ID or branch name or user ID is required"
      );
    }

    const existingProject = await this.validateProject(projectId, userId);

    if (existingProject.isRepoLoaded) {
      logger.info("Repo is already loaded!");
      return;
    } // return if the repo is already loaded

    if (!existingProject.githubUrl?.trim()) {
      logger.error(`Project ${projectId} has no GitHub URL`);
      throw new BadRequestError(
        "Project has no associated GitHub repository URL"
      );
    }

    try {
      logger.info(`Loading GitHub repo for URL: ${existingProject.githubUrl}`);
      const repoData = await repoSummaryAndEmbeddings(
        existingProject.githubUrl,
        branchName
      );

      await this.repoRepository.addFileswithSummaryAndEmbeddings(
        repoData,
        existingProject.id
      );

      await this.updateProject(projectId, userId); // set the isRepoLoaded to true

      logger.info(`Successfully processed files for project ${projectId}`);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(
        `Failed to load GitHub repo for project ${projectId}: ${errorMessage}`
      );
      throw new InternalServerError("Failed to load and process repository");
    }
  }

  async saveQuestion(questionDetails: Question, userId: string) {
    if (
      !questionDetails.projectId ||
      !userId ||
      !questionDetails.answer ||
      !questionDetails.question
    ) {
      throw new BadRequestError("Question details required");
    }

    await this.validateProject(questionDetails.projectId, userId);

    await this.repoRepository.saveQuestion(questionDetails, userId);

    logger.info(
      `Successfully created question for project ${questionDetails.projectId}`
    );

    return;
  }

  private async validateProject(
    projectId: string,
    userId: string
  ): Promise<IProject> {
    const project = await this.projectRepository.findProjectById(
      projectId,
      userId
    );

    if (!project) {
      logger.error(
        `Project not found with ID: ${projectId} for User with ID: ${userId}`
      );
      throw new NotFoundError("Could not find the project");
    }

    return project;
  }

  private async updateProject(projectId: string, userId: string) {
    await this.projectRepository.updateProjectById(projectId, userId);
  }

  async queryRepositoryByQuestion(
    question: string,
    projectId: string
  ): Promise<any> {
    try {
      const queryVector = await model.embedContent(question);

      const similarFiles = await this.repoRepository.findSimilarSourceCode(
        queryVector.embedding.values,
        projectId
      );

      const context = this.buildContextFromFiles(similarFiles);

      const prompt = promptForQueryOnRepo(context, question);

      const aiResponse = await aiModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      return this.extractJsonSimple(aiResponse.response.text() as string);
    } catch (error) {
      throw new InternalServerError("Failed to process repository query");
    }
  }

  async getQuestions( userId : string){
    if( !userId){
      throw new BadRequestError("project or user ID is required!");
    }

    const questions = await this.repoRepository.getAllQuestions(userId);

    return questions;
  }

  private buildContextFromFiles(files: QueryResult[]): string {
    let context = "";
    for (const doc of files) {
      context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
    }
    return context;
  }

  private  extractJsonSimple (response: string) {
  // Extract JSON from code blocks
  const jsonRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/i;

  const match = response.match(jsonRegex);
  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1].trim());
      return parsedJson;
    } catch (err) {
      console.error(`Error parsing extracted JSON: ${err}`);
      return null;
    }
  }

  console.error("Could not extract JSON from response");
  return null;
};
}
