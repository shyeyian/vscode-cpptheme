// @ts-check

const child_process           = require('child_process')
const fs                      = require('fs')
const util                    = require('util')
const keybinding_make         = require('./contribute/keybinding/make')
const localization_make       = require('./contribute/localization/make')
const product_icon_theme_make = require('./contribute/product-icon-theme/make')
const theme_make              = require('./contribute/theme/make')

async function install() {
    // Make extension
    await keybinding_make        .make()
    await localization_make      .make()
    await product_icon_theme_make.make()
    await theme_make             .make()

    // Install extension
    child_process.execSync('echo $PATH')
    try {
        await util.promisify(child_process.execFile)('vsce', ['package', '-o', 'cpptheme.vsix'])
        await util.promisify(child_process.execFile)('code', ['--install-extension', 'cpptheme.vsix'])
    } finally { 
        await fs.promises.rm('cpptheme.vsix', {force: true})
    }
}

install()