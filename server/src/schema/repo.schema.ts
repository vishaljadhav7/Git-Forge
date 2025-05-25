import {z} from 'zod';

export const queryParamsSchema = z.object({
  question: z.string().min(1).max(1000),
  projectId: z.string().uuid()
});

export const loadRepoSchema = z.object({
    projectId: z.string().uuid(),     
    branchName : z.string({message : "branch name required!"})
})

export type loadRepoSchemaType = z.infer<typeof loadRepoSchema>