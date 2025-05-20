import { IUserToProject, IProject } from "./project.model";

export interface IUser {
  id: string;
  email: string;
  userName: string | null;
  createdAt: Date;
  credits : number;
  ownedProjects? : IProject[]
  collaborations? : IUserToProject[]
}

export interface IUserWithPassword extends IUser {
  password: string;
}


export interface ICreateUserData {
  email: string;
  password: string;
  userName: string;
}


export interface IAuthResult {
  user: IUser;
  token: string;
}

