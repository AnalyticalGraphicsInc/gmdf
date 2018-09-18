'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';

function extractFromGltf() : any {
    if (vscode.window.activeTextEditor === undefined) {
        vscode.window.showErrorMessage('Document too large, or no editor selected.');
        return;
    }

    let glTF : any;
    let gmdf : any = {};
    let rootArticulations : Array<any> = [];
    let rootSolarPanelGroups : Array<any> = [];

    try {
        glTF = JSON.parse(vscode.window.activeTextEditor.document.getText());
    } catch (ex) {
        vscode.window.showErrorMessage('Error parsing this document.  Please make sure it is valid JSON.');
    }

    let rootExtensions = glTF.extensions;
    if (rootExtensions) {
        if (rootExtensions.AGI_articulations) {
            gmdf.AGI_articulations = rootExtensions.AGI_articulations;
            rootArticulations = gmdf.AGI_articulations.articulations || [];
        }
        if (rootExtensions.AGI_stk_metadata) {
            gmdf.AGI_stk_metadata = rootExtensions.AGI_stk_metadata;
            rootSolarPanelGroups = gmdf.AGI_stk_metadata.solarPanelGroups || [];
        }
    }

    if (glTF.nodes) {
        let nodeIndex = -1;
        for (let node of glTF.nodes) {
            ++nodeIndex;
            if (!node.name) {
                node.name = 'Node_' + nodeIndex;
            }

            if (node && node.extensions) {
                let nodeArticulations = node.extensions.AGI_articulations;
                if (nodeArticulations) {
                    if (!gmdf.AGI_articulations) {
                        gmdf.AGI_articulations = {};
                    }

                    if (nodeArticulations.isAttachPoint) {
                        if (!gmdf.AGI_articulations.attachPoints) {
                            gmdf.AGI_articulations.attachPoints = [];
                        }
                        gmdf.AGI_articulations.attachPoints.push(node.name);
                    }

                    if (nodeArticulations.articulationName) {
                        let articulation = rootArticulations.filter(e => e.name === nodeArticulations.articulationName);
                        if (articulation.length !== 1) {
                            return {
                                error: 'Articulation not found: ' + nodeArticulations.articulationName
                            };
                        }
                        if (!articulation[0].modelNodes) {
                            articulation[0].modelNodes = [];
                        }
                        articulation[0].modelNodes.push(node.name);
                    }
                }

                let nodeMetadata = node.extensions.AGI_stk_metadata;
                if (nodeMetadata) {
                    if (!gmdf.AGI_stk_metadata) {
                        gmdf.AGI_stk_metadata = {};
                    }

                    if (nodeMetadata.noObscuration) {
                        if (!gmdf.AGI_stk_metadata.noObscurationNodes) {
                            gmdf.AGI_stk_metadata.noObscurationNodes = [];
                        }
                        gmdf.AGI_stk_metadata.noObscurationNodes.push(node.name);
                    }

                    if (nodeMetadata.solarPanelGroupName) {
                        let solarPanelGroup = rootSolarPanelGroups.filter(e => e.name === nodeMetadata.solarPanelGroupName);
                        if (solarPanelGroup.length !== 1) {
                            return {
                                error: 'Solar Panel Group not found: ' + nodeMetadata.solarPanelGroupName
                            };
                        }
                        if (!solarPanelGroup[0].modelNodes) {
                            solarPanelGroup[0].modelNodes = [];
                        }
                        solarPanelGroup[0].modelNodes.push(node.name);
                    }
                }
            }
        }
    }

    return gmdf;
}

async function saveGmdf(gmdf : any) : Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        return;
    }

    let gmdfPath = activeTextEditor.document.uri.fsPath.replace('.gltf', '.gmdf');
    const options: vscode.SaveDialogOptions = {
        defaultUri: vscode.Uri.file(gmdfPath),
        filters: {
            'gmdf': ['gmdf'],
            'All files': ['*']
        }
    };
    let uri = await vscode.window.showSaveDialog(options);
    if (uri !== undefined) {
        try {
            const tabSize = activeTextEditor.options.tabSize as number;
            const space = activeTextEditor.options.insertSpaces ? (new Array(tabSize + 1).join(' ')) : '\t'
            let newJson = JSON.stringify(gmdf, null, space) + '\n';

            fs.writeFileSync(uri.fsPath, newJson);

            vscode.window.showInformationMessage('gmdf exported as: ' + uri.fsPath);
        } catch (ex) {
            vscode.window.showErrorMessage(ex.toString());
        }
    }
}

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('gmdf.extractFromGltf', () => {
        let gmdf = extractFromGltf();
        if (gmdf) {
            if (gmdf.error) {
                vscode.window.showErrorMessage(gmdf.error);
            } else {
                saveGmdf(gmdf);
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('gmdf.injectIntoGltf', () => {
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!  From GMDF.');
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
