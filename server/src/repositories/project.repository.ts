import { prisma } from "../utils/client.utils";
import { ICreateProjectData , IProject} from "../models/project.model";

export class ProjectRepository {

    async createProject(projectData : ICreateProjectData, userId : string): Promise<IProject | null>{
        return prisma.project.create({
            data : {
                projectName : projectData.projectName,
                githubUrl : projectData.githubUrl,
                collaborators : {
                    create : {
                       userId : userId,
                    }
                },
                ownerId : userId 
            },
        })
    }

    async findProjectById(projectId : string): Promise<IProject | null>{
       return prisma.project.findUnique({
        where : {
            id : projectId
        }
       }) 
    }

    async findProjectsByUserId(userId : string) : Promise<IProject[] | null>{
        return prisma.project.findMany({
            where : {
                ownerId : userId
            }
        })
    }
}

