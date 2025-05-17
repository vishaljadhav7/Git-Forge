import {z} from 'zod';
 
export const projectSchema = z.object({
  projectName: z
    .string()
    .min(4, { message: 'Project name must be at least 4 characters' })
    .max(10, { message: 'Project name cannot exceed 10 characters' }),
  githubUrl: z
    .string()
    .regex(
      /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/?$/,
      { message: 'Invalid GitHub URL. Use format: https://github.com/owner/repo' }
    ),
  githubToken: z.string().optional(),
})

export type projectSchema = z.infer<typeof projectSchema>;