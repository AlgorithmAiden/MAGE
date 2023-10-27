/**
 * gives you a random decimal number in range 
 * @param {number} min 
 * @param {number} max 
 * @param {number} round if true rounds the output
 * @returns 
 */
function range(min, max, round) {
    if (!round) { return Math.random() * (max - min) + min }
    else { return Math.round(Math.random() * (max - min) + min) }
}

/**
 * forces the number in range
 * @param {number} i
 * @param {number} min
 * @param {number} max 
 * @returns 
 */
function clamp(i, min, max) {
    return Math.min(Math.max(i, min), max)
}

/**
 * gives you a number evenly spaced throughout a line
 * @param {number} min 
 * @param {number} max 
 * @param {number} numberOfSteps 
 * @param {number} index starts at 1
 * @returns 
 */
function distribute(min, max, numberOfSteps, index) {
    return (max - min) / numberOfSteps * index + min
}

/**
 * for moving in a grid with polar
 * @param {number} x 
 * @param {number} y 
 * @param {number} angle 0-360 
 * @param {number} distance 
 * @returns
 */
function gridPlusPolar(x, y, angle, distance) {
    angle %= 360
    let angleInRadians = angle / 180 * Math.PI
    let newX = x + Math.sin(angleInRadians) * distance
    let newY = y - Math.cos(angleInRadians) * distance
    return { x: newX, y: newY }
}

/**
 * finds the distance and angle from x1/y1 to x2/y2
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns 
 */
function gridDistance(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2) { return ({ distance: 0, angle: 0 }) }
    let dx = x2 - x1
    let dy = y2 - y1
    let distance = Math.sqrt(dx * dx + dy * dy)
    let angle = (Math.atan2(dx, -dy) * (180 / Math.PI) + 360) % 360
    return { distance, angle }
}

module.exports = {
    range,
    clamp,
    distribute,
    gridPlusPolar,
    gridDistance
}

function rotatePoint(baseX, baseY, x, y, rotation) {
    // Convert the rotation value to radians
    let radians = (rotation * 2 * Math.PI) / 100;

    // Translate the point to the origin
    let translatedX = x - baseX;
    let translatedY = y - baseY;

    // Perform the rotation
    let rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    let rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

    // Translate the point back
    let finalX = rotatedX + baseX;
    let finalY = rotatedY + baseY;

    return { x: finalX, y: finalY };
}
