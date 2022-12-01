import fetch, { HeadersInit } from 'node-fetch';

import { Job, JobStatus, JobStatusEnum } from '../job';
import { BaseProvider } from './provider';

enum JenkinsJobResult {
    success = 'SUCCESS',
    failure = 'FAILURE',
    aborted = 'ABORTED'
}
  
interface JenkinsJobAction {
    building: boolean;
    result: JenkinsJobResult;
}

export class JenkinsProvider extends BaseProvider {
    private readonly _defaultRequestTimeout = 5000;

    private _getJobProjectApiUrl(job: Job): string {
        return `${this._getJobProjectUrl(job)}/lastBuild/api/json`;
    }

    private _getJobProjectUrl(job: Job): string {
        return `${this.serviceUrl}/job/${job.key}/job/master/`;
    }

    private _getRequestHeaders(): HeadersInit {
        const buffer = Buffer.from(`${this.login}:${this.password}`);
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: 'Basic ' + buffer.toString('base64')
        };
    }

    private _processJobStatus(jenkinsJob: JenkinsJobAction, jobStatus: JobStatus): JobStatus {
        if (jenkinsJob) {
            switch (jenkinsJob.result) {
                case JenkinsJobResult.success:
                jobStatus.status = JobStatusEnum.success;
                break;
                case JenkinsJobResult.failure:
                jobStatus.status = JobStatusEnum.failure;
                break;
            }
        }
        return jobStatus;
    }

    private _createJobStatusResponse(job: Job): JobStatus {
        const jobStatus = this._createDefaultJobStatusResponse();
        jobStatus.projectUrl = this._getJobProjectUrl(job);
        jobStatus.projectName = job.name || job.key;
        return jobStatus;
    }

    private _createDefaultJobStatusResponse(): JobStatus {
        return {
            status: JobStatusEnum.notInitialized,
            projectUrl: '',
            projectName: ''
        };
    }
    
    public async getJobStatus(job: Job): Promise<JobStatus> {
        const endPoint = this._getJobProjectApiUrl(job);
        const jobStatus = this._createJobStatusResponse(job);
        const response = await fetch(endPoint, {
            method: 'GET',
            headers: this._getRequestHeaders(),
            timeout: this._defaultRequestTimeout
        });
        if (!response.ok) {
            return jobStatus;
        }
        const jobAction = (await response.json()) as JenkinsJobAction;
        return this._processJobStatus(jobAction, jobStatus);
    }
}