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
        this.mClient = new WebSocket(this.mTarget, { headers: { Authorization: 'Bearer ' + this.mToken } });
        this.mClient.on('open', () => {
            logger.info(tr("kobe.login"));
            this.mEventEmitter.emit('bot.online');
        });
        this.mClient.on('error', (e) => {
            logger.error(tr("kobe.websocketError"));
            logger.error(e);
        });
        this.mClient.on('close', (e) => {
            logger.error(tr("kobe.disconnect"));
            setTimeout(() => {
                this.login();
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
        });
        this.postEvents();
    }

    build_reply(id, type, mid) {
        return (msg, quote = false) => {
            msg = MessageBuilder.format(msg);
            if (quote) {
                msg.unshift({
                    type: 'reply',
                    data: {
                        id: mid.toString()
                    }
                });
            }
            if (type == 'group') {
                return this.sendGroupMessage(id, msg);

            } else {
                return this.sendPrivateMessage(id, msg);
            }
        }
    }

    on(evk, func) {
        this.mEventEmitter.on(evk, func);
        this.mEventEmitter.setMaxListeners(20)
    }

    emit(evk, ...arg) {
        this.mEventEmitter.emit(evk, ...arg);
    }

    postEvents() {
        this.on('MessagePacket', (packet) => {
            if (packet.echo != undefined) {
                this.mEventEmitter.emit("packetid_" + packet.echo, packet.data);
                // return;
            }
            const POST_TYPE = packet.post_type;
            switch (POST_TYPE) {
                case 'meta_event':
                    this.emit(`${POST_TYPE}.${packet.meta_event_type}`, packet);
                    break;
                case 'message':
                    if (packet.raw_message.includes('&#91;') || packet.raw_message.includes('&#93;') || packet.raw_message.includes('&#44') || packet.raw_message.includes('&amp;')) {
                        packet.raw_message = packet.raw_message.replace('&#91;', '[');
                        packet.raw_message = packet.raw_message.replace('&#93;', ']');
                        packet.raw_message = packet.raw_message.replace('&#44;', ',');
                        packet.raw_message = packet.raw_message.replace('&amp;', '&');
                    }
                    this.emit(`${POST_TYPE}.${packet.message_type}.${packet.sub_type}`, packet, this.build_reply(packet.group_id == undefined ? packet.user_id : packet.group_id, packet.message_type, packet.message_id));
                    break;
                case 'notice':
                    this.emit(`${POST_TYPE}.${packet.notice_type}`, packet)
                    break;
                case 'request':
                    this.emit(`${POST_TYPE}.${packet.request_type}`, packet);
                    break;
            }
        });
    }

    onReload() {
        let all_events = this.mEventEmitter.eventNames();
        all_events.forEach((name) => {
            this.mEventEmitter.removeAllListeners(name);
        });
        this.postEvents();
    }

    sendWSPacket(pack) {
        if (typeof pack !== 'string') {
            pack = JSON.stringify(pack);

        }
        this.mClient.send(pack);
    }

    sendPrivateMessage(target, msg) {
        msg = MessageBuilder.format(msg);
        return this.sendWSPacket(PacketBuilder.PrivateMessagePacket(target, msg));
    }

    sendGroupMessage(group, msg) {
        msg = MessageBuilder.format(msg);
        return this.sendWSPacket(PacketBuilder.GroupMessagePacket(group, msg));
    }

    sendGroupForwardMessage(group, msg) {
        return this.sendWSPacket(PacketBuilder.GroupForwardMessagePacket(group, msg));
    }

    muteGroupPlayer(group, target, duration) {
        return this.sendWSPacket(PacketBuilder.GroupBanPacket(group, target, duration));
    }

    deleteMessage(message_id) {
        return this.sendWSPacket(PacketBuilder.DeleteMsgPacket(message_id));
    }

    getGroupMemberList(group) {
        return this.sendWSPacket(PacketBuilder.GroupMemberListPacket(group));
    }

    getGroupMemberInfo(group, target) {
        return this.sendWSPacket(PacketBuilder.GroupMemberInfoPacket(group, target));
    }

    atGroupPlayer(group, target, msg) {
        let prefix = MessageBuilder.at(target);
        let info = MessageBuilder.text(` ${msg}`);
        msg = MessageBuilder.format([prefix, info]);
        return this.sendWSPacket(PacketBuilder.GroupMessagePacket(group, msg));
    }
}

const Kobe_Bot = new Kobe(config.get("target"), config.get("token"));

const logger = new Logger("Kobe");
logger.setLevel(config.get("logger").logLevel);
if (config.get("logger").logFile) {
    logger.setFile(config.get("logger").logFilePath);
}

module.exports = { Kobe, Kobe_Bot, logger };