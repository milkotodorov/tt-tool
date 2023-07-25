import {
  QMainWindow,
  QTabWidget,
  QIcon,
  QStatusBar
} from '@nodegui/nodegui';
import { Config } from './config';
import { Transcribe } from './transcribe';
import { Translate } from "./translate";

// =====================================================================================================================
//ToDo: Adapt Windows CSS
//ToDo: Show Console / ToggleConsole Button
//ToDo: Available Languages for Translate & Transcode -> Configurable
//ToDo: Filter selectable audio/video filetypes
//ToDo: Automatically extract audio from video files (via cmd ffmpeg or better via node lib for ffmpeg).
//ToDo: Support Whisper.cpp -> Windows / Mac x64 / Mac ARM64
//  - Automatically recognize Whisper executable & adjust parameters
//  - Automatically download ML models for ARM64 Mac & unpack
//ToDo: Add default configuration file tt-tool-config.json
//ToDo: Add License before publishing
//ToDo: Add credits in the README to Whisper.cpp project & WinPort
//ToDo: Pack all into the nodegui-packer

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget()

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar();
statusBar.setObjectName('statusBar');
let config: Config = new Config(statusBar);
let translate: Translate = new Translate(statusBar, config);
let transcribe: Transcribe = new Transcribe(statusBar, config, tabWidget, translate);

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
const mainWindow: QMainWindow = new QMainWindow();

mainWindow.setWindowTitle("Transcribe & Translate Tool");
mainWindow.setFixedSize(700, 490);
mainWindow.setStatusBar(statusBar);
mainWindow.setCentralWidget(tabWidget);

mainWindow.show();
(global as any).win = mainWindow;
// =====================================================================================================================