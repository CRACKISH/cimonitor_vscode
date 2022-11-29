import { StatusBarAlignment, StatusBarItem, window } from "vscode";
import { JobStatus, JobStatusEnum } from "./job";

export class StatusBar {
    private _statusBarItem!: StatusBarItem;

    private _initializeStatusBarItem(): void {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = 'CI Monitor initialization';
        this._statusBarItem.show();
    }

    constructor() {
        this._initializeStatusBarItem();
    }

    public setText(text: string): void {
        this._statusBarItem.text = text;
    }

    public actualizeStatusByJobsStatuses(jobsStatuses: JobStatus[]): void {
        const successJobs = jobsStatuses.filter(jobsStatus => jobsStatus.status === JobStatusEnum.success);
        this.setText(`${successJobs.length} successful requests of ${jobsStatuses.length}`);
    }

    public dispose(): void {
        this._statusBarItem.dispose();
    }
}