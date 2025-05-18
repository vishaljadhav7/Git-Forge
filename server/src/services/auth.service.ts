import jwt from "jsonwebtoken";
import { IAuthResult, ICreateUserData } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword, comparePasswords } from "../utils/password.utils";
import {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
} from "../utils/error.utils";
import { logger } from "../config/logger";

export class AuthService {
  private userRepository: UserRepository;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
  }

  async signUp(userData: ICreateUserData) {
    logger.info(`Attempting to sign up user: ${userData.email}`);

    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      logger.error(`Email already in use: ${userData.email}`);
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await hashPassword(userData.password);

    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    if (!user) {
      throw new InternalServerError("Failed to create user");
    }

    const token = this.generateToken(user.id);

    logger.info(`User signed up successfully: ${user.email}`);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async signIn(email: string, password: string): Promise<IAuthResult> {
    logger.info(`Attempting to sign in user: ${email}`);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      logger.error(`Invalid credentials for email: ${email}`);
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordIsValid = await comparePasswords(password, user.password);

    if (!passwordIsValid) {
      logger.error(`Invalid password for email: ${email}`);
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.generateToken(user.id);

    logger.info(`User signed in successfully: ${user.email}`);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn : '1h'
    });
  }
}
