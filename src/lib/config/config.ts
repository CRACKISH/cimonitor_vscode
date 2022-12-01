export const CONFIG_PRIMARY_KEY = 'cimonitor';

export enum ProviderType {
    jenkins = 0,
    teamCity = 1
}

export interface ProviderConfig {
    id: number;
    name: string;
    login: string;
    password: string;
    serviceUrl: string;
    type: ProviderType;
}

export interface JobConfig {
    id: number;
    key: string;
    name?: string;
    providerId: number;
}

export interface Config {
    providers: ProviderConfig[];
    jobs: JobConfig[];
}