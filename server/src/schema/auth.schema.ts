import { z } from 'zod';

export const signUpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Not a valid email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  userName: z
    .string({
      required_error: "First name is required",
    })
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
    profileUrl : z
    .string({
      required_error: "Password is required",
    })
    .optional()
});

export const signInSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Not a valid email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password is required"),
});

// Infer types from the schemas
export type SignUpSchemaType = z.infer<typeof signUpSchema>;
export type SignInSchemaType = z.infer<typeof signInSchema>;