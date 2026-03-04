// @ts-check

const vscode             = require('vscode')
const keybinding_rewrite = require('../contribute/keybinding/rewrite')

/** 
 * @param {vscode.ExtensionContext} context
 * @returns {void}
 */
function activate(context) {
    keybinding_rewrite.activate(context)
}

module.exports = {activate}
