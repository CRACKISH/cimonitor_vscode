import { ProviderConfig, ProviderType } from "../config/config";
import { Job, JobStatus } from "../job/job";

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

    public abstract getJobStatus(job: Job): Promise<JobStatus>;
}