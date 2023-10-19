const os = require("os")
const fs = require("fs")
const plist = require("simple-plist")
const rcedit = require("rcedit")

// Replaces the default icon of the main executable file qode.exe for Windows
if (os.platform() === 'win32') {
  let iconAlreadySetDummyFile = './node_modules/@nodegui/qode/win-icon-already-set.dummy'
  if (!fs.existsSync(iconAlreadySetDummyFile)) {
    try {
      let qodeBinFile = './node_modules/@nodegui/qode/binaries/qode.exe'
      rcedit(qodeBinFile, {icon: './assets/tt-tool-icon.ico'})
    } catch (err) {
      console.log(`Error while setting icon of the ${qodeBinFile} file`)
      console.log(err)
    }
    // Create a dummy file in order to determine whether the icon has been already set or not
    fs.writeFileSync(iconAlreadySetDummyFile, "")
  }
}

// Adds app icon into the Info.plist file for MacOS
if (os.platform() === 'darwin') {
  let infoPlistJSON
  let infoPlistFile = 'deploy/darwin/tt-tool.app/Contents/Info.plist'

  try {
    infoPlistJSON = plist.readFileSync(infoPlistFile)
  } catch (err) {
    console.log(`Error while reading the MacOS app description file ${infoPlistFile}`)
    console.log("The TT-Tool app must be build and packed first using 'npm run pack' before you can set the icon.\n")
    console.log(err)
    return
  }

  if (!infoPlistJSON['CFBundleIconFile']) {
    // Adding app icon file
    infoPlistJSON['CFBundleIconFile'] = 'dist/assets/tt-tool-icon.icns'
  }
  else
    return

  try {
    plist.writeFileSync(infoPlistFile, infoPlistJSON)
  } catch (err) {
    console.log(`Error while writing into the MacOS app description file ${infoPlistFile}`)
    console.log(err)
    return
  }
}