// @ts-check

const child_process = require('child_process')
const fs            = require('fs')
const path          = require('path')
const util          = require('util')

async function make() {
    try {
        await util.promisify(child_process.execFile)('npm', ['install', '@vscode/codicons', '--prefix', '.tmp'])
        await fs.promises.copyFile(
            path.join('.tmp', 'node_modules', '@vscode', 'codicons','dist', 'codicon.ttf'), 
            path.join('contribute', 'product-icon-theme', 'codicon.ttf')
        )
    } finally {
        await fs.promises.rm('.tmp', {recursive: true, force: true})
    }
}

module.exports = {make}