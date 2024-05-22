const { EventEmitter } = require("ws");
const { config } = require("./Config");
const { tr, I18n } = require("./I18n");
const { Kobe_Bot, logger } = require("./Kobe");
const { PluginManager } = require("./Plugins");

let mIsDebugMode = false;
let mCommandEmitter = new EventEmitter();

class CommandManager {
    static init() {
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (data) => {
            data = data.trim();
            if (!mIsDebugMode) {
                switch (data) {
                    case "jsdebug": {
                        mIsDebugMode = true;
                        return logger.info(tr("kobe.debug.enable"));
                    }
                    case "stop": {
                        logger.info(tr("kobe.closing"));
                        return process.exit(0);
                    }
                    case "reload": {
                        config.init();
                        I18n.loadAllLanguages();
                        this.unregisterAllCommands();
                        PluginManager.reloadAllPlugins();
                        return logger.info(tr("kobe.reloaded"));
                    }
                    case "list": {
                        let names = PluginManager.getAllPluginNames();
                        logger.info(tr("kobe.plugins.info", [names.length]));
                        return logger.info(names);
                    }
                    default: {
                        let input = data.split(" ");
                        input = input.filter(str => str.trim() !== "");
                        if (input.length >= 1) {
                            let result = this.handleCommandInput(input);
                            if (!result) return logger.error(tr("kobe.unknownCommand", [input[0]]));
                        } else return logger.error(tr("kobe.unknownCommand", [""]));
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
                    mIsDebugMode = false;
                    return logger.info(tr("kobe.debug.disable"));
                }
            }
        });
    }

    static handleCommandInput(input) {
        let cmd = input[0];
        let args = [];
        input.forEach((arg, index) => {
            if (index >= 1) args.push(arg);
        })
        mCommandEmitter.emit(cmd, args);
        return mCommandEmitter.listenerCount(cmd) >= 1;
    }

    static registerCommand(cmd, func) {
        if (mCommandEmitter.listenerCount(cmd) == 0) {
            mCommandEmitter.on(cmd, (args) => {
                func(args);
            });
            return true;
        } else {
            logger.error(tr("kobe.command.error.commandExists", [cmd]));
            return false;
        }
    }

    static hasCommand(cmd) {
        return mCommandEmitter.listenerCount(cmd) >= 1;
    }

    static unregisterCommand(cmd) {
        if (this.hasCommand(cmd)) {
            mCommandEmitter.removeAllListeners(cmd);
            return true;
        }
        return false;
    }

    static unregisterAllCommands(cmd) {
        let cmds = mCommandEmitter.eventNames();
        cmds.forEach((cmd) => {
            mCommandEmitter.removeAllListeners(cmd);
        });
    }
}

module.exports = {
    CommandManager
};