const { JsonConfig } = require("../../libraries/Config");

const default_config = {
    "target": "ws://127.0.0.1:8080",
    "token": "j3bHXBIjo@iLxc1qw+03K=Nf6X!OhXSV",
    "language": "zh_CN",
    "log": {
        "enable": true,
        "path": "./logs/Kobe.log"
    }
}

const config = new JsonConfig("./config/config.json", default_config);

module.exports = { config };