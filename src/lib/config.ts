export enum ProviderType {
    jenkins = 0
}

export interface ProviderConfig {
    id: string;
    name: string;
    login: string;
    password: string;
    serviceUrl: string;
    type: ProviderType;
}

export interface JobConfig {
    providerId: string;
}

export interface Config {
    providers: ProviderConfig[];
    jobs: JobConfig[];
}