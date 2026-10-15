// macOS:
//   1. Re-runs macdeployqt with the correct Qt libpath (nodegui-packer passes
//      -libpath=undefined due to a bug in @nodegui/packer helpers.js).
//   2. Stamps package.json version into Info.plist.
//   3. Recreates the DMG from the correctly deployed .app.
// Windows:
//   1. Stamps package.json version + app icon into qode.exe via rcedit.
// Both: cleans up dist/node_modules that pre-pack.js added.
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const plist = require('simple-plist')
const qtConfig = require('@nodegui/nodegui/config/qtConfig')
const qtHome = qtConfig.qtHome
const macdeployqt = path.join(qtHome, 'bin', 'macdeployqt')

const buildDir = path.resolve('deploy/darwin/build')
const appBundle = path.join(buildDir, 'tt-tool.app')
const dmg = path.join(buildDir, 'tt-tool.dmg')
const addon = path.join(appBundle, 'Contents/Resources/dist/node_modules/@nodegui/nodegui/build/Release/nodegui_core.node')

if (process.platform === 'darwin') {
  // Stamp the version from package.json into Info.plist.
  // The packer template hardcodes 1.0 / 1 and nothing updates it otherwise.
  const version = require('../package.json').version
  const infoPlist = path.join(appBundle, 'Contents/Info.plist')
  const info = plist.readFileSync(infoPlist)
  info.CFBundleShortVersionString = version
  info.CFBundleVersion = version
  info.CFBundleIconFile = 'dist/assets/tt-tool-icon.icns'
  plist.writeFileSync(infoPlist, info)
  console.log(`post-pack: set bundle version to ${version} and icon`)

  console.log('post-pack: running macdeployqt with correct libpath...')
  execFileSync(macdeployqt, [
    'tt-tool.app',
    `-libpath=${qtHome}`,
    `-executable=${addon}`,
    '-verbose=1',
  ], { cwd: buildDir, stdio: 'inherit' })

  console.log('post-pack: signing app bundle...')
  execFileSync('codesign', ['--deep', '--force', '--sign', '-', 'tt-tool.app'], { cwd: buildDir, stdio: 'inherit' })
  console.log('post-pack: app bundle signed')

  // Remove stale DMG so hdiutil can recreate it
  if (fs.existsSync(dmg)) fs.rmSync(dmg)

  console.log('post-pack: creating DMG...')
  execFileSync('hdiutil', [
    'create',
    '-volname', 'tt-tool',
    '-srcfolder', 'tt-tool.app',
    '-ov',
    '-format', 'UDZO',
    'tt-tool.dmg',
  ], { cwd: buildDir, stdio: 'inherit' })
  console.log(`post-pack: DMG created at ${dmg}`)
}

if (process.platform === 'win32') {
  // Stamp the version from package.json into qode.exe resource metadata.
  // file-version / product-version require four numeric parts (x.x.x.x).
  const version = require('../package.json').version
  const winVersion = version.split('.').length === 3 ? `${version}.0` : version
  const rcedit = require('rcedit')
  const qodeExe = path.resolve('deploy/win32/build/tt-tool/qode.exe')
  rcedit(qodeExe, {
    icon: path.resolve('assets/tt-tool-icon.ico'),
    'file-version': winVersion,
    'product-version': winVersion,
    'version-string': {
      ProductName: 'tt-tool',
      FileDescription: 'tt-tool',
    },
  }).then(() => {
    console.log(`post-pack: stamped icon + version ${version} on ${qodeExe}`)
  }).catch((err) => {
    console.log(`post-pack: failed to stamp icon/version on ${qodeExe}`)
    console.log(err)
  })
}

// Clean up the node_modules we injected into dist/ before packing
const distNodeModules = path.resolve('dist/node_modules')
if (fs.existsSync(distNodeModules)) {
  fs.rmSync(distNodeModules, { recursive: true })
  console.log(`post-pack: removed ${distNodeModules}`)
}
