// @ts-check

const child_process           = require('child_process')
const fs                      = require('fs')
const util                    = require('util')
const keybinding_make         = require('./contribute/keybinding/make')
const localization_make       = require('./contribute/localization/make')
const product_icon_theme_make = require('./contribute/product-icon-theme/make')
const theme_make              = require('./contribute/theme/make')

async function upload() {
    // Make extension
    await keybinding_make        .make()
    await localization_make      .make()
    await product_icon_theme_make.make()
    await theme_make             .make()

    // Git pull
    await util.promisify(child_process.execFile)('git', ['pull'])

    // Git commit
    try {
        await util.promisify(child_process.execFile)('git', ['add', '.'])
        await util.promisify(child_process.execFile)('git', ['commit', '-m', 'update'])
    } catch (error) { }

    // Vsce upload
    await util.promisify(child_process.execFile)('vsce', ['publish', 'patch', '--pat', (await fs.promises.readFile('vsce-token.txt')).toString()])

    // Git push
    await util.promisify(child_process.execFile)('git', ['push'])
}

upload()