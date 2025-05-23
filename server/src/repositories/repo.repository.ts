import { prisma } from "../utils/client.utils";
import { InternalServerError } from "../utils/error.utils";
import { logger } from "../config/logger";
import { Prisma } from "../../generated/prisma";

interface FileData {
  fileName: string;
  sourceCode: string;
  summary: string;
  summaryEmbedding?: {
    values: number[];
  } | null;
}

export class RepoRepository {
  async addFileswithSummaryAndEmbeddingsTransaction(
    data: FileData[],
    projectId: string
  ) {

    if (!data?.length || !projectId?.trim()) {
      throw new Error("Invalid input: data and projectId are required");
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const results = [];

        for (const fileItem of data) {
          // Create the record
          const sourceCodeEmbedding = await tx.sourceCodeEmbedding.create({
            data: {
              fileName: fileItem.fileName,
              sourceCode: fileItem.sourceCode,
              summary: fileItem.summary,
              projectId: projectId,
            },
          });

   
          if (fileItem.summaryEmbedding && fileItem.summaryEmbedding.values?.length) {
            try {
              await tx.$executeRaw(
                Prisma.sql`UPDATE "SourceCodeEmbedding" 
                           SET "summaryEmbedding" = ${fileItem.summaryEmbedding.values}::vector
                           WHERE "id" = ${sourceCodeEmbedding.id}`
              );
            } catch (embeddingError) {
              logger.error(`Failed to update embedding for ${fileItem.fileName}: ${embeddingError}`,);
  
            }
          }

          results.push(sourceCodeEmbedding);
        }

        return results;
      });
    } catch (error) {
      logger.error("Error saving files");
      throw new InternalServerError("Could not save the files");
    }
  }
}