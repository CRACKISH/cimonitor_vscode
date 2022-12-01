import { HeadersInit, Response } from 'node-fetch';

import { Job, JobStatus, JobStatusResult } from '../job';
import { addTrailingSlashToUrl } from '../utils';
import { BaseHTTPProvider } from './provider';

enum JenkinsJobResult {
    success = 'SUCCESS',
    failure = 'FAILURE',
    aborted = 'ABORTED'
}
  
interface JenkinsJobResponse {
    building: boolean;
    result: JenkinsJobResult;
}

export class JenkinsProvider extends BaseHTTPProvider {
    protected getJobProjectApiUrl(job: Job): string {
        const projectUrl = addTrailingSlashToUrl(this.getJobProjectUrl(job));
        return `${projectUrl}lastBuild/api/json`;
    }

    protected getJobProjectUrl(job: Job): string {
        const serviceUrl = addTrailingSlashToUrl(this.serviceUrl);
        return `${serviceUrl}job/${job.key}/job/master/`;
    }

    protected async processJobStatus(response: Response, jobStatus: JobStatus): Promise<JobStatus> {
        const jenkinsJob = (await response.json()) as JenkinsJobResponse;
        if (jenkinsJob) {
            switch (jenkinsJob.result) {
                case JenkinsJobResult.success:
                jobStatus.result = JobStatusResult.success;
                break;
                case JenkinsJobResult.failure:
                jobStatus.result = JobStatusResult.failure;
                break;
            }
        }
        return jobStatus;
    }
}