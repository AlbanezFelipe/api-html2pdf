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

// ----------------------------------------------------------------------------
// Others
// ----------------------------------------------------------------------------

// const util = require('util')
// exports.deepLog = obj => util.inspect(obj, { showHidden: false, depth: null, colors: true })

// ----------------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------------
module.exports = {
    filterFields, range, allTrue, toNum, capitalize, minutesFormat
}