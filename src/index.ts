import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar,
  WidgetEventTypes
} from '@nodegui/nodegui'
import { Config } from './config'
import { Transcribe } from './transcribe'
import { Translate } from './translate'
import {ConsoleWindow} from "./ConsoleWindow"

// =====================================================================================================================

// Before Release
//ToDo: Support Whisper.cpp -> Windows / Mac x64 / Mac ARM64
//  - Automatically recognize Whisper executable & adjust parameters
//  - Automatically download ML models for ARM64 Mac & unpack
//ToDo: Automatically extract audio from video files (via cmd ffmpeg or better via node lib for ffmpeg).
//ToDo: Fin better "arrow" symbol for languages in transcribe tab (Windows)
//ToDo: Pack all files with the nodegui-packer
//ToDo: Update final README
// - Add credits to Whisper.cpp project & WinPort

// Prio Low
//ToDo: Upgrade to latest NodeGUI (with QT 6.x)
//ToDo: Upon showing console window, switch back the focus to the main window
//ToDo: Available Languages for Translate & Transcode -> Configurable
//ToDo: Filter only executable files in config tab
//ToDo: ConsoleWindow with color output: Parse bash output into HTML

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget()

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar()
statusBar.setObjectName('statusBar')
let consoleWindow: ConsoleWindow = new ConsoleWindow({Width: 1024, Height: 768})
let config: Config = new Config(consoleWindow, statusBar)
let translate: Translate = new Translate(consoleWindow, statusBar, config)
let transcribe: Transcribe = new Transcribe(consoleWindow, statusBar, config, tabWidget, translate)

// Add the Tabs
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon('assets/openai-logo-icon.png'), 'Transcribe')
tabWidget.addTab(translate.translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate')
tabWidget.addTab(config.configRootWidget, new QIcon('assets/config-icon.png'), 'Config')

tabWidget.addEventListener('currentChanged', (index: number): void => {
  if (index == 0)
    transcribe.refreshDataModels(transcribe.getCurrentModel())
  if (index == 1)
    translate.setButtonsState()
})

// Trigger refreshDataModels after all the tabWidgets are created
transcribe.refreshDataModels(transcribe.getCurrentModel())

// =====================================================================================================================

// Main Window
const mainWinDim: {width: number, height: number} = {width: 700, height: 490}
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