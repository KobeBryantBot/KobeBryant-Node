const fs = require("fs");
const { tr } = require("./I18n");
const FilePath = require('path');
const { logger, Kobe_Bot } = require("./Kobe");

const requireOrReload = require("require-reload")(require);

let mPluginInstanceCache = [];

class Plugin {
    mName;
    mHandle;

    constructor(name) {
        this.mName = name;
    }
}

class PluginManager {
    static loadPlugin(dirName) {
        try {
            if (fs.existsSync(`./plugins/${dirName}/manifest.json`)) {
                let manifestStr = fs.readFileSync(`./plugins/${dirName}/manifest.json`, { encoding: 'utf-8' })
                let manifest = JSON.parse(manifestStr);
                if (manifest.load) {
                    if (manifest.name == dirName) {
                        logger.info(tr("kobe.plugin.loading", [`${manifest.name}`]));
                        let plugin = new Plugin(dirName);
                        plugin.mHandle = requireOrReload(`../../plugins/${dirName}/${manifest.entry}`);
                        mPluginInstanceCache.push(plugin);
                        logger.info(tr("kobe.plugin.loaded", [`${manifest.name}`]));
                        return true;
                    } else {
                        logger.error(tr("kobe.plugin.nameMismatch", [dirName]));
                    }
                }
            }
        } catch (err) {
            logger.error(tr("kobe.plugin.load.failed", [`${dirName}`]));
            logger.error(err);
        }
        return false;
    }

    static reloadPlugin(plugin) {
        try {
            let pluginName = plugin.mName;
            if (fs.existsSync(`./plugins/${pluginName}/manifest.json`)) {
                let manifestStr = fs.readFileSync(`./plugins/${pluginName}/manifest.json`, { encoding: 'utf-8' })
                let manifest = JSON.parse(manifestStr);
                if (manifest.load) {
                    logger.info(tr("kobe.plugin.loading", [`${manifest.name}`]));
                    plugin.mHandle = requireOrReload(`../../plugins/${pluginName}/${manifest.entry}`);
                    mPluginInstanceCache.push(plugin);
                    logger.info(tr("kobe.plugin.loaded", [`${manifest.name}`]));
                    return true;
                }
            }
        } catch (err) {
            logger.error(tr("kobe.plugin.load.failed", [`${pluginName}`]));
            logger.error(err);
        }
        return false;
    }

    static loadAllPlugins() {
        if (!fs.existsSync("./plugins/")) {
            fs.mkdirSync("./plugins/");
        }
        let all_plugins = fs.readdirSync("./plugins/");
        all_plugins.forEach((pluginName) => {
            this.loadPlugin(pluginName);
        });
    }

    static reloadAllPlugins() {
        Kobe_Bot.onReload();
        let pluginNames = [];
        let oldCache = mPluginInstanceCache;
        mPluginInstanceCache = [];
        oldCache.forEach((plugin) => {
            let result = this.reloadPlugin(plugin);
            if (result) pluginNames.push(plugin.mName);
        });
        let all_plugins = fs.readdirSync("./plugins/");
        all_plugins.forEach((pluginName) => {
            if (!pluginName.includes(pluginName)) {
                this.loadPlugin(pluginName);
            }
        });
    }
};

module.exports = { PluginManager };