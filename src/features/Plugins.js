const fs = require("fs");
const { tr } = require("./I18n");
const FilePath = require('path');
const { logger } = require("./Kobe");

if (!fs.existsSync("./plugins/")) {
    fs.mkdirSync("./plugins/");
}
let all_plugins = fs.readdirSync("./plugins/");

all_plugins.forEach((pluginName) => {
    try {
        let manifest = require(FilePath.join(process.cwd(), `./plugins/${pluginName}/manifest.json`));
        if (manifest.load) {
            logger.info(tr("kobe.plugin.loading", [`${manifest.name}`]));
            require(FilePath.join(process.cwd(), `./plugins/${pluginName}/${manifest.entry}`));
            logger.info(tr("kobe.plugin.loaded", [`${manifest.name}`]));
        }
    } catch (err) {
        logger.error(tr("kobe.plugin.load.failed", [`${pluginName}`]));
        logger.error(err);
    }
});