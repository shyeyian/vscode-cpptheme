import fs from "fs";
import child_process from "child_process"
import util from "util"
child_process.promises = new Object()
child_process.promises.exec = util.promisify(child_process.exec)

// Update icon/codicon.ttf
try {
    await child_process.promises.exec("git clone https://github.com/microsoft/vscode .tmp --depth 1")
    await fs.promises.copyFile(".tmp/src/vs/base/browser/ui/codicons/codicon/codicon.ttf", "icon/codicon.ttf")
} finally {
   await fs.promises.rm(".tmp", {recursive: true, force: true})
}

// Update locale/**.json
try {
    // Git clone
    await child_process.promises.exec("git clone https://github.com/microsoft/vscode-loc .tmp --depth 1")

    // Update package.json
    let from_package = JSON.parse((await fs.promises.readFile(".tmp/i18n/vscode-language-pack-zh-hans/package.json")).toString())
    let to_package   = JSON.parse((await fs.promises.readFile("package.json")).toString())
    let localizations = from_package["contributes"]["localizations"]
    for (let localization of localizations)
        for (let translation of localization["translations"])
            translation["path"] = translation["path"].replace("translations", "locale")
    to_package["contributes"]["localizations"] = localizations
    await fs.promises.writeFile("package.json", JSON.stringify(to_package, null, 4))

    // Update locale/main.i18n.json
    let main = JSON.parse((await fs.promises.readFile(".tmp/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json")).toString())
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToDecl.label"]               = "转到实现 (implement)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.previewDecl.label"]            = "查看实现 (implement)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["def.title"]                            = "实现 (implement)" 
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["decl.generic.noResults"]               = "未找到实现 (implement)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["decl.noResultWord"]                    = "未找到\"{0}\"的实现 (implement)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToDeclaration.label"]        = "转到声明 (declare)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekDecl.label"]               = "查看声明 (declare)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["decl.title"]                           = "声明 (declare)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToTypeDefinition.label"]     = "转到类型 (type)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekTypeDefinition.label"]     = "查看类型 (type)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["typedef.title"]                        = "类型 (type)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToTypeDefinition.generic.noResults"] = "未找到类型 (type)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToTypeDefinition.noResultWord"]      = "未找到\"{0}\"的类型 (type)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.goToImplementation.label"]     = "转到虚实现 (virtual)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["actions.peekImplementation.label"]     = "查看虚实现 (virtual)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["impl.title"]                           = "虚实现 (virtual)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToImplementation.generic.noResults"] = "未找到虚实现 (virtual)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToImplementation.noResultWord"]      = "未找到\"{0}\"的虚实现 (virtual)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["goToReferences.label"]                 = "转到调用 (call)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["references.action.label"]              = "查看调用 (call)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["ref.title"]                            = "调用 (call)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["references.noGeneric"]                 = "未找到调用 (call)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["references.no"]                        = "未找到\"{0}\"的调用 (call)"
    main["contents"]["vs/editor/contrib/gotoSymbol/browser/goToCommands"]["peek.submenu"]                         = "查看"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title"]            = "查看调用层次结构 (call)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title.incoming"]   = "显示被调用 (called)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution"]["title.outgoing"]   = "显示调用 (call)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["callFrom"]                  = "\"{0}\"的被调用 (called)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["callsTo"]                   = "\"{0}\"的调用 (call)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["empt.callsFrom"]            = "没有被其他函数调用 (called)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyPeek"]["empt.callsTo"]              = "没有调用其他函数 (call)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["tree.aria"]                 = "调用层次结构 (call)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["from"]                      = "被调用 (called)"
    main["contents"]["vs/workbench/contrib/callHierarchy/browser/callHierarchyTree"]["to"]                        = "调用 (call)"
    main["contents"]["vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution"]["title"]            = "查看类型层次结构 (type)"
    for (let key1 of Object.keys(main["contents"]))
        for (let key2 of Object.keys(main["contents"][key1]))
            main["contents"][key1][key2] = main["contents"][key1][key2]
                .replaceAll("源代码管理", "版本")
                .replaceAll("资源管理器", "文件")
                .replaceAll("运行和调试", "调试")
    await fs.promises.writeFile("locale/main.i18n.json", JSON.stringify(main, null, 4))

    // Update locale/extensions/*.i18n.json
    for await (let file of await fs.promises.opendir(".tmp/i18n/vscode-language-pack-zh-hans/translations/extensions"))
        if (file.name == "vscode.git.i18n.json") {
            let git = JSON.parse((await fs.promises.readFile(`.tmp/i18n/vscode-language-pack-zh-hans/translations/extensions/${file.name}`)).toString())
			git["contents"]["package"]["command.commitSigned"]               = "提交(署名)"
			git["contents"]["package"]["command.commitSignedNoVerify"]       = "提交(署名，不验证)"
			git["contents"]["package"]["command.commitStagedSigned"]         = "提交已暂存文件(署名)"
			git["contents"]["package"]["command.commitStagedSignedNoVerify"] = "提交已暂存内容(署名，不验证)"
			git["contents"]["package"]["command.commitAllSigned"]            = "全部提交(署名)"
			git["contents"]["package"]["command.commitAllSignedNoVerify"]    = "全部提交(署名，不验证)"
			git["contents"]["package"]["command.checkoutDetached"]           = "签出到(分离)…"
			git["contents"]["package"]["command.graphCheckoutDetached"]      = "签出(分离)"
			git["contents"]["package"]["{0} Checkout detached..."]           = "{0} 签出(分离)…"
        }
        else if (file.name == "vscode.references-view.i18n.json") {
            let references_view = JSON.parse((await fs.promises.readFile(`.tmp/i18n/vscode-language-pack-zh-hans/translations/extensions/${file.name}`)).toString())
            references_view["contents"]["package"]["cmd.references-view.findReferences"]      = "搜索"
            references_view["contents"]["package"]["cmd.references-view.findImplementations"] = "搜索虚实现 (virtual)"
            references_view["contents"]["package"]["cmd.references-view.showCallHierarchy"]   = "搜索调用层次结构 (call)"
            references_view["contents"]["package"]["cmd.references-view.showTypeHierarchy"]   = "搜索类型层次结构 (type)"
            await fs.promises.writeFile(`locale/extensions/${file.name}`, JSON.stringify(references_view, null, 4))
        }
        else
            await fs.promises.copyFile(`.tmp/i18n/vscode-language-pack-zh-hans/translations/extensions/${file.name}`, `locale/extensions/${file.name}`)
} finally {
    await fs.promises.rm(".tmp", {recursive: true, force: true})
}