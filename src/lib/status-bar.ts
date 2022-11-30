import { MarkdownString, StatusBarAlignment, StatusBarItem, ThemeColor, window } from "vscode";
import { JobStatus, JobStatusEnum } from "./job";

class StatusBarTooltipCreator {

    private _createItem(jobsStatus: JobStatus): string {
        const projectUrl = jobsStatus.projectUrl;
        const projectName = jobsStatus.projectName;
        const icon = this._getItemIcon(jobsStatus);
        return `<div>$(${icon}) <a href="${projectUrl}">${projectName}</a></div>`;
    }

    private _getItemIcon(jobsStatus: JobStatus): string {
        let color = '';
        switch (jobsStatus.status) {
            case JobStatusEnum.failure:
                color = 'notebook-state-error';
                break;
            case JobStatusEnum.notInitialized:
                color = 'notebook-stop';
                break;
            case JobStatusEnum.success:
                color = 'notebook-state-success';
                break;
        }
        return color;
    }

    public create(jobsStatuses: JobStatus[]): MarkdownString {
        const tooltip = new MarkdownString();
        tooltip.supportHtml = true;
        tooltip.supportThemeIcons = true;
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

    private _getSuccessJobSStatuses(jobsStatuses: JobStatus[]): JobStatus[] {
        return jobsStatuses.filter(jobsStatus => jobsStatus.status === JobStatusEnum.success);
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

    private _getBackgroundColor(jobsStatuses: JobStatus[]): ThemeColor | undefined {
        let color;
        const successJobSStatuses = this._getSuccessJobSStatuses(jobsStatuses);
        if (successJobSStatuses.length < jobsStatuses.length) {
            color = new ThemeColor('statusBarItem.warningBackground');
        }
        return color;
    }

    constructor() {
        this._initializeStatusBarItem();
    }

    public setText(text: string): void {
        this._statusBarItem.text = text;
    }

    public reset(): void {
        this._statusBarItem.tooltip = undefined;
        this._statusBarItem.backgroundColor = undefined;
    }

    public actualizeStatusByJobsStatuses(jobsStatuses: JobStatus[]): void {
        const successJobSStatuses = this._getSuccessJobSStatuses(jobsStatuses);
        this.setText(`${successJobSStatuses.length} successful of ${jobsStatuses.length}`);
        this._statusBarItem.tooltip = this._prepareToolTip(jobsStatuses);
        this._statusBarItem.backgroundColor = this._getBackgroundColor(jobsStatuses);
    }

    public dispose(): void {
        this._statusBarItem.dispose();
    }
}