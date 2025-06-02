import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { aiModel } from "./gemini.utils";
import { genAI } from "./gemini.utils";
import { logger } from "../config/logger";



export interface FileSummaries {
  source: string;
  summary: string;
}

// prompt for single file processing
const promptForSingleFileSummary = (file: { source: string; pageContent: string }) => {
  return `You are a senior software developer. Analyze this file and provide a technical summary.

File: ${file.source}
Content: ${file.pageContent.slice(0, 10000)} // Limit content to avoid token limits

Provide a concise technical summary (50-100 words) explaining:
- What this file does
- Its purpose in the project
- Key functionality or configuration

Return only the summary text, no additional formatting.`;
};

// Generate summary for file
const generateSummaryForFile = async (file: { source: string; pageContent: string }): Promise<string> => {
  const maxRetries = 3;
  let lastError: any;

    // Skip binary files 
  const skipPatterns = [
    /\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /\.min\.(js|css)$/,
    /node_modules/,
    /dist\/|build\//,
  ];

  if (skipPatterns.some(pattern => pattern.test(file.source))) {
    return `Skipped processing of ${file.source} - likely binary or generated file`;
  }


  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generating summary for ${file.source} (attempt ${attempt})`);
      
      const prompt = promptForSingleFileSummary(file);

      const res = await aiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,        // Reduced from 200
          temperature: 0.4,            // Slightly higher for more original content
          topP: 0.9,
          topK: 40,
          stopSequences: ['\n\n'],     // Stop at paragraph breaks
        },
      });

      const summary = res.response.text().trim();
      
      if (!summary || summary.length < 10) {
        throw new Error('Summary too short or empty');
      }

      if (summary.toLowerCase().includes('i cannot') || 
          summary.toLowerCase().includes('i\'m sorry') ||
          summary.toLowerCase().includes('blocked')) {
        throw new Error('Potential content policy violation detected');
      }

      logger.info(`✓ Generated summary for ${file.source}`);
      return summary;

    } catch (error: any) {
      lastError = error;

            // Handle specific recitation errors
      if (error.message.includes('recitation') || 
          error.message.includes('RECITATION') ||
          error.status === 400) {
        logger.error(`⚠️ Recitation issue for ${file.source}, trying with generic summary`);
        return `Configuration/code file: ${file.source}. Contains project-specific settings and implementations. Part of the application's core functionality.`;
      }      

      logger.error(`Attempt ${attempt} failed for ${file.source}: Error : ${error.message}`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  logger.error(`Failed to generate summary for ${file.source} after ${maxRetries} attempts`);
  return `Error generating summary for ${file.source}: ${lastError?.message || 'Unknown error'}`;
};

// Generate embedding for file
export const generateEmbeddingForFile = async (fileSummary: FileSummaries): Promise<any> => {
  const maxRetries = 3;
  let lastError: any;

    const skipPatterns = [
    /\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /\.min\.(js|css)$/,
    /node_modules/,
    /dist\/|build\//,
  ];

  if (skipPatterns.some(pattern => pattern.test(fileSummary.source))) {
    return `Skipped processing of ${fileSummary.source} - likely binary or generated file`;
  }


  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generating embedding for ${fileSummary.source} (attempt ${attempt})`);
      
      const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });

      const result = await model.embedContent(fileSummary.summary);
      
      logger.info(`✓ Generated embedding for ${fileSummary.source}`);

      return {
        source: fileSummary.source,
        embedding: result.embedding,
      };

    } catch (error: any) {
      lastError = error;
      
      if (error.message.includes("Recitation")) {
        logger.error(`Skipping embedding for ${fileSummary.source}: Blocked due to recitation`);
        return null; // Skip this file
      }
      
      logger.error(`Attempt ${attempt} failed for embedding ${fileSummary.source}: Error : ${error.message}`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  logger.error(`Failed to generate embedding for ${fileSummary.source} after ${maxRetries} attempts`);
  return null; // Skip this file
};

// Main function - processing files one at a time
export const repoSummaryAndEmbeddings = async (url: string, branchName : string) => {
  try {
    logger.info(`Starting repository analysis for: ${url}`);
    
    // Load repository
    const loader = new GithubRepoLoader(url, {
      accessToken: process.env.GITHUB_TOKEN!,
      branch: branchName.toLocaleLowerCase(),
      ignoreFiles: [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "bun.lockb",
        "README.md",
        ".gitignore",
        "*.min.js",
        "*.map",
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**"
      ],
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5,
    });

    const docs = await loader.load();
    logger.info(`Loaded ${docs.length} files from repository`);

    const limitedFiles = docs.length < 71 ? docs.length : 70;

    const repoFiles = docs
      .filter(doc => doc.pageContent.trim().length > 0) // Skip empty files
      .map(doc => ({
        source: doc.metadata.source,
        pageContent: doc.pageContent.slice(0, 12000), // Limit content
      })).slice(0, limitedFiles) ;

    logger.info(`Processing ${repoFiles.length} non-empty files`);

    const results = [];
    let processedCount = 0;
    let errorCount = 0;

    // Process each file individually
    for (const file of repoFiles) {
      try {
        // Generate summary
        const summary = await generateSummaryForFile(file);
        
        const fileSummary: FileSummaries = {
          source: file.source,
          summary: summary
        };

        // Generate embedding
        const embedding = await generateEmbeddingForFile(fileSummary);

        // Combine results
        const result = {
          fileName: file.source as string,
          sourceCode: file.pageContent,
          summary: summary,
          summaryEmbedding: embedding?.embedding || null
        };

        results.push(result);
        processedCount++;
        
        logger.info(`Progress: ${processedCount}/${repoFiles.length} files processed`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error: any) {
        errorCount++;
        logger.error(`Error processing file ${file.source as string}:`)
        
        // Add error entry to results to maintain consistency
        results.push({
          fileName: file.source as string,
          sourceCode: file.pageContent as string,
          summary: `Error processing file: ${error.message}`,
          summaryEmbedding: null
        });
      }
    }

    logger.info(`Repository analysis completed!`);
    logger.info(`✓ Successfully processed: ${processedCount - errorCount} files`);
    // logger.info(`✗ Errors encountered: ${errorCount} files`);
    logger.info(`📊 Total results: ${results.length} files`);

    const res = results.filter((file) => file.summaryEmbedding !== null)
    return res;

  } catch (error: any) {
    logger.error("Error in repoSummaryAndEmbeddings:");
    throw new Error(`Repository analysis failed: ${error.message}`);
  }
};

