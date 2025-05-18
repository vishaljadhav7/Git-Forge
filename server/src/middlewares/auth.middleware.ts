import { Request, Response, NextFunction } from "express"; 
import {prisma} from '../utils/client.utils';
import jwt, { JwtPayload } from "jsonwebtoken";
import { NotFoundError, UnauthorizedError } from "../utils/error.utils";


interface User {
    userId: string;
    userName?: string;
    email?: string;
  }
  
  // Extend Express Request type to include user
  declare module "express" {
    export interface Request {
      user?: User;
    }
  }

   export const authMiddleware = async (req : Request, res : Response, next : NextFunction) => {
        const token = req.cookies.token; 
      
        if(!token){
            throw new UnauthorizedError("Unauthorized!")
        };

        try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
         
           if(!decoded.userId){
             throw new UnauthorizedError("Invalid Token!")
           }
           
          const userInfo = await prisma.user.findUnique({ where: { id: decoded.userId } }); 

          if(!userInfo) {
            throw new NotFoundError("Invalid token: User not found")
          }
        
          req.user = {  userId: decoded. userId }; 
          next();
        } catch (error) {
          next(error);
        }
  }