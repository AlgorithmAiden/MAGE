const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

let renderstack = []

let resizeFunction = () => { }

const render = (() => {
    function getColor(color, x, y) {
        if (typeof color == 'string')
            return color
        if (typeof color == 'object') {
            let gradient
            if (color.type == 'linear')
                gradient = ctx.createLinearGradient(x + color.x1, color.y1, x + color.x2, y + color.y2)
            if (color.type == 'conic')
                gradient = ctx.createConicGradient(color.angle, x + color.x, y + color.y)
            if (color.type == 'radial')
                gradient = ctx.createRadialGradient(x + color.x1, y + color.y1, color.r1, x + color.x2, y + color.y2, color.r2)
            for (const subColor of color.subColors)
                gradient.addColorStop(subColor.place, subColor.hex)
            return gradient
        }
    }
    return function () {
        renderstack.sort((a, b) => a.layer ?? 0 - b.layer ?? 0)
        for (let item of renderstack) {
            let mode = item.mode
            if (item.shadow) {
                const shadow = item.shadow
                ctx.shadowColor = shadow.color
                ctx.shadowBlur = shadow.blur
                ctx.shadowOffsetX = shadow.x
                ctx.shadowOffsetY = shadow.y
            } else
                ctx.shadowColor = '#00000000'
            if (!item.fill) {
                ctx.lineJoin = item.lineJoin ?? 'miter'
                ctx.lineCap = item.lineCap ?? 'butt'
            }
            if (!['clearRect', 'text'].includes(mode)) {
                ctx.beginPath()
                if (mode == 'rect')
                    ctx.rect(item.x, item.y, item.width, item.height)
                else if (mode == 'circle')
                    ctx.arc(item.x, item.y, item.r, item.startAngle, item.endAngle)
                else if (mode == 'ellipse')
                    ctx.ellipse(item.x, item.y, item.rx, item.ry, item.rotation, item.startAngle, item.endAngle)
                else if (mode == 'line') {
                    ctx.moveTo(item.x1, item.y1)
                    ctx.lineTo(item.x2, item.y2)
                }
                else if (mode == 'path') {
                    const x = item.x
                    const y = item.y
                    ctx.moveTo(x, y)
                    const scale = item.scale
                    let lastX = y
                    let lastY = x
                    function tx(X) { return (lastX + X * scale) }
                    function ty(Y) { return (lastY + Y * scale) }
                    for (const subItem of item.path) {
                        const subMode = subItem.mode
                        const move = subItem.move || false
                        if (subMode == 'line' && move) {
                            ctx.moveTo(tx(subItem.x), ty(subItem.y))
                            lastX += subItem.x * scale
                            lastY += subItem.y * scale
                        }
                        else if (subMode == 'line' && !move) {
                            ctx.lineTo(tx(subItem.x), ty(subItem.y))
                            lastX += subItem.x * scale
                            lastY += subItem.y * scale
                        }
                        else if (subMode == 'arc' && move) {

                        }
                        else if (subMode == 'arc' && !move) {
                            // ctx.arc(tx())
                        }
                        else if (subMode == 'bezierCurve' && move) {

                        }
                        else if (subMode == 'bezierCurve' && !move) {
                        }
                    }
                }
                if (item.fill) {
                    ctx.fillStyle = getColor(item.color, item.x, item.y)
                    ctx.fill()
                } else {
                    ctx.strokeStyle = getColor(item.color, item.x, item.y)
                    ctx.lineWidth = item.lineWidth
                    ctx.stroke()
                }
            } else {
                if (mode == 'clearRect') {
                    ctx.clearRect(item.x, item.y, item.width, item.width)
                }
                else if (mode == 'text') {
                    ctx.font = `${item.size}px ${item.font ?? 'Helvetica'}`
                    ctx.textAlign = item.textAlign ?? 'left'
                    ctx.textBaseline = item.textBaseline ?? 'top'
                    if (item.fill) {
                        ctx.fillStyle = getColor(item.color, item.x, item.y)
                        ctx.fillText(item.text, item.x, item.y, item.maxWidth)
                    }
                    else {
                        ctx.strokeStyle = getColor(item.color, item.x, item.y)
                        ctx.strokeText(item.text, item.x, item.y, item.maxWidth)
                    }
                }
            }
        }
        renderstack = []
    }
})()

function addToStack(item) {
    renderstack.push(item)
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    resizeFunction(canvas.width, canvas.height)
}

resize()
window.onresize = resize

function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function set(newRenderstack) {
    renderstack = newRenderstack
}

function setResizeFunction(func) {
    resizeFunction = func
}

export default {
    render,
    addToStack,
    clearScreen,
    set,
    setResizeFunction,
    resize
}