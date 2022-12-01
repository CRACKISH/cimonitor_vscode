import { MarkdownString, StatusBarAlignment, StatusBarItem, ThemeColor, window } from 'vscode';

import { JobStatus, JobStatusResult } from '../job';
import { StatusBarTooltipCreator } from './status-bar-tooltip-creator';

export class StatusBar {
    private _statusBarItem!: StatusBarItem;
    private _tooltipCreator = new StatusBarTooltipCreator();

    private _initializeStatusBarItem(): void {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = 'CI Monitor initialization';
        this._statusBarItem.show();
    }

    private _getSuccessJobsStatuses(jobsStatuses: JobStatus[]): JobStatus[] {
        return jobsStatuses.filter(jobsStatus => jobsStatus.result === JobStatusResult.success);
    }

    private _prepareToolTip(jobsStatuses: JobStatus[]): MarkdownString {
        const sortedJobsStatuses = this._getSortedJobsStatusesByStatus(jobsStatuses);
        return this._tooltipCreator.create(sortedJobsStatuses);
    }

    private _getSortedJobsStatusesByStatus(jobsStatuses: JobStatus[]): JobStatus[] {
        return jobsStatuses.sort((jobsStatus1, jobsStatuses2) => {
            return jobsStatus1.result === jobsStatuses2.result
                ? 0
                : jobsStatus1.result !== JobStatusResult.success ? -1 : 1;
        });
    }

    private _getBackgroundColor(jobsStatuses: JobStatus[]): ThemeColor | undefined {
        let color;
        const successJobSStatuses = this._getSuccessJobsStatuses(jobsStatuses);
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
        const successJobSStatuses = this._getSuccessJobsStatuses(jobsStatuses);
        this.setText(`${successJobSStatuses.length} successful of ${jobsStatuses.length}`);
        this._statusBarItem.tooltip = this._prepareToolTip(jobsStatuses);
        this._statusBarItem.backgroundColor = this._getBackgroundColor(jobsStatuses);
    }

    public dispose(): void {
        this._statusBarItem.dispose();
    }
}