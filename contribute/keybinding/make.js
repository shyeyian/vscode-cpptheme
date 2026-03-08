// @ts-check

const fs   = require('fs')
const path = require('path')

async function make() {
    const linuxFile  = path.join('contribute', 'keybinding', 'linux-update.json')
    const darwinFile = path.join('contribute', 'keybinding', 'darwin-update.json')
    const linuxJson  = (await fs.promises.readFile(linuxFile)).toString()
    const darwinJson = linuxJson.replaceAll(/\bctrl\b/g, 'cmd')
    await fs.promises.writeFile(darwinFile, darwinJson)
}

module.exports = {make}