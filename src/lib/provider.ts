import fetch, { HeadersInit } from 'node-fetch';
import { WorkspaceConfiguration } from "vscode";
import { ProviderConfig, ProviderType } from "./config";
import { Job, JobStatusEnum, JobStatus } from "./job";

export interface Provider {
    id: number;
    name?: string;
    type: ProviderType;

    getJobStatus(job: Job): Promise<JobStatus>
}

abstract class BaseProvider implements Provider {
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

    public abstract getJobStatus(job: Job): Promise<JobStatus>;
}

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

    private _getRequestHeaders(): HeadersInit {
        const buffer = Buffer.from(`${this.login}:${this.password}`);
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: 'Basic ' + buffer.toString('base64')
        };
    }

    private _processJenkinsJob(jenkinsJob: JenkinsJobAction): JobStatus {
        const ciJob = this._createDefaultJobStatusResponse();
        if (jenkinsJob) {
            switch (jenkinsJob.result) {
                case JenkinsJobResult.success:
                ciJob.status = JobStatusEnum.success;
                break;
                case JenkinsJobResult.failure:
                ciJob.status = JobStatusEnum.failure;
                break;
            }
        }
        return ciJob;
    }

    private _createDefaultJobStatusResponse(): JobStatus {
        return {
            status: JobStatusEnum.notInitialized
        };
    }
    
    public async getJobStatus(job: Job): Promise<JobStatus> {
        const endPoint = `${this.serviceUrl}/job/${job.key}/job/master/lastBuild/api/json`;
        const response = await fetch(endPoint, {
            method: 'GET',
            headers: this._getRequestHeaders(),
            timeout: this._defaultRequestTimeout
        });
        if (!response.ok) {
            return this._createDefaultJobStatusResponse();
        }
        const jobAction = (await response.json()) as JenkinsJobAction;
        return this._processJenkinsJob(jobAction);
    }
}

export class ProviderFactory {
    public static create(config: ProviderConfig): Provider {
        const type = config.type;
        switch(type) {
            case ProviderType.jenkins: 
                return new JenkinsProvider(config);
            default: 
                throw new Error(`Not supported type: ${type}`);
        }
    }
}

export class ProvidersCreator {
    public static create(config: WorkspaceConfiguration): Provider[] {
        const providers: Provider[] = [];
        const providersConfig = config.get<ProviderConfig[]>('providers') || [];
        providersConfig.forEach(providerConfig => {
            try {
                providers.push(ProviderFactory.create(providerConfig));
            } catch (error) {
                console.error(error);
            }
        });
        return providers;
    }
}