import { WorkspaceConfiguration } from "vscode";

import { JobConfig } from "../config";
import { Job } from "./job";

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