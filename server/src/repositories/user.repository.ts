import { prisma } from "../utils/client.utils";
import { ICreateUserData, IUserWithPassword } from "../models/user.model";
 
export class UserRepository {
  
    async findByEmail(email : string): Promise<IUserWithPassword | null>{
        return  prisma.user.findUnique({
            where : {
                email : email
            }
        })
    }

    async findById(id : string) : Promise<IUserWithPassword | null> {
        return prisma.user.findUnique({
            where : {
                id : id
            }
        })
    }

    async create(userData : ICreateUserData) : Promise<IUserWithPassword | null>{
       return prisma.user.create({
        data : userData
       }) 
    }
}
