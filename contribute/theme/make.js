// @ts-check

const fs   = require('fs')
const path = require('path')

async function make() {
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

module.exports = {make}