export interface Job {
    id: number;
    key: string;
    name?: string;
    providerId: number;
}

export enum JobStatusEnum {
    notInitialized,
    success,
    failure
}

export interface JobStatus {
    status: JobStatusEnum;
    projectUrl: string;
    projectName: string;
}