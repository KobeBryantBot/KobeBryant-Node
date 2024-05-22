const { JsonConfig } = require("../../libraries/Config");

const default_config = {
    "target": "ws://127.0.0.1:8080",
    "token": "j3bHXBIjo@iLxc1qw+03K=Nf6X!OhXSV",
    "language": "zh_CN",
    "logger": {
        "logFile": true,
        "logFilePath": "./logs/Kobe.log",
        "logLevel": 4
    }
}

const config = new JsonConfig("./config/config.json", default_config);

module.exports = { config };