const os = require('os')
const rcedit = require('rcedit')

// Replaces the default icon of the main executable file - qode.exe
if (os.platform() === 'win32') {
  rcedit('./node_modules/@nodegui/qode/binaries/qode.exe', {
    icon: './assets/tt-tool-icon.ico'
  })
}