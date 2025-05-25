import { prisma } from "../utils/client.utils";
import { InternalServerError } from "../utils/error.utils";
import { logger } from "../config/logger";

interface FileData {
  fileName: string;
  sourceCode: string;
  summary: string;
  summaryEmbedding?: {
    values: number[];
  } | null;
}



export class RepoRepository {
  async addFileswithSummaryAndEmbeddings(
    data: FileData[],
    projectId: string
  ): Promise<void> {
    if (!data?.length || !projectId?.trim()) {
      throw new Error("Invalid input: data and projectId are required");
    }

  

    // Process files sequentially to avoid transaction conflicts and ensure partial success
    for (const fileItem of data) {
      try {
        // Create the record
        const sourceCodeEmbedding = await prisma.sourceCodeEmbedding.create({
          data: {
            fileName: fileItem.fileName,
            sourceCode: fileItem.sourceCode,
            summary: fileItem.summary,
            projectId: projectId,
          },
        });

        logger.info(
          `Created SourceCodeEmbedding for file: ${fileItem.fileName}, ID: ${sourceCodeEmbedding.id}`
        );

        // Update summaryEmbedding if present using raw query
        if (fileItem.summaryEmbedding && fileItem.summaryEmbedding?.values) {
          try {
            // Validate that all values are valid numbers
            if (
              !fileItem.summaryEmbedding.values.every(
                (val) => typeof val === "number" && !isNaN(val) && isFinite(val)
              )
            ) {
              throw new Error(
                "Invalid embedding values: must be array of finite numbers"
              );
            }

            // Formatting the vector as a string for pgvector
            const vectorString = `[${fileItem.summaryEmbedding.values.join(",")}]`;

            
            await prisma.$executeRaw`
              UPDATE "SourceCodeEmbedding"
              SET "summaryEmbedding" = ${vectorString}::vector
              WHERE "id" = ${sourceCodeEmbedding.id}
            `;
            logger.info(
              `Updated summaryEmbedding for file: ${fileItem.fileName}`
            );
          } catch (embeddingError) {
            const errorMessage =
              embeddingError instanceof Error
                ? embeddingError.message
                : String(embeddingError);
            logger.error(
              `Failed to update summaryEmbedding for file: ${fileItem.fileName}`
            );

            continue; // Continue to the next file
          }
        }

      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Failed to process file: ${fileItem.fileName}`);

      }
    }
    return ;
  }
}
