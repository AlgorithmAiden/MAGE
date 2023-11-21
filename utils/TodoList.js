const fs = require('fs')

const newPath = './Todo.txt'
const oldPath = './oldTodo.txt'

let colorCode = {}
let list = []
if (fs.existsSync(newPath))
    fs.readFileSync(newPath, 'utf8').split('\n').forEach(item => { let temp = item.split('==='); if (item[0] == '.') colorCode[temp[0].slice(1)] = temp[1].split('\r')[0]; else list.push({ name: temp[0].split('\r')[0], status: temp[1].split('\r')[0] }) })

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

/**
 * pushes an the item to the list
 * @param {string} name 
 * @param {string} status 
 */
function addItem(name, status) {
    list.push({ name, status })
}

/**
 * pushes all the names to the list with the same status 
 * @param {Array} names 
 * @param {string} status
 */
function addItems(names, status) {
    for (let name of names)
        list.push({ name, status })
}

/**
 * changes the status of an item
 * @param {string} name 
 * @param {string} status 
 */
function updateItem(name, status) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].name == name) {
            list[i].status = status
            i = list.length
        }
    }
}

/**
 * sets the color to be used for the status, colors may be from colorLog
 * @param {string} status 
 * @param {string} color 
 */
function setStatusColor(status, color) {
    colorCode[status] = color
}

/**
 * logs all the items sorted
 * @param {object} config logDelay, logTime, infoColor
 * @returns 
 */
function logList(config = {}) {

    list.sort(() => { return Math.round(Math.random() * 2 - 1) })

    let sorted = {}

    let statusCount = 0

    for (let item of list) {
        if (!sorted[item.status]) {
            sorted[item.status] = []
            statusCount++
        }
        sorted[item.status].push(item.name)
    }

    let totalCount = list.length

    let delayTime = 0

    let logDelay = config.logDelay ?? config.logTime / (totalCount + statusCount) ?? 0

    function delayLog(texts) {
        delayTime += logDelay
        if (logDelay > 0)
            setTimeout(() => {
                colorLog(texts)
            }, delayTime)
        else
            colorLog(texts)
    }

    let types = Object.keys(sorted)

    types.sort(() => { return Math.round(Math.random() * 2 - 1) })

    let text = [{ text: `\n${totalCount} items:`, color: 'white' }]

    for (let i = 0; i < types.length; i++) {

        const status = types[i]

        let percent = Math.round(sorted[status].length / totalCount * 1000) / 10

        text.push({ text: ` %${percent} ${status}`, color: colorCode[status] })

        delayLog([{ text: `\n%${percent} ${status} (${sorted[status].length} / ${totalCount})`, color: config.infoColor ?? colorCode[status] }])
        for (let name of sorted[status]) {
            delayLog([{ text: ` * ${name}`, color: colorCode[status] }])
        }
    }

    delayLog(text)

    return delayTime
}

/**
 * @param {Array} filePaths an array of file paths
 * @returns the total number of lines
 */
function countLines(filePaths) {
    let total = 0
    for (const filePath of filePaths) {
        try {
            const data = fs.readFileSync(filePath, 'utf8')
            total += data.split('\n').length
        } catch (err) {
            console.error(`Error reading file ${filePath}:`, err.message)
        }
    }
    return total
}

/**
 * checks if any items on the list have changed, and pushes to github if they have
 */
const pushIfNeeded = (() => {
    //create a function to commit to git
    const git = require('simple-git')

    async function pushToGithub(commitMessage) {
        try {
            const simpleGit = git()
            const branchSummary = await simpleGit.branch()
            const currentBranch = branchSummary.current

            if (!currentBranch || currentBranch !== 'main') {
                // Create 'main' branch if it doesn't exist
                await simpleGit.checkoutLocalBranch('main')
            }

            await simpleGit.add('./*')  // Stage all changes (new, modified, deleted)
            await simpleGit.commit(commitMessage)  // Use the custom commit message
            //await simpleGit.push('origin', 'main')  // Push to the main branch on the remote repository
            colorLog([{ color: 'green', text: 'Pushed to GitHub successfully with message:\n' }, { color: 'yellow', text: commitMessage }])
        } catch (error) {
            colorLog({ color: 'red', text: JSON.stringify(error) })
        }
    }

    //the real function
    const fs = require('fs')
    return async (push = true) => {
        // if (!fs.existsSync(oldPath)) {
        //     colorLog([{ text: 'No oldTodo.txt detected, creating file at ', color: 'blue' }, { text: oldPath, color: 'yellow' }])
        //     fs.writeFileSync(oldPath, 'Example item===Example state', 'utf8')
        // }
        // if (!fs.existsSync(newPath)) {
        //     colorLog([{ text: 'No Todo.txt detected, creating file at ', color: 'blue' }, { text: newPath, color: 'yellow' }])
        //     fs.writeFileSync(newPath, 'Example item===Example state', 'utf8')
        // }
        // const newTodo = {}
        // const oldTodo = {}
        // fs.readFileSync(newPath, 'utf8').split('\n').forEach(item => { if (item[0] == '.') return; let temp = item.split('==='); newTodo[temp[0]] = temp[1] })
        // fs.readFileSync(oldPath, 'utf8').split('\n').forEach(item => { if (item[0] == '') return; let temp = item.split('==='); oldTodo[temp[0]] = temp[1] })
        // let changes = []
        // const newKeys = Object.keys(newTodo)
        // const oldKeys = Object.keys(oldTodo)
        // for (const key of newKeys)
        //     if (oldKeys.includes(key)) {
        //         if (oldTodo[key] != newTodo[key])
        //             changes.push(`Changed item '${key}' from status '${oldTodo[key]}' to status '${newTodo[key]}'`)
        //     }
        //     else changes.push(`Added item '${key}' with status '${newTodo[key]}'`)
        // for (const key of oldKeys)
        //     if (!newKeys.includes(key))
        //         changes.push(`Removed item '${key}' with status '${oldTodo[key]}'`)
        // changes = changes.join('\n')
        // if (changes.length > 0) {
        //     colorLog([{ text: 'Pushing to github with message:\n', color: 'blue' }, { text: changes, color: 'yellow' }])
        //     let out = []
        //     list.forEach((item) => {
        //         if (item.name != '')
        //             out.push(`${item.name}===${item.status}`)
        //     })
        //     fs.writeFileSync(oldPath, out.join('\n'), 'utf8')
        // }
        // else
        //     colorLog({ text: 'No changes detected in Todo', color: 'blue' })

        //check if the todo files exist, and warn if they don't
        if (!fs.existsSync(oldPath)) {
            colorLog([{ text: 'No oldTodo.txt detected, creating file at ', color: 'blue' }, { text: oldPath, color: 'yellow' }])
            fs.writeFileSync(oldPath, 'Example item===Example state', 'utf8')
        }
        if (!fs.existsSync(newPath)) {
            colorLog([{ text: 'No Todo.txt detected, creating file at ', color: 'blue' }, { text: newPath, color: 'yellow' }])
            fs.writeFileSync(newPath, 'Example item===Example state', 'utf8')
        }

        //grad the todo lists
        let oldTodo = fs.readFileSync(oldPath, 'utf8')
        let newTodo = fs.readFileSync(newPath, 'utf8')

        //break into lines
        oldTodo = oldTodo.split('\n')
        newTodo = newTodo.split('\n')

        //filter out the color commands
        newTodo = newTodo.filter(item => item[0] != '.')

        //trim off the '\r' at the end of some names
        oldTodo = oldTodo.map(item => item.split('\r')[0])
        newTodo = newTodo.map(item => item.split('\r')[0])

        //split into the name / status
        oldTodo = oldTodo.map(item => item.split('==='))
        newTodo = newTodo.map(item => item.split('==='))

        //hold all the changes
        let changes = []

        //check for added items
        newTodo.forEach(newItem => {
            let included = false
            oldTodo.forEach(oldItem => {
                if (newItem[0] == oldItem[0] && newItem[1] == oldItem[1])
                    included = true
            })
            if (!included)
                changes.push(`Added item '${newItem[0]}' with status '${newItem[1]}'`)
        })

        //check for removed items
        oldTodo.forEach(oldItem => {
            let included = false
            newTodo.forEach(newItem => {
                if (oldItem[0] == newItem[0] && oldItem[1] == newItem[1])
                    included = true
            })
            if (!included)
                changes.push(`Removed item '${oldItem[0]}' with status '${oldItem[1]}'`)
        })

        //check for changed statuses
        newTodo.forEach(newItem =>
            oldTodo.forEach(oldItem => {
                if (newItem[0] == oldItem[0] && newItem[1] != oldItem[1])
                    changes.push(`Item '${newItem[0]}' changed status from '${oldItem[1]}' to '${newItem[1]}'`)
            })
        )

        //if changes: push, and save
        if (changes.length > 0) {
            pushToGithub(changes.join('\n'))
            fs.writeFileSync(oldPath, newTodo.map(item => `${item[0]}===${item[1]}`).join('\n'), 'utf8')
        } else
            colorLog({ text: 'No changes in todo list detected', color: 'blue' })
    }
})()

/**
 * logs the number of lines in the combined files
 * @param {string} filePaths 
 */
function logLines(filePaths) {
    const lines = countLines(filePaths)

    colorLog([{ color: 'blue', text: '\nThere are ' }, { color: 'yellow', text: lines }, { color: 'blue', text: ' lines of code in this project\n' }])
}

/**
 * Does all the logging at once
 * @param {object} config config for logList
 * @param {Array} filePaths paths for logLines
 * @param {boolean} push push for pushIfNeeded
 */
function fullLogAndPush(config, filePaths, push) {
    logList(config)
    logLines(filePaths)
    pushIfNeeded(push)
}

module.exports = {
    addItem,
    addItems,
    updateItem,
    setStatusColor,
    logList,
    pushIfNeeded,
    logLines,
    fullLogAndPush
}