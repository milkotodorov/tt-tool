import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar,
  WidgetEventTypes, FocusReason
} from '@nodegui/nodegui'
import {Config} from './config'
import {Transcribe} from './transcribe'
import {Translate} from './translate'
import {ConsoleWindow} from "./ConsoleWindow"
import EventEmitter from "events";

// =====================================================================================================================

// Before Release
//ToDo: Windows buttons - adjust size
//ToDo: Save WhisperCLI Type in config - if not defined use default.
//ToDo: Automatically extract audio from video files (via cmd ffmpeg or better via node lib for ffmpeg).
//ToDo: Automatically download ML models for ARM64 Mac & unpack
//ToDo: Pack all files with the nodegui-packer
//ToDo: Update final README
//  -- Add FFMpeg as requirements when you use tools other than whisper.cpp
//ToDo: Add system tray icon: https://github.com/sitepoint-editors/memesearchapp-nodegui-tutorial/blob/master/src/index.js#L132-L153

// Prio Low
//ToDo: Upgrade to latest NodeGUI (with QT 6.x)
//ToDo: ProgressBar when transcribing
//ToDo: Available Languages for Translate & Transcode -> Configurable
//ToDo: Set ConsoleFont MesloLGS NF with application font (work around is to install it from fonts)
//ToDo: Filter only executable files in config tab
//ToDo: ConsoleWindow with color output: Parse bash output into HTML
// Possible Library: https://www.npmjs.com/package/ansi-to-html

// Root EventEmitter
let eventEmitter: EventEmitter = new EventEmitter();

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget()

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar()
statusBar.setObjectName('statusBar')
let consoleWindow: ConsoleWindow = new ConsoleWindow({Width: 1024, Height: 768})
let config: Config = new Config(consoleWindow, statusBar)
let translate: Translate = new Translate(consoleWindow, statusBar, config)
let transcribe: Transcribe = new Transcribe(consoleWindow, statusBar, config, eventEmitter, translate)

// Add the Tabs
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon('assets/openai-logo-icon.png'), 'Transcribe')
tabWidget.addTab(translate.translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate')
tabWidget.addTab(config.configRootWidget, new QIcon('assets/config-icon.png'), 'Config')

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

mainWindow.show();

(global as any).win = mainWindow

// =====================================================================================================================
// Event Listeners
tabWidget.addEventListener('currentChanged', (index: number): void => {
  if (index == 0)
    transcribe.refreshDataModels(transcribe.getCurrentModel())
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