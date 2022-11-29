import { WorkspaceConfiguration } from "vscode";
import { ProviderConfig, ProviderType } from "./config";
import { Job, JobStatus, JobStatusResponse } from "./job";

export interface Provider {
    id: number;
    name?: string;
    type: ProviderType;

    getJobStatus(job: Job): Promise<JobStatusResponse>
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

    public async getJobStatus(job: Job): Promise<JobStatusResponse> {
        return Promise.resolve({
            status: JobStatus.success
        });
    }
}

export class JenkinsProvider extends BaseProvider {

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