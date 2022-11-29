import { WorkspaceConfiguration } from "vscode";
import { JobConfig } from "./config";

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

export class JobsCreator {
    public static create(config: WorkspaceConfiguration): Job[] {
        const jobs: Job[] = [];
        const jobsConfig = config.get<JobConfig[]>('jobs') || [];
        jobsConfig.forEach(jobConfig => {
            jobs.push({
                id: jobConfig.id,
                key: jobConfig.key,
                name: jobConfig.name,
                providerId: jobConfig.providerId
            });
        });
        return jobs;
    }
}