import { aiModel } from "./gemini.utils";
import axios from "axios";
import { promptForCommitSummary } from "./prompt.utils";
import { ICommitsWithSummary, ICommitCreateData } from "../models/commit.model";
import { 
  InternalServerError, 
  BadRequestError, 
  NotFoundError 
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

// Derived interfaces for your application
interface ICommitBasicInfo {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
}

interface CommitWithDiff extends ICommitBasicInfo {
  diffData: any | null;  // You may define a more specific type for diffData
}


const getDiff = async (owner: string, repo: string, sha: string): Promise<string | null> => {
  const diffUrl = `https://github.com/${owner}/${repo}/commit/${sha}.diff`;
  
  try {
    const response = await axios.get(diffUrl, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
      timeout: 8000, // 8 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`Error fetching diff for ${sha}: ${error.message}`);
      
      if (error.response) {
        logger.error(`Status: ${error.response.status}`);
        
        // Handle different HTTP status codes
        if (error.response.status === StatusCodes.NOT_FOUND) {
          throw new NotFoundError(`Commit ${sha} not found`);
        }
        if (error.response.status === StatusCodes.UNAUTHORIZED) {
          throw new InternalServerError("GitHub API authentication failed");
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        logger.error(`Timeout fetching diff for ${sha}`);
        return null; // Return null on timeout, will be handled by caller
      }
    }
    
    logger.error(`Unexpected error fetching diff for ${sha}: ${error}`);
    return null;
  }
};


const extractJsonFromResponse = (response: string): ICommitsWithSummary[] | null => {
  const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]/;
  
  const match = response.match(jsonRegex);
  if (match && match[0]) {
    try {
      const parsedJson = JSON.parse(match[0]);
      return parsedJson;
    } catch (err) {
      logger.error(`Error parsing extracted JSON: ${err}`);
      throw new InternalServerError("Failed to parse AI response data");
    }
  }
  
  logger.error("Could not extract JSON from AI model response");
  throw new InternalServerError("Could not extract structured data from AI response");
};




export const getCommitSummaries = async (githubUrl: string): Promise<ICommitsWithSummary[]> => {
  if (!githubUrl) {
    throw new BadRequestError("GitHub URL is required");
  }
  
  // Extract owner and repo from URL
  const  [owner, repo]  = githubUrl.split("/").slice(-2);
  
  try {
    logger.info(`Fetching commits for ${owner}/${repo}`);
    
  
  const {data  }  : { data : IGitHubCommit[]}= await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, 
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    }
  );
  const commits = data
    
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
        commitAuthorName: commit.commit.author?.name || commit.author?.login || "Unknown",
        commitAuthorAvatar: commit.author?.avatar_url || "",
        commitDate: commit.commit.author?.date || new Date().toISOString()
      };
    });
    
    logger.info(`Processing ${commitsToProcess.length} commits`);
    
    //
    const results: CommitWithDiff[] = [];
    const commitPromises = commitsToProcess.map(async (commit, index) => {
    
      await new Promise((resolve) => setTimeout(resolve, index * 200));
      
      logger.info(`Fetching diff for commit: ${commit.commitHash}`);
      try {
        const diffData = await getDiff(owner, repo, commit.commitHash);
        return {
          ...commit,
          diffData,
        };
      } catch (error) {
        logger.error(`Error processing commit ${commit.commitHash}: ${error}`);
        return {
          ...commit,
          diffData: null,
        };
      }
    });
    
    const processedCommits = await Promise.all(commitPromises);
    results.push(...processedCommits);
    
    
    const successfulDiffs = results.filter((r) => r.diffData !== null);
    
    if (successfulDiffs.length === 0) {
      throw new InternalServerError("Could not retrieve any commit diffs for analysis");
    }
    
   
    logger.info("Generating AI summaries for commits");
    const geminiPrompt = promptForCommitSummary() + " \n " + JSON.stringify(successfulDiffs);
    
    try {
      const data = await aiModel.generateContent(geminiPrompt);
      if (!data || !data.response) {
        throw new InternalServerError("Failed to generate commit summaries from AI model");
      }
      
      const response = data.response.text();
      const allSummaries = extractJsonFromResponse(response);
      
      if (!allSummaries || allSummaries.length === 0) {
        throw new InternalServerError("AI model returned empty or invalid summaries");
      }
      
      logger.info(`Generated summaries for ${allSummaries.length} commits`);
      return allSummaries;
    } catch (error) {
      logger.error(`Error generating summaries: ${error}`);
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError("Failed to generate commit summaries");
    }
  } catch (error) {
    logger.error(`Error in getCommitSummaries: ${error}`);
    
  
    if (error instanceof BadRequestError || 
        error instanceof NotFoundError || 
        error instanceof InternalServerError) {
      throw error;
    }
    
    
    if (axios.isAxiosError(error)) {
      logger.error(`Axios error: ${error.message}`);
      if (error.response) {
        logger.error(`Status: ${error.response.status}`);
        // logger.error("Response data:", error.response.data);
        
        if (error.response.status === StatusCodes.NOT_FOUND) {
          throw new NotFoundError(`Repository ${owner}/${repo} not found`);
        }
        if (error.response.status === StatusCodes.FORBIDDEN) {
          throw new InternalServerError("GitHub API rate limit exceeded or access forbidden");
        }
      }
      
      throw new InternalServerError("Error communicating with GitHub API");
    }
    
   
    throw new InternalServerError("Unexpected error when retrieving commit summaries");
  }
};