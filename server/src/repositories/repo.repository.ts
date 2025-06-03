import { prisma } from "../utils/client.utils";
import { BadRequestError, InternalServerError } from "../utils/error.utils";
import { logger } from "../config/logger";
import { FileData, Question } from "../types";
import { QueryResult } from "../types";


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
              `Failed to update summaryEmbedding for file: ${fileItem.fileName} embedding error : ${errorMessage}`
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

  async saveQuestion(questionDetails : Question, userId : string){
   try {
    logger.info(`Creating question for project : ${questionDetails.projectId} for user: ${userId}`);

    if(!questionDetails.projectId || !userId || !questionDetails.answer || !questionDetails.question){
      throw new BadRequestError("Question details required");
    }
 
    await prisma.question.create({
      data : {
        ...questionDetails,
        userId : userId
      }
    }) 

    logger.info(`Created question for project : ${questionDetails.projectId} for user: ${userId}`); 
   } catch (error) {
    logger.info(`Could not create question!`)
     if(error instanceof BadRequestError){
      throw error;
     }

     throw new InternalServerError("Could not save the question");
   }
  }

  async findSimilarSourceCode(
    queryVector: number[],
    projectId: string,
    limit: number = 10
  ): Promise<QueryResult[]> {
    try {
      const vectorAsString = JSON.stringify(queryVector);

      const result = (await prisma.$queryRaw` 
         SELECT 
           "fileName",
           "sourceCode",
           "summary",
           ("summaryEmbedding" <=> ${vectorAsString}::vector) as cosine_distance,
           (1 - ("summaryEmbedding" <=> ${vectorAsString}::vector))::DECIMAL(6,4) as cosine_similarity,
           ("summaryEmbedding" <-> ${vectorAsString}::vector) as euclidean_distance
         FROM "SourceCodeEmbedding"
         WHERE 
           "projectId" = ${projectId}
         ORDER BY cosine_distance ASC
         LIMIT 10
       `) as QueryResult[];

      return result;
    } catch (error) {

      throw new InternalServerError("Failed to query source code embeddings");
    }
  }

  async getAllQuestions( userId: string){
    try {
     return await prisma.question.findMany({
        where : {
          userId : userId
        }
      })
    } catch (error) {

      throw new InternalServerError("Failed to query source code embeddings");
    }
  }
}
