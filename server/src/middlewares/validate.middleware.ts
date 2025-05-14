

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../config/logger';


export const validateRequestBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Validating request body");
      await schema.parseAsync(req.body);
      logger.info("Request body is valid");
      next();
  
    } catch (error) {
      logger.error("Request body is invalid");
      const zodError = error as ZodError;
      res.status(400).json({
        message: "Invalid request body",
        success: false,
        errors: zodError.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
  };
};


export const validateQueryParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Validating query parameters");
      await schema.parseAsync(req.query);
      logger.info("Query parameters are valid");
      next();
    } catch (error) {
      logger.error("Query parameters are invalid");
      const zodError = error as ZodError;
      res.status(400).json({
        message: "Invalid query parameters",
        success: false,
        errors: zodError.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
  };
};


