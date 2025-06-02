import { Router } from "express";
import {
  validateQueryParams,
  validateRequestBody,
} from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RepoService } from "../services/repo.service";
import { RepoController } from "../controllers/repo.controller";
import { ProjectRepository } from "../repositories/project.repository";
import { RepoRepository } from "../repositories/repo.repository";
import { loadRepoSchema, createQuestionSchema } from "../schema/repo.schema";
import { queryParamsSchema } from "../schema/repo.schema";


const repoRouter = Router();

const repoRepository = new RepoRepository();
const projectRepository = new ProjectRepository();
const repoService = new RepoService(projectRepository, repoRepository);
const repoController = new RepoController(repoService);

repoRouter.post(
  "/load",
  authMiddleware,
  validateRequestBody(loadRepoSchema),
  repoController.loadRepoToQuery
);

repoRouter.get(
  "/query",
  authMiddleware,
  validateQueryParams(queryParamsSchema),
repoController.queryQuestion
);


repoRouter.post(
  "/query-save", 
  authMiddleware, 
  validateRequestBody(createQuestionSchema), 
  repoController.saveQuestion
);


export { repoRouter };











  // async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { question, projectId } = req.query as queryParamsSchemaType;

  //     if (!question || !projectId) {
  //       res.status(400).json({ error: "Missing question or projectId" });
  //       return;
  //     }

  //     // Generate embedding for the question

  //     const model = genAI.getGenerativeModel({
  //       model: "text-embedding-004",
  //     });

  //     const queryVector = await model.embedContent(question); // api call needs try-catch block

  //     const vectorAsString = JSON.stringify(queryVector.embedding.values);

  //     const finalResult = (await prisma.$queryRaw` 
  //        SELECT 
  //          "fileName",
  //          "sourceCode",
  //          "summary",
  //          ("summaryEmbedding" <=> ${vectorAsString}::vector) as cosine_distance,
  //          (1 - ("summaryEmbedding" <=> ${vectorAsString}::vector))::DECIMAL(6,4) as cosine_similarity,
  //          ("summaryEmbedding" <-> ${vectorAsString}::vector) as euclidean_distance
  //        FROM "SourceCodeEmbedding"
  //        WHERE 
  //          "projectId" = ${projectId}
  //        ORDER BY cosine_distance ASC
  //        LIMIT 10
  //      `) as {
  //       fileName: string;
  //       sourceCode: string;
  //       summary: string;
  //       cosine_distance: number;
  //       cosine_similarity: number;
  //       euclidean_distance: number;
  //     }[]; // db call needs try-catch block

  //     // console.log("Final result:", finalResult.length);

  //     let context = "";
  //     for (const doc of finalResult) {
  //       context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
  //     }

  //     const prompt1 = promptForQueryOnRepo(context, question);

  //     const aiResponse = await aiModel.generateContent({
  //       contents: [{ role: "user", parts: [{ text: prompt1 }] }],
  //     }); 

  //     const formatedResponse = extractJsonSimple(aiResponse.response.text());
  //     res.status(200).json(formatedResponse);
  //   } catch (error) {
  //     console.log("ENDED from ERROR");
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // }