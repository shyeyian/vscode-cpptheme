// @ts-check

const process = require('process')
const vscode  = require('vscode')

/**
 * @param {vscode.ExtensionContext} context 
 * @returns {Promise<void>}
 */
async function rewriteUserKeybindings(context) {
    if (vscode.env.remoteName != undefined) {
        await vscode.window.showErrorMessage('not available in remote mode')
        return
    }
    await vscode.commands.executeCommand('workbench.action.openGlobalKeybindingsFile')
    const defaultKeybindingsFile = vscode.Uri.parse('vscode://defaultsettings/keybindings.json')
    const updateKeybindingsFile  = vscode.Uri.joinPath(context.extensionUri, 'contribute', 'keybinding', `${process.platform}-update.json`)
    const userKeybindingFile     = vscode.window.activeTextEditor?.document.uri
    let   defaultKeybindingsJson
    let   updateKeybindingsJson
    let   userKeyBindingJson
    if (userKeybindingFile == undefined)
        throw new Error('failed to open user keybindings.json')
    try {
        defaultKeybindingsJson = JSON.parse((await vscode.workspace.fs.readFile(defaultKeybindingsFile)).toString().replaceAll(/\/\/.*$/gm, ''))
    } catch (error) {
        throw new Error(`failed to parse json file (with file = ${defaultKeybindingsFile})`, {cause: error})
    }
    try {
        updateKeybindingsJson = JSON.parse((await vscode.workspace.fs.readFile(updateKeybindingsFile)).toString().replaceAll(/\/\/.*$/gm, ''))
    } catch (error) {
        throw new Error(`failed to parse json file (with file = ${updateKeybindingsFile})`, {cause: error})
    }
    const resetDefaultKeybindingJson = []
    for (const keybinding of defaultKeybindingsJson)
        if (keybinding.key.includes('+') || keybinding.key.match(/f\d+/)) {
            resetDefaultKeybindingJson.push(keybinding)
            resetDefaultKeybindingJson.at(-1).command = '-' + resetDefaultKeybindingJson.at(-1).command
        }
    userKeyBindingJson = resetDefaultKeybindingJson.concat(updateKeybindingsJson)
    await vscode.workspace.fs.writeFile(userKeybindingFile, Buffer.from(JSON.stringify(userKeyBindingJson, null, 4)))
}

/**
 * @param {vscode.ExtensionContext} context
 * @returns {void}
 */
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('rewriteUserKeybindings', async () => {
        await rewriteUserKeybindings(context)
    }))
}

module.exports = {activate}


