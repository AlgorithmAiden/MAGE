const { colorLog } = require('./Misc')
const fs = require('fs')
const git = require('simple-git')

let oldPath = './oldTodo.txt'
let newPath = './todo.txt'

//check if the todo files exist, and warn if they don't
if (!fs.existsSync(oldPath)) {
    colorLog([{ text: 'No oldTodo.txt detected, creating file at ', color: 'blue' }, { text: oldPath, color: 'yellow' }])
    fs.writeFileSync(oldPath, 'Example item===Example state', 'utf8')
}
if (!fs.existsSync(newPath)) {
    colorLog([{ text: 'No Todo.txt detected, creating file at ', color: 'blue' }, { text: newPath, color: 'yellow' }])
    const exampleFile = [
        '.status name===color',
        'example item===status',
        '#this is a comment',
        'in fact, any line without a triple equals is a comment',
        'including blank lines' 
    ].join('\n')
    fs.writeFileSync(newPath, exampleFile, 'utf8')
}

let files = []

let colorCode = {}
let list = []
if (fs.existsSync(newPath)) {

    //grab the file
    list = fs.readFileSync(newPath, 'utf8')

    //split it into lines
    list = list.split('\n')

    //remove any extra '\r'
    list = list.map(item => item.split('\r')[0])

    //grab the color codes out of the list
    list.forEach(item => {
        if (item[0] == '.')
            colorCode[item.split('===')[0].split('.')[1]] = item.split('===')[1]
    })

    //filter out the color commands
    list = list.filter(item => item[0] != '.')

    //split items
    list = list.map(item => item.split('==='))

    //put the items into the objects
    list = list.map(item => ({ name: item[0], status: item[1] }))
}

const pushIfChanged = (() => {
    //create a function to commit to git

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
            return true
        } catch (error) {
            colorLog([{ text: 'Error pushing to github: ', color: 'blue' }, { color: 'red', text: JSON.stringify(error) }])
            return false
        }
    }

    //the real function
    return async (push = true) => {

        //grad the todo lists
        let oldTodo = fs.readFileSync(oldPath, 'utf8')
        let newTodo = fs.readFileSync(newPath, 'utf8')

        //break into lines
        oldTodo = oldTodo.split('\n')
        newTodo = newTodo.split('\n')

        //filter out any line without '==='
        newTodo=newTodo.filter(item=>item.includes('==='))
        
        //ignore lines that start with '#'
        newTodo = newTodo.filter(item => item[0] != '#')

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
                if (newItem[0] == oldItem[0])
                    included = true
            })
            if (!included)
                changes.push(`Added item '${newItem[0]}' with status '${newItem[1]}'`)
        })

        //check for removed items
        oldTodo.forEach(oldItem => {
            let included = false
            newTodo.forEach(newItem => {
                if (oldItem[0] == newItem[0])
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
            let fail = !await pushToGithub(changes.join('\n'))
            if (fail)
                colorLog({ text: 'Error pushing to github, oldTodo is not saved', color: 'red' })
            else {
                fs.writeFileSync(oldPath, newTodo.map(item => `${item[0]}===${item[1]}`).join('\n'), 'utf8')
                colorLog({ text: 'oldTodo saved', color: 'green' })
            }
        }

        //otherwise, let the user know there is no change
        else
            colorLog({ text: 'No changes in todo list detected', color: 'blue' })
        console.log('\n')
    }
})()

function log() {

    //store all the logs here so colorLog is only called once
    let out = []

    //randomize the list
    list.sort(() => { return Math.round(Math.random() * 2 - 1) })

    let sorted = {}

    //the number of different statuses
    let statusCount = 0

    //count how many statuses there are
    for (let item of list) {
        if (!sorted[item.status]) {
            sorted[item.status] = []
            statusCount++
        }
        sorted[item.status].push(item.name)
    }

    let totalCount = list.length

    let types = Object.keys(sorted)

    types.sort(() => { return Math.round(Math.random() * 2 - 1) })

    let text = [{ text: `\n${totalCount} items:`, color: 'white' }]

    for (let i = 0; i < types.length; i++) {

        const status = types[i]

        let percent = Math.round(sorted[status].length / totalCount * 1000) / 10

        text.push({ text: ` %${percent} ${status}`, color: colorCode[status] })

        colorLog({ text: `\n%${percent} ${status} (${sorted[status].length} / ${totalCount})`, color: colorCode[status] })
        for (let name of sorted[status]) {
            colorLog([{ text: ` * ${name}`, color: colorCode[status] }])
        }
    }

    colorLog(text)

    // count the lines
    let total = 0
    for (const path of files) {
        try {
            const data = fs.readFileSync(path, 'utf8')
            total += data.split('\n').length
        } catch (err) {
            colorLog([{ text: `Error reading file ${path}: `, color: 'red' }, { text: JSON.stringify(err.message), color: 'yellow' }])
        }
    }

    colorLog([
        { text: '\nOut of ', color: 'blue' },
        { text: files.length, color: 'yellow' },
        { text: ' files you have written ', color: 'blue' },
        { text: total, color: 'yellow' },
        { text: ' lines of code\nFiles scanned:\n', color: 'blue' },
        { text: files.join('\n'), color: 'yellow' },
        { text: '\n', color: 'white' }
    ])

}

function setFilesToCount(filePaths) {
    files = filePaths
}

function setOldTodoPath(path) {
    oldPath = path
}

function setNewTodoPath(path) {
    newPath = path
}

module.exports = {
    pushIfChanged,
    log,
    setFilesToCount,
    setOldTodoPath,
    setNewTodoPath
}