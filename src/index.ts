import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar
} from '@nodegui/nodegui';
import { Config } from './config';
import { Transcribe } from './transcribe';
import { Translate } from './translate';
import {ConsoleWindow} from "./ConsoleWindow";

// =====================================================================================================================
//ToDo: Adapt Windows CSS
//ToDo: Support Whisper.cpp -> Windows / Mac x64 / Mac ARM64
//  - Automatically recognize Whisper executable & adjust parameters
//  - Automatically download ML models for ARM64 Mac & unpack
//ToDo: Automatically extract audio from video files (via cmd ffmpeg or better via node lib for ffmpeg).
//ToDo: Available Languages for Translate & Transcode -> Configurable
//ToDo: Filter selectable audio/video filetypes
//ToDo: Add default configuration file tt-tool-config.json
//ToDo: Add credits in the README to Whisper.cpp project & WinPort
//ToDo: Pack all into the nodegui-packer
//ToDo: Upgrade to latest NodeGUI (with QT 6.x)
//ToDo: ConsoleWindow with color output: Prase bash output into HTML

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget()

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar();
statusBar.setObjectName('statusBar');
let consoleWindow: ConsoleWindow = new ConsoleWindow({Width: 1024, Height: 768});
let config: Config = new Config(consoleWindow, statusBar);
let translate: Translate = new Translate(consoleWindow, statusBar, config);
let transcribe: Transcribe = new Transcribe(consoleWindow, statusBar, config, tabWidget, translate);

// Add the Tabs
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon('assets/openai-logo-icon.png'), 'Transcribe');
tabWidget.addTab(translate.translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate');
tabWidget.addTab(config.configRootWidget, new QIcon('assets/config-icon.png'), 'Config');

tabWidget.addEventListener('currentChanged', (index: number): void => {
  if (index == 0)
    transcribe.refreshDataModels(transcribe.getCurrentModel());
  if (index == 1)
    translate.setButtonsState();
})

// =====================================================================================================================

// Main Window
const mainWinDim: {width: number, height: number} = {width: 780, height: 490};
const mainWindow: QMainWindow = new QMainWindow();
mainWindow.setWindowTitle("Transcribe & Translate Tool");
mainWindow.setFixedSize(mainWinDim.width, mainWinDim.height);
mainWindow.setStatusBar(statusBar);
mainWindow.setCentralWidget(tabWidget);
mainWindow.show();

(global as any).win = mainWindow;
// =====================================================================================================================