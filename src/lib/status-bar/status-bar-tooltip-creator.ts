import { MarkdownString } from 'vscode';

import { JobStatus, JobStatusEnum } from '../job';

export class StatusBarTooltipCreator {

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