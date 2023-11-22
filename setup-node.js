//grab electron
const { app, BrowserWindow } = require('electron')

//and path
const path = require('path')

//a place to store the win
let win

//create a function for creating browser windows
const createWindow = () => {

    const debugMode = false
    if (!debugMode) {

        //create the browser window
        win = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            },
            transparent: true,
            frame: false,
            width: 0,
            height: 0,
            minimizable: false,
            closable: false,
            focusable: false,
            skipTaskbar: true,
            alwaysOnTop: true,
        })

        //let the mouse thru
        win.setIgnoreMouseEvents(true)

        //keep it here
        win.setVisibleOnAllWorkspaces(true)

        //make the browser fill the screen
        win.setFullScreen(true)
    } else {
        //create the browser window
        win = new BrowserWindow({
            width: 500,
            height: 500,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js')
            },
        })
    }
    //run the browser html
    win.loadFile('./browser/index.html')
}

//wait for the app to load
app.whenReady().then(() => {

    //then create a window
    createWindow()

    //run every time the app "activates"
    app.on('activate', () => {

        //create a new browser window if needed
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    //run the main-node file, passing in the needed objects
    require('./main-node.js')(app, BrowserWindow, win)
})

//if the window is closes, kill the node side
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})