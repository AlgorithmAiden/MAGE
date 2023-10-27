import Renderstack from "./Renderstack.js"

//send all console.logs to the node side
const originalConsoleLog = console.log
console.log = (...messages) => {
    originalConsoleLog(messages)
    window.api.send('log', JSON.stringify(messages.join(', ')))
}

//send all errors to the node side
window.onerror = function (message, source, lineno, colno, error) {
    window.api.send('error', JSON.stringify(`Uncaught Error: ${message} at ${source}:${lineno}:${colno}`))
}

//send the size of the screen to the node side
Renderstack.setResizeFunction((width, height) => {
    window.api.send('canvasSize', JSON.stringify({width,height}))
})

//hold the stacks
let runeRenderstacks = {}

    ;//the render loop
(function render() {
    let renderstack = []

    for (let rune in runeRenderstacks)
        renderstack = [...renderstack, ...runeRenderstacks[rune]]

    Renderstack.clearScreen()
    Renderstack.set(renderstack)
    Renderstack.render()

    requestAnimationFrame(render)
})()

//pass on the renderstack from the node side
window.api.receive('renderstack', (data) => {
    data = JSON.parse(data)
    runeRenderstacks[data.rune] = data.renderstack
})

//resize when the window is done loading
window.onload = () => {
    Renderstack.resize()
}