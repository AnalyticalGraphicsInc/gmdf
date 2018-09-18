'use strict';
import * as vscode from 'vscode';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('gmdf.extractFromGltf', () => {
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!  From GMDF.');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('gmdf.injectIntoGltf', () => {
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!  From GMDF.');
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
