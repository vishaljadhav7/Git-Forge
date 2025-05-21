import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IProject, ICreateProjectData, ICommit} from "../types";

export const api = createApi({
    reducerPath : "api",
    baseQuery : fetchBaseQuery({
        baseUrl : "http://localhost:4000/api",
        credentials : "include",
    }),
    
    tagTypes: ["Projects", "Commits"],

    endpoints : (build) => ({
        
        fetchAllProjects : build.query<IProject[], void>({
            query : () => `/project`,
            providesTags : ["Projects"],
             transformResponse : (data : {data : IProject[]}) => data.data
        }),

        createProject : build.mutation<IProject, {project : ICreateProjectData}>({
            query : ({project}) => ({
                url : "/project",
                method : "POST",
                body : project,
            }),
            invalidatesTags : ["Projects"],
            transformResponse : (data : {data :  IProject}) => data.data
        }),

        generateCommits : build.mutation<ICommit[], {projectId : string}>({
            query : ({projectId}) => ({
                method : "POST",
                url : "/commit-summary",
                body : {projectId}
            }),
            // invalidatesTags : ["Commits"],
             transformResponse : (data : {data :  ICommit[]}) => data.data
        }),

        fetchAllCommits : build.query<ICommit[], {projectId : string}>({
            query : ({projectId}) => ({
                url : `/commit-summary/${projectId}`,
            }),
            transformResponse : (data : {data :  ICommit[]}) => data.data
        })
    })
})


export const {useCreateProjectMutation, useFetchAllProjectsQuery, useGenerateCommitsMutation, useFetchAllCommitsQuery}  = api;