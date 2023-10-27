//grab the bridge
const { contextBridge, ipcRenderer } = require('electron')

//create the bridge
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})