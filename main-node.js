//grab the bridge
const { ipcMain } = require('electron');

//export everything so setup-node can run it
module.exports = function (app, BrowserWindow, win) {

    //grab the Todo
    const Todo = require('./utils/TodoList+')

    //set the files to scan
    Todo.setFilesToCount([
        './browser/index.html',
        './browser/Renderstack.js',
        './browser/script.js',
        './utils/Colors.js',
        './utils/Misc.js',
        './utils/MoreMath.js',
        './utils/TodoList+.js',
        './main-node.js',
        './preload.js',
        './setup-node.js',
        './startup-logs.js',
    ])

    //log the list / line count
    Todo.log()

    //check for changes, and push if needed
    Todo.pushIfChanged()

    //import the needed things
    const Misc = require('./utils/Misc')
    const MoreMath = require('./utils/Moremath')
    const Colors = require('./utils/Colors')

    //store the canvas size
    let canvas = { width: 0, height: 0 }

    //handle logs from the browser
    ipcMain.on('log', (event, data) => {
        Misc.colorLog([{ color: 'yellow', text: 'Log from browser: ' }, { color: 'white', text: (data) }])
    })

    //handle errors from the browser
    ipcMain.on('error', (event, data) => {
        Misc.colorLog([{ color: 'yellow', text: 'Error from browser: ' }, { color: 'red', text: (data) }])
    })

    //store the canvas size when it updates
    ipcMain.on('canvasSize', (event, data) => {
        data = JSON.parse(data)
        canvas = data
        Misc.colorLog([{ color: 'blue', text: 'Canvas size: ' }, { color: 'yellow', text: `${data.width}px / ${data.height}px` }])
    })
}