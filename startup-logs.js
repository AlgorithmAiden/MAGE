module.exports = function () {

    //grab the list
    const Todo = require('./utils/TodoList+')

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

    Todo.log()

    Todo.pushIfChanged()

    // Todo.fullLogAndPush(
    //     { infoColor: 'white' },
    //     [
    //         './browser/index.html',
    //         './browser/Renderstack.js',
    //         './browser/script.js',
    //         './utils/Colors.js',
    //         './utils/Misc.js',
    //         './utils/MoreMath.js',
    //         './main-node.js',
    //         './package.json',
    //         './preload.js',
    //         './setup-node.js',
    //         './startup-logs.js',
    //         './Todo.txt',
    //         './oldTodo.txt'
    //     ],
    //     false)
}