export interface Job {
    id: number;
    key: string;
    name?: string;
    providerId: number;
}

export enum JobStatusResult {
    notInitialized,
    success,
    failure
}

export interface JobStatus {
    result: JobStatusResult;
    projectUrl: string;
    projectName: string;
}