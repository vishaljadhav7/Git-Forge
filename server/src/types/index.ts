
export interface Question{
  question  : string;
  answer : string;
  fileReferences? : any;
  projectId : string;
}

export interface ProcessedFile {
  id: string;
  fileName: string;
  sourceCode: string;
  summary: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadRepoRequest {
  projectId: string;
}

export interface LoadRepoResponse {
  success: boolean;
  data: ProcessedFile[];
  message: string;
  processedCount: number;
}



export interface FileData {
  fileName: string;
  sourceCode: string;
  summary: string;
  summaryEmbedding?: {
    values: number[];
  } | null;
}


export interface QueryResult {
  fileName: string;
  sourceCode: string;
  summary: string;
  cosine_distance: number;
  cosine_similarity: number;
  euclidean_distance: number;
}
