const dayjs = require('dayjs');
const fs = require("fs");
const FilePath = require("path");

const FormatColor = {
    warn: "\x1b[93m",
    output: "\x1b[36m",
    error: "\x1b[91m",
    fatal: "\x1b[31m",
    white: "\x1b[97m",
    reset: "\x1b[0m",
    debug: "\x1b[90m"
};

class Logger {
    mName = undefined;
    mFile = undefined;
    mLevel = 4;

    constructor(name = undefined) {
        this.mName = name;
    }

    getTimeStr() {
        return `${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;
    }

    getName() {
        return this.mName ? `[${this.mName}]` : "";
    }

    writeLogLine(line) {
        if (this.mFile) {
            let data = fs.readFileSync(this.mFile, { encoding: 'utf-8' });
            if (!data.endsWith("\n")) {
                data = data + "\n";
            }
            data = data + `${line}\n`;
            fs.writeFileSync(this.mFile, data);
        }
    }

    setFile(logPath) {
        this.mFile = logPath;
        let dirPath = FilePath.dirname(this.mFile);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        if (!fs.existsSync(this.mFile)) {
            fs.writeFileSync(this.mFile, "");
        }
    }

    setLevel(level) {
        this.mLevel = level;
    }

    debug(output) {
        if (this.mLevel >= 5) {
            this.writeLogLine(`[${this.getTimeStr()}] DEBUG ${this.getName()} ${output}`);
            console.log(`[${this.getTimeStr()}] ${FormatColor.debug}DEBUG ${this.getName()} ${output}${FormatColor.reset}`);
        }
    }

    info(output) {
        if (this.mLevel >= 4) {
            this.writeLogLine(`[${this.getTimeStr()}] INFO ${this.getName()} ${output}`);
            console.log(`[${this.getTimeStr()}] ${FormatColor.output}INFO${FormatColor.reset} ${this.getName()} ${output}`);
        }
    }

    warn(output) {
        if (this.mLevel >= 3) {
            this.writeLogLine(`[${this.getTimeStr()}] WARN ${this.getName()} ${output}`);
            console.log(`[${this.getTimeStr()}] ${FormatColor.warn}WARN ${this.getName()} ${output}${FormatColor.reset}`);
        }
    }

    error(output) {
        if (this.mLevel >= 2) {
            this.writeLogLine(`[${this.getTimeStr()}] ERROR ${this.getName()} ${output}`);
            console.log(`[${this.getTimeStr()}] ${FormatColor.error}ERROR ${this.getName()} ${output}${FormatColor.reset}`);
        }
    }

    fatal(output) {
        if (this.mLevel >= 1) {
            this.writeLogLine(`[${this.getTimeStr()}] FATAL ${this.getName()} ${output}`);
            console.log(`[${this.getTimeStr()}] ${FormatColor.fatal}FATAL ${this.getName()} ${output}${FormatColor.reset}`);
        }
    }
}

module.exports = { Logger };