import { FileSummaries } from "./loadRepo.utils";




export const promptForRepoFilesSummary = (batch : FileSummaries[]) => {
  const prompt = `You are a senior software developer explaining code to junior developers. I will provide an array of objects representing files from a GitHub repository. Each object contains a "source" (file path) and "pageContent" (file content).

Your task: Analyze each file and add a comprehensive "summary" field to each object, explaining the file's purpose, functionality, and technical details. Your summaries should be clear, insightful, and educational, tailored to the file type.

CRITICAL INSTRUCTIONS:

1. Your response must be ONLY the raw JSON array - no code blocks, explanations, or other text.
2. Complete the entire JSON array - do not truncate or abbreviate any part of the response.
3. Maintain the original "source" field exactly as provided.
4. Maintain the original "pageContent" field exactly as provided.
5. Add a "summary" field with 80-150 words of expert analysis for each file.
6. Ensure you process ALL files in the provided array.
7. Do not add any markdown formatting, code blocks, or additional text outside the JSON.

Tailor summaries based on file type:
- For code files: explain functionality, architecture patterns, and key operations.
- For configuration files: describe purpose, settings, and system impact.
- For documentation: summarize key information and relevance.
- For data files: explain structure and content.

IMPORTANT: Complete the entire response. Generate summaries for ALL ${batch.length} files provided.

Example response format: [{"source": "path/to/file.js" ,"summary": "Expert analysis of the file"}, {"source": "path/to/another/file.yml", "summary": "Expert analysis of this file"}]

Analyze the following files:

${JSON.stringify(batch)}`;

return prompt;
}