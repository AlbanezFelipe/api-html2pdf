const { logError } = require('../commons/log.js')

module.exports = (err, req, res, next) => {
    // Log error stack
    logError(err.stack)

    // Ip Denied Error
    if (err.name === 'IpDeniedError') {
        return res.status(403).json({ error: err.message })
    }

    // Error json response
    res.status(err.status || 500).json({
        error: (process.env.NODE_ENV !== 'production' && err.message) || 'Internal Error'
    })
}