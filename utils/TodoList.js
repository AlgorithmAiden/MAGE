const fs = require('fs')

let list = []

let colorCode = {}

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
 * @returns the todo list
 */
function read() {
    return list
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
const pushIfNeeded = ((push = true) => {
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
            await simpleGit.push('origin', 'main')  // Push to the main branch on the remote repository
            colorLog([{ color: 'green', text: 'Pushed to GitHub successfully with message:\n' }, { color: 'yellow', text: commitMessage }])
        } catch (error) {
            colorLog({ color: 'red', text: JSON.stringify(error) })
        }
    }

    //check if the project needs to be pushed
    const fs = require('fs')
        ;
    return async () => {
        const path = './oldTodo.json'
        if (fs.existsSync(path)) {
            try {
                const data = fs.readFileSync(path, 'utf8')
                const oldTodo = JSON.parse(data)
                const newTodo = list
                let changes = []
                for (const newItem of newTodo) {
                    let included = false
                    for (const oldItem of oldTodo)
                        if (oldItem.name == newItem.name) {
                            if (oldItem.status != newItem.status)
                                changes.push(`Item '${oldItem.name}' changed from '${oldItem.status}' to '${newItem.status}'`)
                            included = true
                        }
                    if (!included)
                        changes.push(`New item '${newItem.name}' with status '${newItem.status}'`)
                }
                if (changes.length > 0) {
                    colorLog({ color: 'green', text: 'Changes detected, pushing to github...' })
                    if (push)
                        pushToGithub(changes.join('\n'))
                    else colorLog({ text: '"Pushed to github"', color: 'red' })
                } else
                    colorLog({ color: 'blue', text: 'No changes detected' })
            } catch (error) {
                colorLog([{ color: 'yellow', text: 'Error reading old todo: ' }, { color: 'red', text: error }])
                return
            }
        } else {
            colorLog({ color: 'red', text: 'Old todo missing' })
        }
        try {
            fs.writeFileSync(path, JSON.stringify(list, null, 2))
            colorLog({ color: 'green', text: 'Old todo updated' })
        } catch (error) {
            colorLog([{ color: 'yellow', text: 'Error writing to old todo: ' }, { color: 'red', text: error }])
        }
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

function fullLogAndPush(config, filePaths) {
    logList(config)
    logLines(filePaths)
    pushIfNeeded()
}

module.exports = {
    addItem,
    addItems,
    updateItem,
    setStatusColor,
    logList,
    read,
    pushIfNeeded,
    logLines,
    fullLogAndPush
}