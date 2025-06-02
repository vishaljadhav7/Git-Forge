import {z} from 'zod';

export const queryParamsSchema = z.object({
  question: z.string().min(1).max(1000),
  projectId: z.string().uuid()
});

export const loadRepoSchema = z.object({
    projectId: z.string().uuid(),     
    branchName : z.string({message : "branch name required!"})
})

export const createQuestionSchema  = z.object({
  question : z.string({message : "Question is required to create question!"}),
  answer : z.string({message : "Answer is required to create question!"}),
  projectId : z.string({message : "projectId is required to create question!"}).uuid(), 
  fileReferences : z.any().optional()
})

export type createQuestionSchemaType = z.infer<typeof createQuestionSchema>;
export type loadRepoSchemaType = z.infer<typeof loadRepoSchema>;
export type queryParamsSchemaType = z.infer<typeof queryParamsSchema>;
