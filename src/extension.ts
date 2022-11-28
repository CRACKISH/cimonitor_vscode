import * as vscode from 'vscode';
import { Monitor } from './lib';

export function activate(context: vscode.ExtensionContext) {
	const monitor = new Monitor();
	context.subscriptions.push(monitor);
}

export function deactivate() {}
