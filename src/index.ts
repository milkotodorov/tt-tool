import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar,
  WidgetEventTypes
} from '@nodegui/nodegui'
import {Config} from './config'
import {Transcribe} from './transcribe'
import {Translate} from './translate'
import {ConsoleWindow} from "./ConsoleWindow"
import EventEmitter from "events";
import openAILogo from '../assets/openai-logo-icon.png'
import deeplLogo from '../assets/deepl-logo-icon.png'
import configIcon from '../assets/config-icon.png'

// =====================================================================================================================

//ToDo: Add app icon
//ToDo: Upgrade to latest NodeGUI with QT 6.x
//ToDo: ProgressBar when transcribing
//ToDo: ConsoleWindow with color output: Parse bash output into HTML
//      > Possible Library: https://www.npmjs.com/package/ansi-to-html
//ToDo: Available Languages for Translate & Transcode -> Configurable

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
const mainWinDim: {width: number, height: number} = {width: 720, height: 490}
const mainWindow: QMainWindow = new QMainWindow()
mainWindow.setWindowTitle("Transcribe & Translate Tool")
mainWindow.setFixedSize(mainWinDim.width, mainWinDim.height)
mainWindow.setStatusBar(statusBar)
mainWindow.setCentralWidget(tabWidget)

mainWindow.addEventListener(WidgetEventTypes.Close, (): void => {
  consoleWindow.close()
})

mainWindow.show()
statusBar.showMessage(`TT-Tool Version: ${VERSION}`, 20000);

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
  console.log('disableTranslateTab')
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