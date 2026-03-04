// @ts-check

const child_process           = require('child_process')
const fs                      = require('fs')
const util                    = require('util')
const keybinding_make         = require('./contribute/keybinding/make.js')
const localization_make       = require('./contribute/localization/make.js')
const product_icon_theme_make = require('./contribute/product-icon-theme/make.js')
const theme_make              = require('./contribute/theme/make.js')

async function make() {
    console.log('make')
    await keybinding_make        .make()
    await localization_make      .make()
    await product_icon_theme_make.make()
    await theme_make             .make()
}

async function upload() {
    console.log('upload')
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

make()
upload()