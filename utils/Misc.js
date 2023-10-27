const { log } = require('console')
const fs = require('fs')

/**
 * creates a function to detect when a string is entered
 * @param {string[]} targetStrings string 0 will run func 0 and so on
 * @param {Function[]} funcs 
 * @returns a function to be put inisde the inputHook function and given the event object
 */
function onStringFactory(targetStrings, funcs) {
    let maxLength = 0
    for (let index in targetStrings) {
        let targetString = targetStrings[index]
        targetString = targetString.toLowerCase()
        maxLength = Math.max(maxLength, targetString.length)
    }
    let string = ""
    return function (event) {
        if (event.type == "key_release") {
            string += event.key.toLowerCase()
            if (string.length > maxLength) { string = string.slice(string.length - maxLength) }
            for (let index in targetStrings) {
                let targetString = targetStrings[index]
                if (string.endsWith(targetString)) { funcs[index]() }
            }
        }
    }
}

/**
 * logs to the console with colors
 * @param {[]} texts an array of objects like so: [{color: 'red', text: 'Hello}]
 */
function colorLog(texts) {
    const colors = {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    }

    const resetColor = '\x1b[0m'

    let out = ''

    if (texts.length > 0)
        for (let item of texts) {
            out += (colors[item.color] ?? resetColor)
            out += (item.text)
        }
    else {
        out += (colors[texts.color] ?? resetColor)
        out += (texts.text)
    }

    out += (resetColor)

    console.log(out)
}

module.exports = {
    onStringFactory,
    colorLog,
}