import { StatusBarAlignment, StatusBarItem, window, workspace, WorkspaceConfiguration } from "vscode";
import { Job, JobsCreator, JobStatus } from "./job";
import { Provider, ProvidersCreator } from "./provider";

export class Monitor {
    private _statusBarItem!: StatusBarItem;
    private _config!: WorkspaceConfiguration;
    private _watching = false;
    private _defaultUpdatePeriodTime = 10000;

    private _initializeStatusBarItem(): void {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = 'initialize';
    }

    private _initializeConfig(): void {
        this._config = workspace.getConfiguration('cimonitor');
    }

    private _startWatch(): void {
        this._watching = true;
        this._watch();
        this._statusBarItem.show();
    }

    private _stopWatch(): void {
        this._watching = false;
    }

    private async _watch(): Promise<void> {
        if (!this._watching) {
            return;
        }
        this._statusBarItem.text = 'checking jobs statuses';
        const providers = ProvidersCreator.create(this._config);
        const jobs = JobsCreator.create(this._config);
        const jobsStatuses = await this.getJobsStatuses(providers, jobs);
        this.actualizeStatusBarItem(jobsStatuses);       
        setTimeout(() => this._watch(), this._defaultUpdatePeriodTime);
    }

    private async getJobsStatuses(providers: Provider[], jobs: Job[]): Promise<JobStatus[]> {
        const jobsStatuses: JobStatus[] = [];
        providers.forEach(provider => {
            const providerJobs = jobs.filter(job => job.providerId = provider.id);
            providerJobs.forEach(async (providerJob) => {
                const jobStatus = await provider.getJobStatus(providerJob);
                jobsStatuses.push(jobStatus);
            });
        });
        return jobsStatuses;
    }

    private actualizeStatusBarItem(jobsStatuses: JobStatus[]): void {
        this._statusBarItem.text = 'all good';
    }

    constructor() {
        this._initializeConfig();
        this._initializeStatusBarItem();
        this._startWatch();
    }

    public dispose(): void {
        this._stopWatch();
        this._statusBarItem.dispose();
    }
}