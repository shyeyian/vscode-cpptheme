let child_process = require("child_process")
let fs = require("fs")

child_process.execSync("git pull")
try {
    child_process.execSync("git add .")
    child_process.execSync("git commit -m update")
}
catch (error) { 
    // pass
}
child_process.execSync(`vsce publish patch --pat ${fs.readFileSync("vsce-token.txt")}`)
child_process.execSync("git push")