// --------------------------------------------
// COLOR CODES
// --------------------------------------------
// 30 Black          90 Gray
// 31 Red            91 Light Red 
// 32 Green          92 Light Green 
// 33 Yellow         93 Light Yellow
// 34 Blue           94 Light Blue
// 35 Magenta        95 Light Magenta
// 36 Cyan           96 Light Cyan
// 37 Light Gray     97 White
// --------------------------------------------
// BACKGROUND COLOR
// --------------------------------------------
// Any color code +10
// --------------------------------------------
// MODIFIERS
// --------------------------------------------
// 0 Reset/Normal     4 Underlined text
// 1 Bold text        5 Blink text
// 2 Faint text       7 Background text
// 3 Italic text      9 Cross out text
// --------------------------------------------
// NO COLOR CODE (clear color)
// --------------------------------------------
// 0  No color
// --------------------------------------------

const colors = {
    black: 30, red: 31, green: 32, yellow: 33, 
    blue: 34, magenta: 35, cyan: 36, lightgray: 37, 
    gray: 90, lightred: 91, lightgreen: 92, lightyellow: 93,
    lightblue: 94, lightmagenta: 95, lightcyan: 96, white: 97
}

const modifiers = {
    normal: 0, bold: 1, faint: 2, italic: 3,
    underline: 4, blink: 5, background: 7, crossout: 9
}

module.exports = (text, color = 'blue', modifier = 'normal', background = false) => 
    `${'\x1b'}[${modifiers[modifier]};${colors[color] + (background && 10)}m${text}${'\x1b'}[0m`