const fs = require("fs");
const { tr } = require("./I18n");
const { logger, Kobe_Bot } = require("./Kobe");

const requireOrReload = require("require-reload")(require);

let mPluginInstanceCache = [];

class Plugin {
    mName;
    mHandle;
    mManifest;

    constructor(name) {
        this.mName = name;
    }
};

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
                        plugin.mManifest = manifest;
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
        let pluginName = plugin.mName;
        try {
            if (fs.existsSync(`./plugins/${pluginName}/manifest.json`)) {
                let manifestStr = fs.readFileSync(`./plugins/${pluginName}/manifest.json`, { encoding: 'utf-8' })
                let manifest = JSON.parse(manifestStr);
                if (manifest.load) {
                    if (manifest.name == pluginName) {
                        logger.info(tr("kobe.plugin.loading", [`${manifest.name}`]));
                        plugin.mManifest = manifest;
                        plugin.mHandle = requireOrReload(`../../plugins/${pluginName}/${manifest.entry}`);
                        logger.info(tr("kobe.plugin.loaded", [`${manifest.name}`]));
                        return true;
                    } else {
                        logger.error(tr("kobe.plugin.nameMismatch", [pluginName]));
                    }
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
            if (result) {
                pluginNames.push(plugin.mName);
                mPluginInstanceCache.push(plugin);
            }
        });
        let all_plugins = fs.readdirSync("./plugins/");
        all_plugins.forEach((pluginName) => {
            if (!pluginNames.includes(pluginName)) {
                this.loadPlugin(pluginName);
            }
        });
    }

    static getAllPluginNames() {
        let result = [];
        mPluginInstanceCache.forEach((plugin) => {
            result.push(plugin.mName);
        });
        return result;
    }
};

module.exports = { PluginManager };