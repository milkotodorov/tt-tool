import { QMainWindow, QTabWidget, QIcon } from '@nodegui/nodegui';
import { Config } from './config';
import { Transcribe } from './transcribe';
import { Translate } from "./translate";

// =====================================================================================================================

// Initialising imported classes
let config: Config = new Config();
let transcribe: Transcribe = new Transcribe(config);
let translate: Translate = new Translate(config);

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget();
tabWidget.addTab(transcribe.transcribeRootWidget, new QIcon('assets/openai-logo-icon.png'), 'Transcribe');
tabWidget.addTab(translate.translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate');
tabWidget.addTab(config.configRootWidget, new QIcon('assets/config-icon.png'), 'Config');

// =====================================================================================================================

// Main Window
const mainWindow: QMainWindow = new QMainWindow();

mainWindow.setWindowTitle("Transcribe & Translate Tool");
mainWindow.setFixedSize(470, 390);
mainWindow.setCentralWidget(tabWidget);

mainWindow.show();
(global as any).win = mainWindow;
// =====================================================================================================================