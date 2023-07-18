import {QMainWindow, QTabWidget, QIcon, QStatusBar} from '@nodegui/nodegui';
import { Config } from './config';
import { Transcribe } from './transcribe';
import { Translate } from "./translate";

// =====================================================================================================================

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget();

// Initialising imported classes
let statusBar: QStatusBar = new QStatusBar();
statusBar.setObjectName('statusBar');
let config: Config = new Config(statusBar);
let translate: Translate = new Translate(config);
let transcribe: Transcribe = new Transcribe(statusBar, config, tabWidget, translate);

// Add the Tabs
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon('assets/openai-logo-icon.png'), 'Transcribe');
tabWidget.addTab(translate.translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate');
tabWidget.addTab(config.configRootWidget, new QIcon('assets/config-icon.png'), 'Config');

tabWidget.addEventListener('currentChanged', (index: number) => {
  if (index == 0)
    transcribe.refreshDataModels(transcribe.getCurrentModel());
})

// =====================================================================================================================

// Main Window
const mainWindow: QMainWindow = new QMainWindow();

mainWindow.setWindowTitle("Transcribe & Translate Tool");
// mainWindow.setFixedSize(700, 490);
mainWindow.setStatusBar(statusBar);
mainWindow.setCentralWidget(tabWidget);

mainWindow.show();
(global as any).win = mainWindow;
// =====================================================================================================================