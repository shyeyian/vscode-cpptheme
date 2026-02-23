// @ts-check

const child_process = require('child_process')
const fs            = require('fs')
const path          = require('path')
const util          = require('util')

async function main() {
    await updateColor()
    await updateIcon()
    await updateLocale()
}

async function updateColor() {
    // Update color/light.json
    const darkJson  = (await fs.promises.readFile(path.join('color', 'dark.json'))).toString()
    const lightJson = darkJson.replace(/#[0-9a-f]{6}/, color => {
        return new Map([
            ["#000000", "#ffffff"],
            ["#202020", "#f0f0f0"],
            ["#404040", "#e0e0e0"],
            ["#606060", "#d0d0d0"],
            ["#808080", "#c0c0c0"],
            ["#ffffff", "#000000"]
        ]).get(color) ?? color
    })
    await fs.promises.writeFile(path.join('color', 'light.json'), lightJson)
}

async function updateIcon() {
    try {
        await _execFile('npm', ['install', '@vscode/codicons', '--prefix', '.tmp'])
        await fs.promises.copyFile(
            path.join('.tmp', 'node_modules', '@vscode', 'codicons','dist', 'codicon.ttf'), 
            path.join('icon', 'codicon.ttf')
        )
    } finally {
        await fs.promises.rm('.tmp', {recursive: true, force: true})
    }
}

async function updateLocale() {
    try {
        await _execFile('git', ['clone', 'https://github.com/microsoft/vscode-loc', '.tmp', '--depth', '1'])
        for await (const diffFile of _recursiveIterateDir('locale'))
            if (diffFile.endsWith('.diff.json')) {
                console.log(diffFile)
                const toFile   = diffFile.replace(/\.diff\.json$/, '.json')
                console.log(toFile)
                const fromFile = path.join('.tmp', 'i18n', 'vscode-language-pack-zh-hans', 'translations', path.relative('locale', toFile))
                console.log(fromFile)
                const fromJson = JSON.parse((await fs.promises.readFile(fromFile)).toString())
                const diffJson = JSON.parse((await fs.promises.readFile(diffFile)).toString())
                const toJson   = _recursiveUpdateJson(fromJson, diffJson)
                await fs.promises.writeFile(toFile, JSON.stringify(toJson, null, 4))
            }
    } finally {
        await fs.promises.rm('.tmp', {recursive: true, force: true})
    }
}



/** @typedef {Record<string, any>} _Json */

const _execFile = util.promisify(child_process.execFile)

/**
 * @param {string} dir
 * @returns {AsyncIterable<string>} 
 */
async function* _recursiveIterateDir(dir) {
    for await (const entry of await fs.promises.opendir(dir))
        if (entry.isFile())
            yield path.join(dir, entry.name)
        else if (entry.isDirectory())
            for await (const subfile of _recursiveIterateDir(path.join(dir, entry.name)))
                yield subfile
}

/**
 * @param {_Json} from
 * @param {_Json} diff
 * @returns {_Json}
 */
function _recursiveUpdateJson(from, diff) {
    const to = {...from}
    for (const [key, value] of Object.entries(diff))
        if (typeof value == 'string')
            to[key] = value
        else
            to[key] = _recursiveUpdateJson(from[key], value)
    return to
}



main()