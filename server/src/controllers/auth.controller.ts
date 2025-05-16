import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SignInSchemaType, SignUpSchemaType } from '../schema/auth.schema';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger';

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000, // 1 hour
};

export class AuthController {
    private authService: AuthService;

    constructor (authService : AuthService){
        this.authService = authService;
    }

    signUp = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
      try {
        const userData = req.body as SignUpSchemaType;
        logger.info('Sign up request received' + userData.email);

        const {user, token} = await this.authService.signUp(userData)
        
        res 
        .status(StatusCodes.CREATED)
        .cookie('token', token, options)
        .json({
        message: 'User registered successfully',
        success: true,
        data: user 
        })
        ;
        return ;
      } catch (error) {
        next(error);
      }
    }

    signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as SignInSchemaType;
      logger.info('Sign in request received '+ email);

      const {user, token} = await this.authService.signIn(email, password);

      res
      .status(StatusCodes.OK)
      .cookie('token', token, options)
      .json({
      message: 'User authenticated successfully',
      success: true,
      data: user 
      })

      return ;
    } catch (error) {
      next(error);
    }
  };
}