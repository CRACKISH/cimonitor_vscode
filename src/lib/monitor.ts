import { StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { CONFIG_PRIMARY_KEY } from "./config";
import { Job, JobsCreator, JobStatusResponse } from "./job";
import { Provider, ProvidersCreator } from "./provider";

export class Monitor {
    private _statusBarItem!: StatusBarItem;
    private _watching = false;
    private _startTimeOut = 1000;
    private _defaultUpdatePeriodTime = 10000;

    private _initializeStatusBarItem(): void {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = 'initialize';
        this._statusBarItem.show();
    }

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
        this._statusBarItem.text = 'checking jobs statuses';
        const { providers, jobs } = this.getProvidersAndJobs();
        const jobsStatuses = await this.getJobsStatuses(providers, jobs);
        this.actualizeStatusBarItem(jobsStatuses);       
        setTimeout(() => this._watch(), this._defaultUpdatePeriodTime);
    }

    private getProvidersAndJobs(): { providers: Provider[], jobs: Job[] } {
        const config = workspace.getConfiguration(CONFIG_PRIMARY_KEY);
        const providers = ProvidersCreator.create(config);
        const jobs = JobsCreator.create(config);
        return { providers, jobs };
    }

    private async getJobsStatuses(providers: Provider[], jobs: Job[]): Promise<JobStatusResponse[]> {
        const jobsStatuses: JobStatusResponse[] = [];
        await Promise.all(providers.map(async (provider) => {
            const providerJobs = jobs.filter(job => job.providerId = provider.id);
            await Promise.all(providerJobs.map(async (providerJob) => {
                const jobStatus = await provider.getJobStatus(providerJob);
                jobsStatuses.push(jobStatus);
            }));
        }));
        return jobsStatuses;
    }

    private actualizeStatusBarItem(jobsStatuses: JobStatusResponse[]): void {
        this._statusBarItem.text = 'all good ' + jobsStatuses.length;
    }

    constructor() {
        this._initializeStatusBarItem();
        setTimeout(() => this._startWatch(), this._startTimeOut);
    }

    public dispose(): void {
        this._stopWatch();
        this._statusBarItem.dispose();
    }
}