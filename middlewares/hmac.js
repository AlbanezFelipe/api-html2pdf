
const crypto = require('node:crypto')
const { logWarning } = require('../commons/log.js')

if (!process.env.HMAC_SECRET) logWarning('Missing HMAC_SECRET in .env file for safe authorization')
const secretKey = Buffer.from(process.env.HMAC_SECRET || '', 'utf8');

const compare = (a, b) => {
  const aBuf = Buffer.from(a, "utf8")
  const bBuf = Buffer.from(b, "utf8")

  if (aBuf.length !== bBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(aBuf, bBuf)
}

module.exports = (req, res, next) => {
    const serverHmacHex = crypto.createHmac('sha256', secretKey).update(Buffer.from(JSON.stringify(req.body || ''), 'utf8')).digest('hex')
    const clientHmacHex = req.get('Authorization') || ''

    if(compare(serverHmacHex, clientHmacHex)) {
        return next()
    }

    res.status(403).json({ error: 'Não autenticado' })
}