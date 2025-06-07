// src/utils/logger.js
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

const logger = {
    info: (message) => {
        console.log(`${colors.blue}[INFO]${colors.reset} ${new Date().toISOString()} - ${message}`);
    },
    success: (message) => {
        console.log(`${colors.green}[SUCCESS]${colors.reset} ${new Date().toISOString()} - ${message}`);
    },
    error: (message, error) => {
        console.error(`${colors.red}[ERROR]${colors.reset} ${new Date().toISOString()} - ${message}`);
        if (error && error.stack) {
            console.error(`${colors.red}Stack:${colors.reset}\n`, error.stack);
        }
    },
    warn: (message) => {
        console.warn(`${colors.yellow}[WARNING]${colors.reset} ${new Date().toISOString()} - ${message}`);
    },
    request: (req) => {
        console.log(`${colors.magenta}[REQUEST]${colors.reset} ${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
};

module.exports = logger;