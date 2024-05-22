const { config } = require("./Config");
const { tr, I18n } = require("./I18n");
const { Kobe_Bot, logger } = require("./Kobe");

let debug = false;

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    data = data.trim();
    if (!debug) {
        switch (data) {
            case "jsdebug": {
                debug = true;
                return logger.info(tr("kobe.debug.enable"));
            }
            case "stop": {
                logger.info(tr("kobe.closing"));
                return process.exit(0);
            }
            case "reload": {
                config.init();
                I18n.loadAllLanguages();
                return logger.info(tr("kobe.reloaded"));
            }
            default: {
                return logger.error(tr("kobe.unknownCommand"));
            }
        }
    } else {
        if (data != "jsdebug") {
            try {
                let result = eval(data);
                return logger.info(`${result}`);
            } catch (err) {
                return logger.error(err);
            }
        } else {
            debug = false;
            return logger.info(tr("kobe.debug.disable"));
        }

    }
});