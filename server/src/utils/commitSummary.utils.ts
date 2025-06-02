import { aiModel } from "./gemini.utils";
import axios from "axios";
import { ICommitsWithSummary } from "../models/commit.model";
import {
  InternalServerError,
  BadRequestError,
  NotFoundError,
} from "./error.utils";
import { StatusCodes } from "http-status-codes";
import { logger } from "../config/logger";

interface IGitHubCommitAuthor {
  name?: string;
  email?: string;
  date?: string;
}

interface IGitHubCommitDetails {
  author?: IGitHubCommitAuthor;
  committer?: IGitHubCommitAuthor;
  message: string;
}

interface IGitHubCommitUser {
  login?: string;
  avatar_url?: string;
}

interface IGitHubCommit {
  sha: string;
  commit: IGitHubCommitDetails;
  author?: IGitHubCommitUser;
  html_url: string;
}

interface ICommitBasicInfo {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
}

interface CommitWithDiff extends ICommitBasicInfo {
  diffData: any | null;
}

const getDiff = async (
  owner: string,
  repo: string,
  sha: string
): Promise<string | null> => {
  const diffUrl = `https://github.com/${owner}/${repo}/commit/${sha}.diff`;

  try {
    const response = await axios.get(diffUrl, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
      timeout: 8000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Error fetching diff for ${sha}: ${error.message}`);

      if (error.response) {
        logger.error(`Status: ${error.response.status}`);

        if (error.response.status === StatusCodes.NOT_FOUND) {
          throw new NotFoundError(`Commit ${sha} not found`);
        }
        if (error.response.status === StatusCodes.UNAUTHORIZED) {
          throw new InternalServerError("GitHub API authentication failed");
        }
      }
    }

    logger.error(`Unexpected error fetching diff for ${sha}: ${error}`);
    return null;
  }
};

const getSummary = async (diffData: any): Promise<string> => {
  try {
    if (!diffData) {
      return "No diff data available for analysis";
    }

    const geminiPrompt = `I need you to analyze GitHub commit diff and create a summary. For the given diff of commit I need a concise but detailed summary (100-150 words) of what the diff shows.

Include in your summary:
- Which files were modified
- What specific changes were made (added/removed/modified content)  
- The purpose or impact of these changes
- Any technical details that are important to understand the commit

Please provide only the summary text, no additional formatting or explanations.

Diff starts:
${diffData}
Diff ends.`;

    const data = await aiModel.generateContent(geminiPrompt);

    if (!data || !data.response) {
      throw new InternalServerError(
        "Failed to generate commit summary from AI model"
      );
    }

    const response = data.response.text();
    return response.trim();
  } catch (error) {
    logger.error(`Error generating summary: ${error}`);
    if (error instanceof InternalServerError) {
      throw error;
    }
    throw new InternalServerError("Failed to generate commit summary");
  }
};

export const getCommitSummaries = async (
  githubUrl: string
): Promise<ICommitsWithSummary[]> => {
  if (!githubUrl) {
    throw new BadRequestError("GitHub URL is required");
  }

  const [owner, repo] = githubUrl.split("/").slice(-2);

  try {
    logger.info(`Fetching commits for ${owner}/${repo}`);

    const { data }: { data: IGitHubCommit[] } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const commits = data;

    if (!commits || commits.length === 0) {
      throw new NotFoundError("No commits found in the repository");
    }

    const sortedCommits = commits.sort(
      (a, b) =>
        new Date(b.commit.author?.date || "").getTime() -
        new Date(a.commit.author?.date || "").getTime()
    );

    // Take the first 7 commits
    const commitsToProcess = sortedCommits.slice(0, 7).map((commit) => {
      return {
        commitHash: commit.sha,
        commitMessage: commit.commit.message,
        commitAuthorName:
          commit.commit.author?.name || commit.author?.login || "Unknown",
        commitAuthorAvatar: commit.author?.avatar_url || "",
        commitDate: commit.commit.author?.date || new Date().toISOString(),
      };
    });

    logger.info(`Processing ${commitsToProcess.length} commits`);

    // Process commits one by one
    const allSummariesWithDiff: ICommitsWithSummary[] = [];

    for (let i = 0; i < commitsToProcess.length; i++) {
      const commit = commitsToProcess[i];

      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      logger.info(
        `Processing commit ${i + 1}/${commitsToProcess.length}: ${
          commit.commitHash
        }`
      );

      try {
        // Fetch diff data
        const diffData = await getDiff(owner, repo, commit.commitHash);

        // Generate summary using AI
        const summary = await getSummary(diffData);

        const commitWithSummary: ICommitsWithSummary = {
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
          summary: summary,
        };

        allSummariesWithDiff.push(commitWithSummary);
        logger.info(`Successfully processed commit: ${commit.commitHash}`);
      } catch (error) {
        logger.error(`Error processing commit ${commit.commitHash}: ${error}`);

        // Add commit with error summary instead of skipping
        const commitWithError: ICommitsWithSummary = {
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
          summary: "Failed to generate summary due to processing error",
        };

        allSummariesWithDiff.push(commitWithError);
      }
    }

    if (allSummariesWithDiff.length === 0) {
      throw new InternalServerError(
        "Could not process any commits for analysis"
      );
    }

    logger.info(
      `Generated summaries for ${allSummariesWithDiff.length} commits`
    );
    return allSummariesWithDiff;
  } catch (error) {
    logger.error(`Error in getCommitSummaries: ${error}`);

    if (
      error instanceof BadRequestError ||
      error instanceof NotFoundError ||
      error instanceof InternalServerError
    ) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      logger.error(`Axios error: ${error.message}`);
      if (error.response) {
        logger.error(`Status: ${error.response.status}`);

        if (error.response.status === StatusCodes.NOT_FOUND) {
          throw new NotFoundError(`Repository ${owner}/${repo} not found`);
        }
        if (error.response.status === StatusCodes.FORBIDDEN) {
          throw new InternalServerError(
            "GitHub API rate limit exceeded or access forbidden"
          );
        }
      }

      throw new InternalServerError("Error communicating with GitHub API");
    }

    throw new InternalServerError(
      "Unexpected error when retrieving commit summaries"
    );
  }
};
