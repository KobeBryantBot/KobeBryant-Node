const { Kobe_Bot, logger } = require("./features/Kobe");
const { tr } = require("./features/I18n");
const { PluginManager } = require("./features/Plugins");
const { CommandManager } = require("./features/Command");

logger.info(tr("kobe.readingConfig"));

logger.info(String.raw`                                                                        `);
logger.info(String.raw`          _  __     _             ____                         _        `);
logger.info(String.raw`         | |/ /    | |           |  _ \                       | |       `);
logger.info(String.raw`         | ' / ___ | |__   ___   | |_) |_ __ _   _  __ _ _ __ | |_      `);
logger.info(String.raw`         |  < / _ \| '_ \ / _ \  |  _ <| '__| | | |/ _' | '_ \| __|     `);
logger.info(String.raw`         | . \ (_) | |_) |  __/  | |_) | |  | |_| | (_| | | | | |_      `);
logger.info(String.raw`         |_|\_\___/|_.__/ \___|  |____/|_|   \__, |\__,_|_| |_|\__|     `);
logger.info(String.raw`                                              __/ |                     `);
logger.info(String.raw`                                             |___/                      `);
logger.info(String.raw`                                                                        `);
logger.info(String.raw`         --------------------   耐  摔  的  王   -------------------     `);
logger.info(String.raw`                                                                        `);

Kobe_Bot.login();
CommandManager.init();

// Delay Load
setTimeout(() => {
    PluginManager.loadAllPlugins();
}, 1000);
