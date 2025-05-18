
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

