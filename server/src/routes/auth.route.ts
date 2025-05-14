import { Router } from 'express';
import { validateRequestBody } from '../middlewares/validate.middleware';
import { signUpSchema , signInSchema } from '../schema/auth.schema';
import { AuthController } from '../controllers/auth.controller';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';

const authRouter = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRouter.post("/sign-up", validateRequestBody(signUpSchema), authController.signUp);

authRouter.post("/sign-in", validateRequestBody(signInSchema) , authController.signIn);

export {authRouter};