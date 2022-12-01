import {  workspace } from "vscode";

import { CONFIG_PRIMARY_KEY } from "./config";
import { Job, JobsCreator, JobStatus } from "./job";
import { Provider, ProvidersCreator } from "./provider";
import { StatusBar } from "./status-bar";

export class Monitor {
    private _statusBar = new StatusBar();
    private _watching = false;
    private _startTimeOut = 1000;
    private _defaultUpdatePeriodTime = 15000;

    private _startWatch(): void {
        this._watching = true;
        this._watch();
    }

    private _stopWatch(): void {
        this._watching = false;
    }

    private async _watch(): Promise<void> {
        if (!this._watching) {
            return;
        }
        this._statusBar.reset();
        this._statusBar.setText('CI Monitor checking');
        const { providers, jobs } = this.getProvidersAndJobs();
        const jobsStatuses = await this.getJobsStatuses(providers, jobs);
        this._statusBar.actualizeStatusByJobsStatuses(jobsStatuses);  
        setTimeout(() => this._watch(), this._defaultUpdatePeriodTime);
    }

    private getProvidersAndJobs(): { providers: Provider[], jobs: Job[] } {
        const config = workspace.getConfiguration(CONFIG_PRIMARY_KEY);
        const providers = ProvidersCreator.create(config);
        const jobs = JobsCreator.create(config);
        return { providers, jobs };
    }

    private async getJobsStatuses(providers: Provider[], jobs: Job[]): Promise<JobStatus[]> {
        const jobsStatuses: JobStatus[] = [];
        await Promise.all(providers.map(async (provider) => {
            const providerJobs = jobs.filter(job => job.providerId = provider.id);
            await Promise.all(providerJobs.map(async (providerJob) => {
                const jobStatus = await provider.getJobStatus(providerJob);
                jobsStatuses.push(jobStatus);
            }));
        }));
        return jobsStatuses;
    }

    constructor() {
        setTimeout(() => this._startWatch(), this._startTimeOut);
    }

    public dispose(): void {
        this._stopWatch();
        this._statusBar.dispose();
    }
}