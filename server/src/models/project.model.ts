import { ICommit } from "./commit.model";

export interface IUserToProject{
   id: string; 
   createdAt : Date;
   updatedAt : Date;
   userId : string;
   projectId : string;
}

export interface ICreateProjectData {
  projectName : string;
  githubUrl : string;
}

export interface IProject extends ICreateProjectData {
  id: string; 
  createdAt : Date;
  updatedAt : Date;
  ownerId : string;
  deletedAt? : Date | null;
  collaborators? : IUserToProject[]
  commits? : ICommit[]
}
