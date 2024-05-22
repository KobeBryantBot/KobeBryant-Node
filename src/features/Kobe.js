const { WebSocket } = require('ws');
const EventEmitter = require("events");
const { Logger } = require("../../libraries/Logger");
const { MessageBuilder, PacketBuilder } = require("./Builder");
const { tr } = require("./I18n");
const { config } = require("./Config");

let count = 1;
let sleep_t = 5;

function pendingSleep() {
    sleep_t = sleep_t * 2;
}

function boom() {
    if (count < 11)
        count++;
    else
        count = 1;
    pendingSleep();
    return sleep_t * 1e3;
}

class Kobe {
    mClient;
    mTarget;
    mToken;
    mEventEmitter = new EventEmitter();
    mI18n;

    constructor(target, token) {
        this.mTarget = target;
        this.mToken = token;
    }

    login() {
        this.mClient = new WebSocket(this.mTarget, { headers: { Authorization: 'Bearer ' + this.mToken } });// 
        this.mClient.on('open', () => {
            logger.info(tr("kobe.login"));
            this.mEventEmitter.emit('bot.online');
        });
        this.mClient.on('error', (e) => {
            logger.error(tr("kobe.websocketError"));
            logger.error(e);
        });
        this.mClient.on('close', (e) => {
            logger.warn(tr("kobe.disconnect"));
            setTimeout(() => {
                this.login()
            }, boom());
        });
        this.mClient.on('message', (original_data, islib) => {
            let raw = original_data;
            if (islib) {
                raw = original_data.toString()
            }
            let packet;
            try {
                packet = JSON.parse(raw);
            } catch (err) {
                logger.error(tr("kobe.parseError"));
                logger.error(err);
            }
            this.mEventEmitter.emit('MessagePacket', packet);
        })
    }

    on(evk, func) {
        this.mEventEmitter.on(evk, func);
        this.mEventEmitter.setMaxListeners(20)
    }

    emit(evk, ...arg) {
        this.mEventEmitter.emit(evk, ...arg);
    }

    sendWSPack(pack) {
        if (typeof pack !== 'string') {
            pack = JSON.stringify(pack);

        }
        this.mClient.send(pack);
    }

    sendPrivateMessage(target, msg) {
        msg = MessageBuilder.format(msg);
        return this.sendWSPack(PacketBuilder.PrivateMessagePacket(target, msg));
    }

    sendGroupMessage(group, msg) {
        msg = MessageBuilder.format(msg);
        return this.sendWSPack(PacketBuilder.GroupMessagePacket(group, msg));
    }

    sendGroupForwardMessage(group, msg) {
        return this.sendWSPack(PacketBuilder.GroupForwardMessagePacket(group, msg));
    }

    muteGroupPlayer(group, target, duration) {
        return this.sendWSPack(PacketBuilder.GroupBanPacket(group, target, duration));
    }

    deleteMessage(message_id) {
        return this.sendWSPack(PacketBuilder.DeleteMsgPacket(message_id));
    }

    getGroupMemberList(group) {
        return this.sendWSPack(PacketBuilder.GroupMemberListPacket(group));
    }

    getGroupMemberInfo(group, target) {
        return this.sendWSPack(PacketBuilder.GroupMemberInfoPacket(group, target));
    }

    atGroupPlayer(group, target, msg) {
        let prefix = MessageBuilder.at(target);
        let info = MessageBuilder.text(` ${msg}`);
        msg = MessageBuilder.format([prefix, info]);
        return this.sendWSPack(PacketBuilder.GroupMessagePacket(group, msg));
    }
}

const Kobe_Bot = new Kobe(config.get("target"), config.get("token"));

const logger = new Logger("Kobe");
if (config.get("log").enable) {
    logger.setFile(config.get("log").path);
}

module.exports = { Kobe, Kobe_Bot, logger };