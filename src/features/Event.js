const { MessageBuilder } = require("./Builder");
const { Kobe_Bot } = require("./Kobe");

const build_reply = (id, type, mid) => {
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
            return Kobe_Bot.sendGroupMessage(id, msg);

        } else {
            return Kobe_Bot.sendPrivateMessage(id, msg);
        }
    }
}

Kobe_Bot.on('MessagePacket', (packet) => {
    if (packet.echo != undefined) {
        Kobe_Bot.mEventEmitter.emit("packetid_" + packet.echo, packet.data);
        // return;
    }
    const POST_TYPE = packet.post_type;
    switch (POST_TYPE) {
        case 'meta_event':
            Kobe_Bot.emit(`${POST_TYPE}.${packet.meta_event_type}`, packet);
            break;
        case 'message':
            if (packet.raw_message.includes('&#91;') || packet.raw_message.includes('&#93;') || packet.raw_message.includes('&#44') || packet.raw_message.includes('&amp;')) {
                packet.raw_message = packet.raw_message.replace('&#91;', '[');
                packet.raw_message = packet.raw_message.replace('&#93;', ']');
                packet.raw_message = packet.raw_message.replace('&#44;', ',');
                packet.raw_message = packet.raw_message.replace('&amp;', '&');
            }
            Kobe_Bot.emit(`${POST_TYPE}.${packet.message_type}.${packet.sub_type}`, packet, build_reply(packet.group_id == undefined ? packet.user_id : packet.group_id, packet.message_type, packet.message_id));
            break;
        case 'notice':
            Kobe_Bot.emit(`${POST_TYPE}.${packet.notice_type}`, packet)
            break;
        case 'request':
            Kobe_Bot.emit(`${POST_TYPE}.${packet.request_type}`, packet);
            break;
    }
});