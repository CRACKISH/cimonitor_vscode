import { MarkdownString, StatusBarAlignment, StatusBarItem, window } from "vscode";
import { JobStatus, JobStatusEnum } from "./job";

class StatusBarTooltipCreator {

    private _createItem(jobsStatus: JobStatus): string {
        const projectUrl = jobsStatus.projectUrl;
        const projectName = jobsStatus.projectName;
        const color = this._getItemColorAttributeValue(jobsStatus);
        return `<div style="background-color: ${color};"><a href="${projectUrl}">${projectName}</a></div>`;
    }

    private _getItemColorAttributeValue(jobsStatus: JobStatus): string {
        let color = 'inherited';
        switch (jobsStatus.status) {
            case JobStatusEnum.failure:
                color = 'red';
                break;
            case JobStatusEnum.notInitialized:
                color = 'gray';
                break;
            case JobStatusEnum.success:
                color = 'green';
                break;
        }
        return color;
    }

    public create(jobsStatuses: JobStatus[]): MarkdownString {
        const tooltip = new MarkdownString();
        tooltip.isTrusted = true;
        tooltip.supportHtml = true;
        jobsStatuses.forEach(jobsStatus => tooltip.appendMarkdown(this._createItem(jobsStatus)));
        return tooltip;
    }
}

export class StatusBar {
    private _statusBarItem!: StatusBarItem;
    private _tooltipCreator = new StatusBarTooltipCreator();

    private _initializeStatusBarItem(): void {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = 'CI Monitor initialization';
        this._statusBarItem.show();
    }

    private _prepareToolTip(jobsStatuses: JobStatus[]): MarkdownString {
        const sortedJobsStatuses = this._getSortedJobsStatusesByStatus(jobsStatuses);
        return this._tooltipCreator.create(sortedJobsStatuses);
    }

    private _getSortedJobsStatusesByStatus(jobsStatuses: JobStatus[]): JobStatus[] {
        return jobsStatuses.sort((jobsStatus1, jobsStatuses2) => {
            return jobsStatus1.status === jobsStatuses2.status
                ? 0
                : jobsStatus1.status !== JobStatusEnum.success ? -1 : 1;
        });
    }

    constructor() {
        this._initializeStatusBarItem();
    }

    public setText(text: string): void {
        this._statusBarItem.text = text;
    }

    public actualizeStatusByJobsStatuses(jobsStatuses: JobStatus[]): void {
        const successJobs = jobsStatuses.filter(jobsStatus => jobsStatus.status === JobStatusEnum.success);
        this.setText(`${successJobs.length} successful of ${jobsStatuses.length}`);
        this._statusBarItem.tooltip = this._prepareToolTip(jobsStatuses);
    }

    public dispose(): void {
        this._statusBarItem.dispose();
    }
}