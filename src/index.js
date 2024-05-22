const { Kobe_Bot, logger } = require("./features/Kobe");

const { tr } = require("./features/I18n");
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
require("./features/Command");

// Delay Load
setTimeout(() => {
    require("./features/Plugins");
    require("./features/Event");
}, 1000);
