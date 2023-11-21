//grab the bridge
const { ipcMain } = require('electron');

//export everything so setup-node can run it
module.exports = function (app, BrowserWindow, win) {

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

    //send the renderstack
    function setRuneRenderstack(rune, renderstack) {
        win.webContents.send('renderstack', JSON.stringify({ rune, renderstack }))
    }

    setTimeout(() =>
        setRuneRenderstack('3', [{
            mode: 'path',
            scale: 100,
            x: 100,
            y: 100,
            path: [
                {
                    mode: 'line',
                    x: 1,
                    y: 0,
                },
                {
                    mode: 'line',
                    x: 0,
                    y: 1
                },
                {
                    mode: 'line',
                    x: -1,
                    y: 0,
                    move: true
                },
                {
                    mode: 'line',
                    x: 0,
                    y: -1
                },
            ],
            fill: false,
            lineWidth: 10,
            color: '#ffffff'
        }])
        , 1000)
}