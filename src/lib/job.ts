import { WorkspaceConfiguration } from "vscode";
import { JobConfig } from "./config";

export interface Job {
    providerId: string;
}

export class JobStatus {

}

export class JobsCreator {
    public static create(config: WorkspaceConfiguration): Job[] {
        const jobs: Job[] = [];
        const jobsConfig = config.get<JobConfig[]>('jobs') || [];
        jobsConfig.forEach(jobConfig => {
            jobs.push({
                providerId: jobConfig.providerId
            });
        });
        return jobs;
    }
}