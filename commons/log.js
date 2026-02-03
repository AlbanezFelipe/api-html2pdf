const color = require('./color.js')
const util = require('util')

const nowPretty = () => 
    color('[', 'cyan', 'bold') +
    color(new Date().toString().split(' ').slice(0, 5).join(' '), 'cyan') +
    color(']', 'cyan', 'bold')

const log = (...args) => console.log(
    color('[LOG]', 'blue', 'bold') + nowPretty(),
    ...args
)

const logError = (...args) => console.error(
    color('[ERROR]', 'red', 'bold') + nowPretty(),
    ...args
)

const logWarning = (...args) => console.error(
    color('[WARNING]', 'yellow', 'bold') + nowPretty(),
    ...args
)

const logDev = (...args) => {
    if(process.env.NODE_ENV !== 'production') log(...args)
}

const logVerbose = (...args) => {
    if(process.env.VERBOSE_MODE === '1') log(...args)
}

const deep = (obj) => {
    return util.inspect(obj, { depth: 9 })
}

module.exports = { log, logError, logWarning, logDev, logVerbose, deep }
