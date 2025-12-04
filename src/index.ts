import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar,
  WidgetEventTypes
} from '@nodegui/nodegui'
import {Config} from './Config'
import {Transcribe} from './Transcribe'
import {Translate} from './Translate'
import {ConsoleWindow} from "./ConsoleWindow"
import {execSync} from 'child_process'
import EventEmitter from "events"
import openAILogo from '../assets/openai-logo-icon.png'
import deeplLogo from '../assets/deepl-logo-icon.png'
import configIcon from '../assets/config-icon.png'
import ttToolIcon from '../assets/tt-tool-icon.png'
import fs from "fs"

// =====================================================================================================================
//ToDo: Fix init-packer first run not working on Windows
//ToDo: ProgressBar when transcribing
//ToDo: ConsoleWindow with color output: Parse bash output into HTML
//      > Possible Library: https://www.npmjs.com/package/ansi-to-html
//ToDo: Available Languages for Translate & Transcode -> Configurable
//ToDo: Test under Linux
//ToDo: Add app icon for Linux

// =====================================================================================================================

// App Version defined in WebPack
declare const VERSION: string

// Root EventEmitter
let eventEmitter: EventEmitter = new EventEmitter()

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget()

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar()
statusBar.setObjectName('statusBar')
let consoleWindow: ConsoleWindow = new ConsoleWindow({Width: 1024, Height: 768})
consoleWindow.log('TT-Tool Version:', VERSION, '\n\n')
let config: Config = new Config(consoleWindow, statusBar)
let translate: Translate = new Translate(consoleWindow, statusBar, config)
let transcribe: Transcribe = new Transcribe(consoleWindow, statusBar, config, eventEmitter, translate)

// Add the Tabs
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon(openAILogo), 'Transcribe')
tabWidget.addTab(translate.translateRootWidget, new QIcon(deeplLogo), 'Translate')
tabWidget.addTab(config.configRootWidget, new QIcon(configIcon), 'Config')

// =====================================================================================================================
// Main Window
function isDarkModeWindows(): boolean {
  try {
    if (process.platform !== 'win32')
      return false;

    const result = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme',
      { encoding: 'utf8' }
    );

    // If AppsUseLightTheme is 0, dark mode is enabled
    return result.includes('0x0');
  } catch (err) {
    consoleWindow.log('Failed to detect Windows dark mode:', err);
    return false;
  }
}

// =====================================================================================================================
// Main Window
const mainWindow: QMainWindow = new QMainWindow()
let mainWinDim: {width: number, height: number}

if (process.platform === 'win32' && isDarkModeWindows()) {
    mainWinDim = {width: 720, height: 550}
} else {
    mainWinDim = {width: 720, height: 490}
}

mainWindow.setWindowTitle("Transcribe & Translate Tool")
mainWindow.setFixedSize(mainWinDim.width, mainWinDim.height)
mainWindow.setStatusBar(statusBar)
mainWindow.setCentralWidget(tabWidget)

mainWindow.addEventListener(WidgetEventTypes.Close, (): void => {
  consoleWindow.close()
})

mainWindow.setWindowIcon(new QIcon(ttToolIcon))
mainWindow.show()
statusBar.showMessage(`TT-Tool Version: ${VERSION}`, 20000);

if (process.platform === 'win32')
  if(isDarkModeWindows()) {
    // Apply dark stylesheet
    mainWindow.setStyleSheet(fs.readFileSync('dist/css/dark-mode-win32.css', 'utf8'));
  } else {
    mainWindow.setStyleSheet(fs.readFileSync('dist/css/light-mode-win32.css', 'utf8'));
  }

(global as any).win = mainWindow

// =====================================================================================================================
// Event Listeners
tabWidget.addEventListener('currentChanged', (index: number): void => {
  if (index == 0)
    transcribe.refreshDataModels(transcribe.getCurrentModel())
    transcribe.refreshSupportedSubtitlesFormats()
  if (index == 1)
    translate.setButtonsState()
})

eventEmitter.on('disableTranslateTab', (): void => {
  tabWidget.widget(1).setEnabled(false)
})

eventEmitter.on('enableTranslateTab', (): void => {
  tabWidget.widget(1).setEnabled(true)
})

eventEmitter.on('disableConfigTab', (): void => {
  tabWidget.widget(2).setEnabled(false)
})

eventEmitter.on('enableConfigTab', (): void => {
  tabWidget.widget(2).setEnabled(true)
})

eventEmitter.on('showTranslateTab', (): void => {
  tabWidget.setCurrentIndex(1)
})

eventEmitter.on('activateMainWindow', (): void => {
  mainWindow.activateWindow()
})
// ===============================-=====================================================================================