// @ts-check

const fs   = require('fs')
const path = require('path')

async function make() {
    // Update color/light.json
    const darkJson  = (await fs.promises.readFile(path.join('contribute', 'theme', 'cpptheme-dark.json'))).toString()
    const lightJson = darkJson
        .replaceAll(/\bdark\b/g, 'light')
        .replaceAll(/#[0-9a-f]{6}/g, darkColor => {
            const lightColor = new Map([
                ["#000000", "#ffffff"],
                ["#202020", "#dfdfdf"],
                ["#404040", "#bfbfbf"],
                ["#606060", "#9f9f9f"],
                ["#808080", "#7f7f7f"],
                ["#ffffff", "#000000"],

                ["#ff0000", "#ff0000"],
                ["#ff8000", "#ff8000"],
                ["#d0d000", "#d0d000"],
                ["#00a000", "#00a000"],
                ["#0080ff", "#0080ff"],
                ["#c000ff", "#c000ff"],
                ["#b4b4b4", "#000000"]
            ]).get(darkColor)
            if (lightColor != undefined)
                return lightColor
            else
                throw new Error(`color ${darkColor} is not mapped`)
        })
    await fs.promises.writeFile(path.join('contribute', 'theme', 'cpptheme-light.json'), lightJson)
}

module.exports = {make}