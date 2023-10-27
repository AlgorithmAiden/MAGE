//grab the bridge
const { ipcMain } = require('electron');

//export everything so setup-node can run it
module.exports = function (app, BrowserWindow, win) {

    //import the needed things
    const Misc = require('./utils/misc')
    const MoreMath = require('./utils/moremath')
    const Colors = require('./utils/colors')

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
        Misc.colorLog([{ color: 'yellow', text: 'Canvas size: ' }, { color: 'blue', text: `${data.width}px / ${data.height}px` }])
    })

    //send the renderstack
    function setRuneRenderstack(rune, renderstack) {
        win.webContents.send('renderstack', JSON.stringify({ rune, renderstack }))
    }

    setTimeout(() => setRuneRenderstack('1', [{ mode: 'rect', fill: true, x: 100, y: 100, width: 100, height: 100, color: '#00ff0066' }]), 1000)
    setInterval(() => {
        setRuneRenderstack('2', [
            {
                mode: 'rect',
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
                fill: true,
                color: {
                    type: 'linear',
                    x1: 0,
                    y1: 0,
                    x2: canvas.width,
                    y2: canvas.height,
                    subColors: [
                        { place: 1, hex: '#ff000010' },
                        { place: .5, hex: '#00ff0010' },
                        { place: 0, hex: '#0000ff10' }
                    ]
                }
            }
        ])
    }, 1000/50)
}