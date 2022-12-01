import { Response } from 'node-fetch';

import { Job, JobStatus, JobStatusResult } from '../job';
import { addTrailingSlashToUrl } from '../utils';
import { BaseHTTPProvider } from './provider';

enum TeamCityBuildStatus {
    success = 'SUCCESS',
    failure = 'FAILURE',
    aborted = 'ABORTED'
}

interface TeamCityBuildResult {
    status: TeamCityBuildStatus;
    webUrl: string;
}

interface TeamCityBuildResponse {
    build: TeamCityBuildResult[];
}

export class TeamCityProvider extends BaseHTTPProvider {
    protected getJobProjectApiUrl(job: Job): string {
        const serviceUrl = addTrailingSlashToUrl(this.serviceUrl);
        return `${serviceUrl}app/rest/builds/?locator=buildType:${job.key},count:1`;
    }
    
    protected getJobProjectUrl(job: Job): string {
        const serviceUrl = addTrailingSlashToUrl(this.serviceUrl);
        return `${serviceUrl}viewType.html?buildTypeId=${job.key}`;
    }

    protected async processJobStatus(response: Response, jobStatus: JobStatus): Promise<JobStatus> {
        const teamCityBuildResponse = (await response.json()) as TeamCityBuildResponse;
        if (!teamCityBuildResponse.build.length) {
            return jobStatus;
        }
        const teamCityBuildResult = teamCityBuildResponse.build[0];
        if (teamCityBuildResult) {
            switch (teamCityBuildResult.status) {
                case TeamCityBuildStatus.success:
                jobStatus.result = JobStatusResult.success;
                break;
                case TeamCityBuildStatus.failure:
                jobStatus.result = JobStatusResult.failure;
                break;
            }
        }
        jobStatus.projectUrl = teamCityBuildResult.webUrl || jobStatus.projectUrl;
        return jobStatus;
    }
}