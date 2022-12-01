import fetch, { HeadersInit, Response } from 'node-fetch';

import { ProviderConfig, ProviderType } from '../config';
import { Job, JobStatus, JobStatusResult } from '../job';

export interface Provider {
    id: number;
    name?: string;
    type: ProviderType;

    getJobStatus(job: Job): Promise<JobStatus>
}

export abstract class BaseProvider implements Provider {
    protected login: string;
    protected password: string;
    protected serviceUrl: string;
    public id: number;
    public name?: string;
    public type: ProviderType;

    constructor(config: ProviderConfig) {
        this.id = config.id;
        this.name = config.name;
        this.login = config.login;
        this.password = config.password;
        this.serviceUrl = config.serviceUrl;
        this.type = config.type;
    }

    protected createDefaultJobStatusResponse(): JobStatus {
        return {
            result: JobStatusResult.notInitialized,
            projectUrl: '',
            projectName: ''
        };
    }

    protected createJobStatusResponse(job: Job): JobStatus {
        const jobStatus = this.createDefaultJobStatusResponse();
        jobStatus.projectUrl = this.getJobProjectUrl(job);
        jobStatus.projectName = job.name || job.key;
        return jobStatus;
    }

    protected abstract getJobProjectUrl(job: Job): string;

    public abstract getJobStatus(job: Job): Promise<JobStatus>;
}

export abstract class BaseHTTPProvider extends BaseProvider {
    protected readonly defaultRequestTimeout = 5000;

    protected fetchJobStatus(job: Job): Promise<Response> {
        const endPoint = this.getJobProjectApiUrl(job);
        return fetch(endPoint, {
            method: 'GET',
            headers: this.getRequestHeaders(),
            timeout: this.defaultRequestTimeout
        });
    } 

    protected abstract getJobProjectApiUrl(job: Job): string;

    protected getRequestHeaders(): HeadersInit {
        const buffer = Buffer.from(`${this.login}:${this.password}`);
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Accept': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: 'Basic ' + buffer.toString('base64')
        };
    }

    protected abstract processJobStatus(response: Response, jobStatus: JobStatus): Promise<JobStatus>;
    
    public async getJobStatus(job: Job): Promise<JobStatus> {
        const jobStatus = this.createJobStatusResponse(job);
        try {
            const response = await this.fetchJobStatus(job);
            if (!response.ok) {
                return jobStatus;
            }
            return this.processJobStatus(response, jobStatus);
        } catch (error) {
            return jobStatus;
        }
    }
} 