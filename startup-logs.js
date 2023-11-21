module.exports = function () {

    //grab the list
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
}