
export interface ICommitCreateData {
    commitMessage : string;
    commitHash : string;
    commitAuthorName : string;
    commitAuthorAvatar : string;
    commitDate : Date | string;
}

export interface ICommitsWithSummary extends ICommitCreateData{
  summary : string 
}


export interface ICommit extends ICommitsWithSummary{
  id: string; 
  createdAt : Date;
  updatedAt : Date;
  projectId : string;
}

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
  deletedAt? : Date;
  collaborators? : IUserToProject[]
  commits? : ICommit[]
}




