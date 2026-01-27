// ----------------------------------------------------------------------------
// Object Functions
// ----------------------------------------------------------------------------

const filterFields = (obj, fields) => fields.reduce((o, f) => f in obj ? { ...o, [f]: obj[f] } : o, {})

// ----------------------------------------------------------------------------
// Array Functions
// ----------------------------------------------------------------------------

const range = n => [...Array(n).keys()]

const allTrue = arr => !arr.some(e => !e) && !!arr.length

// ----------------------------------------------------------------------------
// Number Functions
// ----------------------------------------------------------------------------

const toNum = v => {
    if ((typeof v !== 'string' && typeof v !== 'number') || v === '') return undefined
    const n = v * 1
    return isNaN(n) ? undefined : n
}

// ----------------------------------------------------------------------------
// String Functions
// ----------------------------------------------------------------------------

const capitalize = s => (s || '') && (s.charAt(0).toUpperCase() + s.slice(1))

const trim = s => (s || '').trim()

// ----------------------------------------------------------------------------
// Time Functions
// ----------------------------------------------------------------------------

const minutesFormat = minutes => {
    if (minutes < 60) {
        return `${minutes} minuto${minutes > 1 ? 's' : ''}`
    }
    if (minutes % 60 === 0) {
        const v = minutes / 60
        return `${v} hora${v > 1 ? 's' : ''}`
    }
    return `${(Math.floor(minutes / 60) + '')}h${(minutes % 60 + '').padStart(2, '0')}`
}

const timeSince = (date) => {
  const s = Math.abs(new Date() - new Date(date)) / 1000

  if (s <= 5) return 'just now' // < 5 seconds ago

  for (const o of [
    { i: 'year', s: 31536000 }, // 60*60*24*365
    { i: 'month', s: 2592000 }, // 60*60*24*30
    { i: 'week', s: 604800 }, // 60*60*24*7
    { i: 'day', s: 86400 }, // 60*60*24
    { i: 'hour', s: 3600 }, // 60*60
    { i: 'minute', s: 60 },
    { i: 'second', s: 1 }
  ]) {
    const i = s / o.s // interval
    if (i >= 1) {
      const f = Math.floor(i)
      return f + ' ' + o.i + (f > 1 ? 's' : '') + ' ago'
    }
  }
}

const datetimeFormat = (date) => new Date(new Date(date) - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .replace(/-/g, '/').replace('T', ' - ')
  .replace('Z', '').slice(0, -4)

const datetimeFormatBR = (date) => (new Date(date)).toLocaleString()

const dateFormatBR = (date) => (new Date(date)).toLocaleDateString()

const moneyFormat = (amount, currency = 'BRL', locale = 'pt-BR') => {
    
    if (typeof amount !== 'number' || isNaN(amount)) amount = 0
    
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    return formatter.format(amount)
}

// ----------------------------------------------------------------------------
// Others
// ----------------------------------------------------------------------------

// const util = require('util')
// exports.deepLog = obj => util.inspect(obj, { showHidden: false, depth: null, colors: true })

// ----------------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------------
module.exports = {
    filterFields, range, allTrue, toNum, capitalize, trim, minutesFormat, timeSince, datetimeFormat, datetimeFormatBR, dateFormatBR, moneyFormat
}