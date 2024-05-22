const fs = require("fs");

function uuid() {
    var s = []
    var hexDigits = '0123456789abcdef'
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substring(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substring((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-'

    var uuid = s.join('')
    return uuid
}

class ForwardMsgBuilder {
    msg = []

    addMsgById(id) {
        this.msg.push({
            type: 'node',
            data: {
                id
            }
        })
    }

    addCustomsMsg(name, uin, content) {
        this.msg.push({
            type: 'node',
            data: {
                name,
                uin,
                content
            }
        })
    }

    getMsg() {
        return this.msg;
    }
}

class MessageBuilder {
    static img(file) {
        if (typeof file === 'string' && fs.existsSync(file)) {
            file = fs.readFileSync(file);
        }
        if (file instanceof Buffer) {
            file = `base64://${file.toString('base64')}`;
        }
        return { type: 'image', data: { file: file, subType: 0 } }
    }
    static at(qid) {
        qid = qid.toString();
        return { type: "at", data: { "qq": qid } };
    }
    static face(id) {
        return { type: 'face', data: { id } };
    }
    static text(raw) {
        return { type: 'text', data: { text: raw } };
    }
    static poke(id) {
        return { type: 'poke', data: { qq: id } };
    }
    static reply(id) {
        return { type: 'reply', data: { id } };
    }
    static format(msg) {
        if (Array.isArray(msg) == false) {
            msg = [msg];
        }
        for (let index in msg) {
            var imsg = msg[index];
            if (typeof imsg == 'string') {
                msg[index] = MessageBuilder.text(imsg);
            }
        }
        return msg;
    }
    static ForwardMsgBuilder() {
        return new ForwardMsgBuilder();
    }
}

class PacketBuilder {
    static MessagePacket(id, type, msg) {
        let sendjson = {
            action: 'send_msg',
            echo: uuid(),
            params: {
                user_id: id,
                message: msg,
                message_type: type
            }
        }
        if (type == 'group') {
            sendjson.params.group_id = id
        }
        return sendjson
    }

    static PrivateMessagePacket(fid, msg) {
        return this.MessagePacket(fid, 'private', msg);
    }

    static GroupMessagePacket(gid, msg) {
        return this.MessagePacket(gid, 'group', msg);
    }

    static SandGroupMessagePacket(gid, msg, escape = false) {
        return {
            action: 'send_group_msg',
            params: {
                group_id: gid,
                message: msg,
                auto_escape: escape
            }
        }
    }

    static LikePacket(fid) {
        return {
            action: 'send_like',
            params: {
                user_id: fid,
                times: 10

            }
        }
    }

    static DeleteMsgPacket(id) {
        return {
            action: 'delete_msg',
            params: {
                message_id: id
            }
        }
    }

    static GetMsgPacket(mid) {
        return {
            action: 'get_msg',
            echo: uuid(),
            params: {
                message_id: mid
            }
        }
    }

    static GroupBanPacket(gid, mid, duration) {
        return {
            action: 'set_group_ban',
            params: {
                group_id: gid,
                user_id: mid,
                duration
            }
        }
    }

    static GroupRequestPacket(flag, sub_type, approve) {
        return {
            action: 'set_group_add_request',
            echo: uuid(),
            params: {
                flag,
                sub_type,
                approve
            }
        }
    }

    static FriendRequestPacket(flag, approve) {
        return {
            action: 'set_friend_add_request',
            echo: uuid(),
            params: {
                flag,
                approve
            }
        }
    }

    static GroupMemberListPacket(gid) {
        return {
            action: 'get_group_member_list',
            echo: uuid(),
            params: {
                group_id: gid
            }
        }
    }

    static GroupMemberInfoPacket(gid, mid) {
        return {
            action: 'get_group_member_info',
            echo: uuid(),
            params: {
                group_id: gid,
                user_id: mid
            }
        }
    }

    static GroupForwardMessagePacket(gid, msg) {
        return {
            action: 'send_group_forward_msg',
            echo: uuid(),
            params: {
                group_id: gid,
                messages: msg
            }
        }
    }

    static GroupCardSet(gid, mid, card) {
        return {
            action: 'set_group_card',
            params: {
                group_id: gid,
                user_id: mid,
                card: card
            }
        }
    }
}

module.exports = { MessageBuilder, PacketBuilder };
