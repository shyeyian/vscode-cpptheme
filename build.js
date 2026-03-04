// @ts-check

const child_process = require('child_process')
const fs            = require('fs')
const path          = require('path')
const util          = require('util')

async function main() {
    await updateKeybinding()
    await updateLocalization()
    await updateProductIconTheme()
    await updateTheme()
}

async function updateKeybinding() {
    const linuxFile  = path.join('contribute', 'keybinding', 'linux.update.json')
    const darwinFile = path.join('contribute', 'keybinding', 'darwin.update.json')
    const linuxJson  = (await fs.promises.readFile(linuxFile)).toString()
    const darwinJson = linuxJson.replaceAll(/\bctrl\b/, 'command')
    await fs.promises.writeFile(darwinFile, darwinJson)
}

async function updateLocalization() {
    try {
        await _execFile('git', ['clone', 'https://github.com/microsoft/vscode-loc', '.tmp', '--depth', '1'])
        for await (const toFile of _recursiveIterateDir(path.join('contribute', 'localization')))
            if (toFile.endsWith('.i18n.json')) {
                const fromFile    = path.join('.tmp', 'i18n', 'vscode-language-pack-zh-hans', 'translations', path.relative(path.join('contribute', 'localization'), toFile))
                const replaceFile = toFile.replace(/\.i18n\.json$/, '.i18n.replace.json')
                const updateFile  = toFile.replace(/\.i18n\.json$/, '.i18n.update.json')
                let   fromJson
                let   toJson
                let   replaceJson
                let   updateJson
                try {
                    fromJson = JSON.parse((await fs.promises.readFile(fromFile)).toString())
                } catch (error) {
                    throw new Error(`failed to parse json file ${fromFile}`, {cause: error})
                }
                try {
                    replaceJson = JSON.parse((await fs.promises.readFile(replaceFile)).toString())
                } catch (error) {
                    throw new Error(`failed to parse json file ${replaceFile}`, {cause: error})
                }
                try {
                    updateJson = JSON.parse((await fs.promises.readFile(updateFile)).toString())
                } catch (error) {
                    throw new Error(`failed to parse json file ${updateFile}`, {cause: error})
                }
                toJson = _recursiveReplaceJson(fromJson, replaceJson)
                toJson = _recursiveUpdateJson (toJson,   updateJson)
                await fs.promises.writeFile(toFile, JSON.stringify(toJson, null, 4))
            }
    } finally {
        await fs.promises.rm('.tmp', {recursive: true, force: true})
    }
}

async function updateTheme() {
    // Update color/light.json
    const darkJson  = (await fs.promises.readFile(path.join('contribute', 'theme', 'cpptheme-dark.json'))).toString()
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
    await fs.promises.writeFile(path.join('contribute', 'theme', 'cpptheme-light.json'), lightJson)
}

async function updateProductIconTheme() {
    try {
        await _execFile('npm', ['install', '@vscode/codicons', '--prefix', '.tmp'])
        await fs.promises.copyFile(
            path.join('.tmp', 'node_modules', '@vscode', 'codicons','dist', 'codicon.ttf'), 
            path.join('contribute', 'product-icon-theme', 'codicon.ttf')
        )
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
 * @param {_Json} replace
 * @returns {_Json} 
 */
function _recursiveReplaceJson(from, replace) {
    const to = {...from}
    for (const [toKey, toValue] of Object.entries(to))
        if (typeof toValue == 'string') 
            for (const [replaceKey, replaceValue] of Object.entries(replace))
                to[toKey] = to[toKey].replaceAll(replaceKey, replaceValue)
        else
            to[toKey] = _recursiveReplaceJson(to[toKey], replace)
    return to
}

/**
 * @param {_Json} from
 * @param {_Json} update
 * @returns {_Json}
 */
function _recursiveUpdateJson(from, update) {
    const to = {...from}
    for (const [updateKey, updateValue] of Object.entries(update)) {
        if (!Object.hasOwn(from, updateKey))
            throw new Error(`key ${updateKey} not found`)
        if (typeof to[updateKey] == 'string')
            to[updateKey] = updateValue
        else
            to[updateKey] = _recursiveUpdateJson(to[updateKey], updateValue)
    }
    return to
}



main()