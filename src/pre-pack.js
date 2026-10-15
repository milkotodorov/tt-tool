// Copies @nodegui/nodegui and its transitive runtime dependencies into
// dist/node_modules before nodegui-packer runs, so macdeployqt picks them
// up when building the DMG. Cleaned up by post-pack.js after packing.
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// These are already handled by macdeployqt or are build-only tools
const EXCLUDE = new Set([
  '@nodegui/qode',      // binary embedded in app by macdeployqt
  'cmake-js',           // build tool
  'node-api-headers',   // build-time headers
  'node-addon-api',     // build-time headers
  '7zip-bin',           // build tool
  '7zip-min',           // build tool
])

function collectDeps(pkgName, seen = new Set()) {
  if (seen.has(pkgName) || EXCLUDE.has(pkgName)) return seen
  seen.add(pkgName)
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join('node_modules', pkgName, 'package.json'), 'utf8'))
    for (const dep of Object.keys(pkg.dependencies || {})) {
      collectDeps(dep, seen)
    }
  } catch (e) { /* scoped packages with slashes in path - ignore missing */ }
  return seen
}

const needed = collectDeps('@nodegui/nodegui')

let copied = 0
for (const pkg of needed) {
  const src = path.join('node_modules', pkg)
  const dest = path.join('dist', 'node_modules', pkg)
  if (!fs.existsSync(src)) continue
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (s) => !s.includes(path.sep + 'miniqt' + path.sep) && !s.endsWith(path.sep + 'miniqt'),
  })
  copied++
}

console.log(`pre-pack: copied ${copied} packages to dist/node_modules`)

// Fix the rpath on nodegui_core.node so it finds Qt frameworks at
// @executable_path/../Frameworks (where macdeployqt places them)
// instead of the now-absent miniqt/ directory.
if (process.platform === 'darwin') {
  const addon = path.join('dist', 'node_modules', '@nodegui', 'nodegui', 'build', 'Release', 'nodegui_core.node')
  if (fs.existsSync(addon)) {
    const oldRpath = '@loader_path/../../miniqt/6.10.2/macos/lib'
    const newRpath = '@executable_path/../Frameworks'
    execSync(`install_name_tool -rpath "${oldRpath}" "${newRpath}" "${addon}"`)
    console.log(`pre-pack: patched rpath on nodegui_core.node`)
  }
}

