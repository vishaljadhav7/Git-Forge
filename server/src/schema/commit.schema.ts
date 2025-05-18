import {z} from 'zod';
 
export const commitSchema = z.object({
    projectId : z.string({message : "project Id is required"})
})

export type commitSchemaType = z.infer<typeof commitSchema>; 