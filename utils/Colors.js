
//updates the color object from the selected color model
const updateColor = (() => {

    //all the color conversions
    function RGBToHSL(color) {
        let red = color.red
        let green = color.green
        let blue = color.blue
        red /= 100
        green /= 100
        blue /= 100
        const lightness = Math.max(red, green, blue)
        const saturation = lightness - Math.min(red, green, blue)
        const hue = saturation
            ? lightness === red
                ? (green - blue) / saturation
                : lightness === green
                    ? 2 + (blue - red) / saturation
                    : 4 + (red - green) / saturation
            : 0
        return {
            hue: (60 * hue < 0 ? 60 * hue + 360 : 60 * hue) / 360 * 100,
            saturation: 100 * (saturation ? (lightness <= 0.5 ? saturation / (2 * lightness - saturation) : saturation / (2 - (2 * lightness - saturation))) : 0),
            lightness: (100 * (2 * lightness - saturation)) / 2,
        }
    }
    function RGBAToHEX(color) {
        const red = Math.min(255, Math.round(color.red / 100 * 255)).toString(16).padStart(2, '0')
        const green = Math.min(255, Math.round(color.green / 100 * 255)).toString(16).padStart(2, '0')
        const blue = Math.min(255, Math.round(color.blue / 100 * 255)).toString(16).padStart(2, '0')
        const alpha = Math.min(255, Math.round(color.alpha / 100 * 255)).toString(16).padStart(2, '0')
        return `#${red}${green}${blue}${alpha}`
    }
    function HSLToRGB(color) {
        let saturation = color.saturation / 100
        let lightness = color.lightness / 100
        const k = n => (n + (color.hue / 100 * 360) / 30) % 12
        const a = saturation * Math.min(lightness, 1 - lightness)
        const f = n =>
            lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
        return { red: 100 * f(0), green: 100 * f(8), blue: 100 * f(4) }
    }
    function HSLToHEX(color) {
        return RGBAToHEX({ alpha: color.alpha, ...HSLToRGB(color) })
    }
    function HEXToRGBA(color) {
        let hex = color.hex
        hex = hex.slice(1)

        const red = parseInt(hex.substring(0, 2), 16)
        const green = parseInt(hex.substring(2, 4), 16)
        const blue = parseInt(hex.substring(4, 6), 16)
        const alpha = hex.length >= 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1

        return {
            red: (red / 255) * 100,
            green: (green / 255) * 100,
            blue: (blue / 255) * 100,
            alpha: alpha * 100
        }
    }
    function HEXToHSL(color) {
        return RGBToHSL(HEXToRGBA(color))
    }

    //the updateColor function itself
    return function (mode, color) {

        //update the needed values as needed
        if (mode === 'rgb') {
            Object.assign(color, RGBToHSL(color))
            color.hex = RGBAToHEX(color)
        }
        else if (mode === 'hsl') {
            Object.assign(color, HSLToRGB(color))
            color.hex = HSLToHEX(color)
        }
        else if (mode === 'hex') {
            Object.assign(color, HEXToRGBA(color), HEXToHSL(color))
        }
        else if (mode === 'alpha') {
            color.hex = RGBAToHEX(color)
        }
    }
})()

//the blank object for creating new MCs
const blankColor = {
    red: 0,
    green: 0,
    blue: 0,
    hue: 0,
    saturation: 0,
    lightness: 0,
    alpha: 100,
    hex: '#000000ff'
}

//clamps a value to a range
function clamp(color, prop, min, max) {
    color[prop] = Math.max(Math.min(color[prop], max), min)
}

//for creating the color objects
const handler = {

    //the magic set used to keep the values connected
    set: function (color, prop, value) {

        //only run if its an allowed value
        if (!['red', 'green', 'blue', 'hue', 'saturation', 'lightness', 'alpha', 'hex'].includes(prop))
            return true

        //set the value
        color[prop] = value

        //check which color model to base the update off of
        if (['red', 'green', 'blue'].includes(prop))
            updateColor('rgb', color)
        if (['hue', 'saturation', 'lightness'].includes(prop))
            updateColor('hsl', color)
        if (prop == 'hex')
            updateColor('hex', color)
        if (prop == 'alpha')
            updateColor('alpha', color)

        //clamp most values
        for (let key of ['red', 'green', 'blue', 'saturation', 'lightness', 'alpha'])
            clamp(color, key, 0, 100)

        //do some math to keep hue 0-100, looping   
        while (color.hue < 0)
            color.hue += 100
        color.hue %= 100

        //idek
        return true
    }
}

/**
 * changes the base object used for creating color objects, will change only future color objects
 * @param {Object} color the object to replace it with
 */
function changeDefaultColor(color) {
    blankColor = { ...blankColor, color }
}

/**
 * @param {Array} presets an array of arrays with [0] being prop and [1] being value
 * @returns a color object, which has red, green, blue, hue, saturation, lightness, hex, and alpha,
 * changing any of these will update the others as needed,
 * all values should be 0-100
 */
function createColor(presets = []) {

    //create the base color
    let Color = new Proxy({ ...blankColor }, handler)

    //run over any presets to the color
    if (typeof (presets[0]) == 'object')
        for (let index = 0; index < presets.length; index++) {
            Color[presets[index][0]] = presets[index][1]
        }
    else
        Color[presets[0]] = presets[1]

    //pass out the color
    return Color
}

/**
 * @param {Object Color} a a color object
 * @param {Object Color} b a color object
 * @param {number} amount 0-1
 * @returns a new color object, calculated using the rgba values
 */
function lerp(a, b, amount) {
    const ar = a.red, ag = a.green, ab = a.blue, aa = a.alpha
    const br = b.red, bg = b.green, bb = b.blue, ba = b.alpha

    const rr = ar + amount * (br - ar)
    const rg = ag + amount * (bg - ag)
    const rb = ab + amount * (bb - ab)
    const ra = aa + amount * (ba - aa)

    let Color = createColor()
    Color.red = Math.round(rr)
    Color.green = Math.round(rg)
    Color.blue = Math.round(rb)
    Color.alpha = Math.round(ra)

    return Color
}

/**
 * @param {Object Color[]} colors an array of color objects
 * @param {number} amount 0-1
 * @returns a new color object, calculated using the rgba values
 */
function multiLerp(colors, amount) {
    const section = 1 / Math.max(1, colors.length - 1)
    let index = Math.floor(amount / section)
    if (index >= colors.length - 1) {
        index = colors.length - 2
    }
    const localAmount = (amount - section * index) / section
    return lerp(colors[index], colors[index + 1], localAmount)
}

module.exports = {
    changeDefaultColor,
    createColor,
    lerp,
    multiLerp
}