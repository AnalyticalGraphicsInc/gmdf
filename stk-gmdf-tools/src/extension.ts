'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';

function isEmptyJson(obj: any): boolean {
    for (const x in obj) {
        if (obj[x] !== undefined) {
            return false;
        }
    }
    return true;
}

function extractFromGltf(): any {
    if (vscode.window.activeTextEditor === undefined) {
        vscode.window.showErrorMessage('Document too large, or no editor selected.');
        return;
    }

    let glTF: any;
    let gmdf: any = {};
    let rootArticulations: Array<any> = [];
    let rootSolarPanelGroups: Array<any> = [];

    try {
        glTF = JSON.parse(vscode.window.activeTextEditor.document.getText());
    } catch (ex) {
        vscode.window.showErrorMessage('Error parsing this document.  Please make sure it is valid JSON.');
        return;
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

async function saveGmdf(gmdf: any): Promise<void> {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        return;
    }

    let gmdfPath = activeTextEditor.document.uri.fsPath.replace(/\.gltf$/, '.gmdf');
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
            const space = activeTextEditor.options.insertSpaces ? (new Array(tabSize + 1).join(' ')) : '\t';
            let newJson = JSON.stringify(gmdf, null, space) + '\n';

            fs.writeFileSync(uri.fsPath, newJson);

            vscode.commands.executeCommand('vscode.open', uri);
            vscode.window.showInformationMessage('gmdf exported as: ' + uri.fsPath);
        } catch (ex) {
            vscode.window.showErrorMessage(ex.toString());
        }
    }
}

export function removeEmbeddedData(glTF: any): void {
    // Destroy old embedded node metadata.
    if (glTF.nodes) {
        for (let node of glTF.nodes) {
            if (node.extensions) {
                if (node.extensions.AGI_articulations) {
                    node.extensions.AGI_articulations = undefined;
                }
                if (node.extensions.AGI_stk_metadata) {
                    node.extensions.AGI_stk_metadata = undefined;
                }
                if (isEmptyJson(node.extensions)) {
                    node.extensions = undefined;
                }
            }
        }
    }

    // Destroy old embedded root metadata.
    if (glTF.extensions) {
        if (glTF.extensions.AGI_articulations) {
            glTF.extensions.AGI_articulations = undefined;
        }
        if (glTF.extensions.AGI_stk_metadata) {
            glTF.extensions.AGI_stk_metadata = undefined;
        }
        if (isEmptyJson(glTF.extensions)) {
            glTF.extensions = undefined;
        }
    }

    if (glTF.extensionsUsed) {
        glTF.extensionsUsed = glTF.extensionsUsed.filter((e : string) => e !== 'AGI_articulations' && e !== 'AGI_stk_metadata');
        if (glTF.extensionsUsed.length === 0) {
            glTF.extensionsUsed = undefined;
        }
    }

    if (glTF.extensionsRequired) {
        glTF.extensionsRequired = glTF.extensionsRequired.filter((e : string) => e !== 'AGI_articulations' && e !== 'AGI_stk_metadata');
        if (glTF.extensionsRequired.length === 0) {
            glTF.extensionsRequired = undefined;
        }
    }
}

function getNodesByName(name: string, glTF: any): Array<any> {
    let result: Array<any> = [];
    if (glTF.nodes) {
        let nodeIndex = -1;
        for (let node of glTF.nodes) {
            ++nodeIndex;
            const nodeName = node.name || ('Node_' + nodeIndex);

            // There is allowed to be more than one matching node.
            if (nodeName === name) {
                result.push(node);
            }
        }
    }
    return result;
}

async function injectIntoGltf(textEditor: vscode.TextEditor, textEditorEdit: vscode.TextEditorEdit): Promise<void> {
    let glTF: any;
    let gmdf: any;
    let oldText: string;

    try {
        oldText = textEditor.document.getText();
        glTF = JSON.parse(oldText);
    } catch (ex) {
        vscode.window.showErrorMessage('Error parsing this document.  Please make sure it is valid JSON.');
        return;
    }

    let gmdfPath = textEditor.document.uri.fsPath.replace(/\.gltf$/i, '.gmdf');
    if (!fs.existsSync(gmdfPath)) {
        vscode.window.showErrorMessage('Can\'t find .gmdf file for this model.');
        return;
    }

    try {
        gmdf = JSON.parse(fs.readFileSync(gmdfPath).toString());
    } catch (ex) {
        vscode.window.showErrorMessage('Error loading or parsing .gmdf file.');
        return;
    }

    removeEmbeddedData(glTF);

    let useArticulations: boolean = false;
    let useStkMetadata: boolean = false;

    if (gmdf.AGI_articulations) {
        // Assign attach points
        if (gmdf.AGI_articulations.attachPoints) {
            for (let attachPointName of gmdf.AGI_articulations.attachPoints) {
                getNodesByName(attachPointName, glTF).forEach(node => {
                    if (!node.extensions) {
                        node.extensions = {};
                    }
                    if (!node.extensions.AGI_articulations) {
                        node.extensions.AGI_articulations = {};
                    }
                    node.extensions.AGI_articulations.isAttachPoint = true;
                    useArticulations = true;
                });
            }
        }

        // Assign articulations
        if (gmdf.AGI_articulations.articulations) {
            useArticulations = true;
            if (!glTF.extensions) {
                glTF.extensions = {};
            }
            if (!glTF.extensions.AGI_articulations) {
                glTF.extensions.AGI_articulations = {};
            }

            let rootArticulations: Array<any> = gmdf.AGI_articulations.articulations;
            // Iterate the root list of articulations.
            rootArticulations.forEach(articulation => {
                // Iterate the list of node names assigned to this articulation.
                articulation.modelNodes.forEach((nodeName : string) => {
                    // Iterate the glTF node instances that match any one given node name.
                    getNodesByName(nodeName, glTF).forEach(node => {
                        if (!node.extensions) {
                            node.extensions = {};
                        }
                        if (!node.extensions.AGI_articulations) {
                            node.extensions.AGI_articulations = {};
                        }
                        node.extensions.AGI_articulations.articulationName = articulation.name;
                    });
                });
                articulation.modelNodes = undefined;
            });

            glTF.extensions.AGI_articulations.articulations = rootArticulations;
        }
    }

    if (gmdf.AGI_stk_metadata) {
        // Assign Solar Panel Groups
        if (gmdf.AGI_stk_metadata.solarPanelGroups) {
            useStkMetadata = true;
            if (!glTF.extensions) {
                glTF.extensions = {};
            }
            if (!glTF.extensions.AGI_stk_metadata) {
                glTF.extensions.AGI_stk_metadata = {};
            }

            let rootSolarPanelGroups: Array<any> = gmdf.AGI_stk_metadata.solarPanelGroups;
            // Iterate the root list of solar panel groups.
            rootSolarPanelGroups.forEach(solarPanelGroup => {
                // Iterate the list of node names assigned to this group.
                solarPanelGroup.modelNodes.forEach((nodeName : string) => {
                    // Iterate the glTF node instances that match any one given node name.
                    getNodesByName(nodeName, glTF).forEach(node => {
                        if (!node.extensions) {
                            node.extensions = {};
                        }
                        if (!node.extensions.AGI_stk_metadata) {
                            node.extensions.AGI_stk_metadata = {};
                        }
                        node.extensions.AGI_stk_metadata.solarPanelGroupName = solarPanelGroup.name;
                    });
                });
                solarPanelGroup.modelNodes = undefined;
            });

            glTF.extensions.AGI_stk_metadata.solarPanelGroups = rootSolarPanelGroups;
        }

        // Assign no-obscuration nodes
        if (gmdf.AGI_stk_metadata.noObscurationNodes) {
            for (let nodeName of gmdf.AGI_stk_metadata.noObscurationNodes) {
                getNodesByName(nodeName, glTF).forEach(node => {
                    if (!node.extensions) {
                        node.extensions = {};
                    }
                    if (!node.extensions.AGI_stk_metadata) {
                        node.extensions.AGI_stk_metadata = {};
                    }
                    node.extensions.AGI_stk_metadata.noObscuration = true;
                    useStkMetadata = true;
                });
            }
        }
    }

    if (useArticulations) {
        if (!glTF.extensionsUsed) {
            glTF.extensionsUsed = [];
        }
        // This was filtered out earlier, so it won't be a duplicate.
        glTF.extensionsUsed.push('AGI_articulations');
    }

    if (useStkMetadata) {
        if (!glTF.extensionsUsed) {
            glTF.extensionsUsed = [];
        }
        // This was filtered out earlier, so it won't be a duplicate.
        glTF.extensionsUsed.push('AGI_stk_metadata');
    }

    const tabSize = textEditor.options.tabSize as number;
    const space = textEditor.options.insertSpaces ? (new Array(tabSize + 1).join(' ')) : '\t';
    let newJson = JSON.stringify(glTF, null, space) + '\n';

    const fullRange = new vscode.Range(
        textEditor.document.positionAt(0),
        textEditor.document.positionAt(oldText.length - 1)
    );

    await textEditor.edit(editBuilder => {
        editBuilder.replace(fullRange, newJson);
    });
}

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('gmdf.extractFromGltf', async () => {
        let gmdf = extractFromGltf();
        if (gmdf) {
            if (gmdf.error) {
                vscode.window.showErrorMessage(gmdf.error);
            } else {
                try {
                    await saveGmdf(gmdf);
                } catch (ex) {
                    vscode.window.showErrorMessage(ex.toString());
                }
            }
        }
    }));

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gmdf.injectIntoGltf',
        async (textEditor, textEditorEdit) => {
            try {
                await injectIntoGltf(textEditor, textEditorEdit);
            } catch (ex) {
                vscode.window.showErrorMessage(ex.toString());
            }
        }
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
