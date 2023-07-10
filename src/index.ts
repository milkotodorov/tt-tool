import { QMainWindow, QWidget, QTabWidget, QLabel, FlexLayout, QPushButton, 
  QIcon, QFileDialog, FileMode, QLineEdit, QComboBox, QToolButton } from '@nodegui/nodegui';
import * as fs from 'fs';
import ISO6391 from 'iso-639-1';

// ====================================================================================================================

// Root Widgets & Layouts
const transcribeRootWidget: QWidget = new QWidget();
transcribeRootWidget.setObjectName("transcribeRootWidget");
const transcribeTabLayout: FlexLayout = new FlexLayout();
transcribeRootWidget.setLayout(transcribeTabLayout);

const translateRootWidget: QWidget = new QWidget();
translateRootWidget.setObjectName("translateRootWidget");
const translateTabLayout: FlexLayout = new FlexLayout();
translateRootWidget.setLayout(translateTabLayout);

const configRootWidget: QWidget = new QWidget();
configRootWidget.setObjectName("configRootWidget");
const configTabLayout: FlexLayout = new FlexLayout();
configRootWidget.setLayout(configTabLayout);

// Tabs Widget
const tabWidget: QTabWidget = new QTabWidget();
tabWidget.addTab(transcribeRootWidget, new QIcon('assets/openai-logo-icon.png') , 'Transcribe');
tabWidget.addTab(translateRootWidget, new QIcon('assets/deepl-logo-icon.png'), 'Translate');
tabWidget.addTab(configRootWidget, new QIcon('assets/config-icon.png'), 'Config');

// ====================================================================================================================

// 'Config Tab' Elements

// Title Widget
const configTopLabel: QLabel = new QLabel();
configTopLabel.setObjectName('configTopLabel');
configTopLabel.setText('Whisper & DeepL Configuration');

const configTitleWidget: QWidget = new QWidget();
const configTitleLayout: FlexLayout = new FlexLayout();
configTitleWidget.setObjectName('configTitleWidget');
configTitleWidget.setLayout(configTitleLayout);
configTitleLayout.addWidget(configTopLabel);

// Whisper Configuration
const whisperConfigLabel: QLabel = new QLabel();
whisperConfigLabel.setObjectName('whisperConfigLabel');
whisperConfigLabel.setText('Whisper.cpp Configuration ══════════════════');

const whisperCLIPathLabel: QLabel = new QLabel();
whisperCLIPathLabel.setObjectName('whisperCLIPathLabel');
whisperCLIPathLabel.setText('Whisper CLI Location:');
const selectWhisperCLIButton: QPushButton = new QPushButton();
selectWhisperCLIButton.setObjectName('selectWhisperCLIButton');
selectWhisperCLIButton.setText("Select");
const whisperCLILineEdit: QLineEdit = new QLineEdit();
whisperCLILineEdit.setObjectName('whisperCLILineEdit');

const whisperCLIConfigWidget: QWidget = new QWidget();
const whisperCLIConfigLayout: FlexLayout = new FlexLayout();
whisperCLIConfigWidget.setObjectName('whisperCLIConfigWidget');
whisperCLIConfigWidget.setLayout(whisperCLIConfigLayout);
whisperCLIConfigLayout.addWidget(whisperCLIPathLabel);
whisperCLIConfigLayout.addWidget(selectWhisperCLIButton);

// DeepL Configuration
const deeplConfigLabel: QLabel = new QLabel();
deeplConfigLabel.setObjectName('deeplConfigLabel');
deeplConfigLabel.setText('DeepL Configuration ═════════════════════');

const deeplAPIKeyLabel: QLabel = new QLabel();
deeplAPIKeyLabel.setObjectName('deeplAPIKeyLabel');
deeplAPIKeyLabel.setText('DeepL API Key:');
const deeplAPIKeyLineEdit: QLineEdit = new QLineEdit();
deeplAPIKeyLineEdit.setObjectName('deeplAPIKeyLineEdit');

const deeplAPIKeyWidget: QWidget = new QWidget();
const deeplAPIKeyLayout: FlexLayout = new FlexLayout();
deeplAPIKeyWidget.setObjectName('deeplAPIKeyWidget');
deeplAPIKeyWidget.setLayout(deeplAPIKeyLayout);
deeplAPIKeyLayout.addWidget(deeplAPIKeyLabel);
deeplAPIKeyLayout.addWidget(deeplAPIKeyLineEdit);

const saveConfigButton: QPushButton = new QPushButton();
saveConfigButton.setObjectName('saveConfigButton');
saveConfigButton.setText("Save");

const saveConfigWidget: QWidget = new QWidget();
const saveConfigLayout: FlexLayout = new FlexLayout();
saveConfigWidget.setObjectName('saveConfigWidget');
saveConfigWidget.setLayout(saveConfigLayout);
saveConfigLayout.addWidget(saveConfigButton);

// Fill the root layout
configTabLayout.addWidget(configTitleWidget);
configTabLayout.addWidget(whisperConfigLabel);
configTabLayout.addWidget(whisperCLIConfigWidget);
configTabLayout.addWidget(whisperCLILineEdit);
configTabLayout.addWidget(deeplConfigLabel);
configTabLayout.addWidget(deeplAPIKeyWidget);
configTabLayout.addWidget(saveConfigWidget);

// Apply the Stylesheet
configRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

// ====================================================================================================================

// Config Tab Actions

whisperCLILineEdit.setText('');

let whisperCLIFolder: String = '';
let whisperCLI: String = whisperCLIFolder + 'main';


// ====================================================================================================================

// 'Transcribe Tab' Elements

const whisperLanguages: string[] = [
  'Spanish', 
  'Italian', 
  'English', 
  'Portuguese', 
  'German', 
  'Japanese',
  'Polish', 
  'Russian', 
  'Dutch'
];
//ToDo: Fill the rest languages: https://raw.githubusercontent.com/openai/whisper/main/language-breakdown.svg

// Title Widget
const transcribeTopLabel: QLabel = new QLabel();
transcribeTopLabel.setObjectName('transcribeTopLabel');
transcribeTopLabel.setText('Transcribe audio file into text using Whisper');

const transcribeTitleWidget: QWidget = new QWidget();
const transcribeTitleLayout: FlexLayout = new FlexLayout();
transcribeTitleWidget.setObjectName('transcribeTitleWidget');
transcribeTitleWidget.setLayout(transcribeTitleLayout);

transcribeTitleLayout.addWidget(transcribeTopLabel);

// Audio File Selection Widget
const selectAudioFileLabel: QLabel = new QLabel();
selectAudioFileLabel.setObjectName('selectAudioFileLabel');
selectAudioFileLabel.setText('Audio file:');
const selectAudioFileButton: QPushButton = new QPushButton();
selectAudioFileButton.setObjectName('selectAudioFileButton');
selectAudioFileButton.setText("Select");
const audioFileComboBox: QComboBox = new QComboBox();
audioFileComboBox.setObjectName('audioFileComboBox')
audioFileComboBox.setEditable(true);
audioFileComboBox.acceptDrops()
const audioFileLanguageLabel: QLabel = new QLabel();
audioFileLanguageLabel.setObjectName('audioFileLanguageLabel');
audioFileLanguageLabel.setText('Audio language:');
const audioFileLanguageComboBox: QComboBox = new QComboBox();
audioFileLanguageComboBox.setObjectName('audioFileLanguageComboBox')
audioFileLanguageComboBox.addItems(whisperLanguages);
audioFileLanguageComboBox.setCurrentText('English');
audioFileLanguageComboBox.setToolTip('Sorted by Word Error Rate accurancy.\n'
+ 'More info: https://raw.githubusercontent.com/openai/whisper/main/language-breakdown.svg');

const audioFileRootWidget: QWidget = new QWidget();
const audioFileRootLayout: FlexLayout = new FlexLayout();
audioFileRootWidget.setObjectName('audioFileRootWidget');
audioFileRootWidget.setLayout(audioFileRootLayout);

const audioFileTopWidget: QWidget = new QWidget();
const audioFileTopLayout: FlexLayout = new FlexLayout();
audioFileTopWidget.setObjectName('audioFileTopWidget');
audioFileTopWidget.setLayout(audioFileTopLayout);

audioFileTopLayout.addWidget(selectAudioFileLabel);
audioFileTopLayout.addWidget(selectAudioFileButton);
audioFileTopLayout.addWidget(audioFileLanguageLabel);
audioFileTopLayout.addWidget(audioFileLanguageComboBox);
audioFileRootLayout.addWidget(audioFileTopWidget);
audioFileRootLayout.addWidget(audioFileComboBox);

// Whisper Options
const whisperOptionsToolButton = new QToolButton();
whisperOptionsToolButton.setObjectName('whisperOptionsToolButton')
whisperOptionsToolButton.setText('Advanced Whisper Options');
whisperOptionsToolButton.setCheckable(true);
whisperOptionsToolButton.setChecked(false);

const whisperOptionsWidget: QWidget = new QWidget();
const whisperOptionsLayout: FlexLayout = new FlexLayout();
whisperOptionsWidget.setObjectName('whisperOptionsWidget');
whisperOptionsWidget.setLayout(whisperOptionsLayout);

// Whisper Data Model
const whisperModelLabel: QLabel = new QLabel();
whisperModelLabel.setObjectName('whisperModelLabel');
whisperModelLabel.setText('Data model:');
const whisperModelComboBox: QComboBox = new QComboBox();
whisperModelComboBox.addItem(getDataModelIcon('tiny'), 'tiny');
whisperModelComboBox.addItem(getDataModelIcon('tiny.en'), 'tiny.en');
whisperModelComboBox.addItem(getDataModelIcon('base'), 'base');
whisperModelComboBox.addItem(getDataModelIcon('base.en'), 'bade.en');
whisperModelComboBox.addItem(getDataModelIcon('small'), 'small');
whisperModelComboBox.addItem(getDataModelIcon('small.en'), 'small.en');
whisperModelComboBox.addItem(getDataModelIcon('medium'), 'medium');
whisperModelComboBox.addItem(getDataModelIcon('medium.en'), 'medium.en');
whisperModelComboBox.addItem(getDataModelIcon('large-v1'), 'larve-v1');
whisperModelComboBox.addItem(getDataModelIcon('large'), 'large');
whisperModelComboBox.setCurrentText('medium.en');
whisperModelComboBox.setToolTip('Data model will be automatically selected upon language change as follows:\n' 
  + '"meduim-en" for English and "large" for everything else.');
whisperModelComboBox.setToolTipDuration(30000);
whisperModelComboBox.setMaximumWidth(140);
const whisperDataModelWidget: QWidget = new QWidget();
const whisperDataModelLayout: FlexLayout = new FlexLayout();
whisperDataModelWidget.setObjectName('whisperDataModelWidget');
whisperDataModelWidget.setLayout(whisperDataModelLayout);
whisperDataModelLayout.addWidget(whisperModelLabel);
whisperDataModelLayout.addWidget(whisperModelComboBox);

// Whisper Output Format
const whisperOutputFormatLabel: QLabel = new QLabel();
whisperOutputFormatLabel.setObjectName('whisperOutputFormatLabel');
whisperOutputFormatLabel.setText('Output format:');
const whisperOutputFormatComboBox: QComboBox = new QComboBox();
whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt', 'wts', 'csv']);
whisperOutputFormatComboBox.setCurrentText('srt');
const whisperOutputFormatWidget: QWidget = new QWidget();
const whisperOutputFormatLayout: FlexLayout = new FlexLayout();
whisperOutputFormatWidget.setObjectName('whisperOutputFormatWidget');
whisperOutputFormatWidget.setLayout(whisperOutputFormatLayout);
whisperOutputFormatLayout.addWidget(whisperOutputFormatLabel);
whisperOutputFormatLayout.addWidget(whisperOutputFormatComboBox);

// Whisper Additional Parameters
const textSegmentsLeengthLabel: QLabel = new QLabel();
textSegmentsLeengthLabel.setObjectName('textSegmentsLeengthLabel');
textSegmentsLeengthLabel.setText('Text segments length:');
const textSegmentsLeengthQLineEdit: QLineEdit = new QLineEdit();
textSegmentsLeengthQLineEdit.setObjectName('textSegmentsLeengthQLineEdit');
textSegmentsLeengthQLineEdit.setText('150');
textSegmentsLeengthQLineEdit.setMaximumWidth(37);

const whisperSegmentsLengthWidget: QWidget = new QWidget();
const whisperSegmentsLengthLayout: FlexLayout = new FlexLayout();
whisperSegmentsLengthWidget.setObjectName('whisperSegmentsLengthWidget');
whisperSegmentsLengthWidget.setLayout(whisperSegmentsLengthLayout);
whisperSegmentsLengthLayout.addWidget(textSegmentsLeengthLabel);
whisperSegmentsLengthLayout.addWidget(textSegmentsLeengthQLineEdit);

whisperOptionsLayout.addWidget(whisperDataModelWidget);
whisperOptionsLayout.addWidget(whisperOutputFormatWidget);
whisperOptionsLayout.addWidget(whisperSegmentsLengthWidget);
whisperOptionsWidget.hide();

// Start Transcribe Button
const transcribeStartButton: QPushButton = new QPushButton();
transcribeStartButton.setText('Start\nTranscribe')

// Start Transcribe Button
const transcribeCancelButton: QPushButton = new QPushButton();
transcribeCancelButton.setText('Cancel\nTranscribe')

// Start Transcribe Button
const transferToTranslateButton: QPushButton = new QPushButton();
transferToTranslateButton.setText('Tranlate\nTranscribed File')

// Space between the buttons - to be improved
const transcribeButtonsSpacer1Label: QLabel = new QLabel();
transcribeButtonsSpacer1Label.setObjectName('transcribeButtonsSpacer1Label');
const transcribeButtonsSpacer2Label: QLabel = new QLabel();
transcribeButtonsSpacer2Label.setObjectName('transcribeButtonsSpacer2Label');

// Buttons Widget
const actionButtonsWidget: QWidget = new QWidget();
const actionButtonsLayout: FlexLayout = new FlexLayout();
actionButtonsWidget.setObjectName('actionButtonsWidget');
actionButtonsWidget.setLayout(actionButtonsLayout);
actionButtonsLayout.addWidget(transcribeStartButton);
actionButtonsLayout.addWidget(transcribeButtonsSpacer1Label);
actionButtonsLayout.addWidget(transcribeCancelButton);
actionButtonsLayout.addWidget(transcribeButtonsSpacer2Label);
actionButtonsLayout.addWidget(transferToTranslateButton);

// Fill the tab root layout
transcribeTabLayout.addWidget(transcribeTitleWidget);
transcribeTabLayout.addWidget(audioFileRootWidget);
transcribeTabLayout.addWidget(whisperOptionsToolButton);
transcribeTabLayout.addWidget(whisperOptionsWidget);
transcribeTabLayout.addWidget(actionButtonsWidget);

// Apply the Stylesheet
transcribeRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

// ====================================================================================================================

// 'Transcribe Tab' Actions

selectAudioFileButton.addEventListener('clicked', () => {
  const fileDialog: QFileDialog = new QFileDialog();
  fileDialog.setFileMode(FileMode.ExistingFile);
  // fileDialog.setNameFilter('Videos/Audios (*.mp4 *.wav)');
  fileDialog.exec();
  audioFileComboBox.addItem(new QIcon('assets/audio-file-icon.png'), fileDialog.selectedFiles()[0]);
});

whisperOptionsToolButton.addEventListener('clicked', () => {
  if (whisperOptionsWidget.isHidden())
    whisperOptionsWidget.show();
  else
    whisperOptionsWidget.hide();
});

whisperModelComboBox.addEventListener('currentTextChanged', (text) => {
  console.log('Model selected: ' + text);
});

transcribeStartButton.addEventListener('clicked', () => {
  const { spawn } = require('node:child_process');
  let prc: any;
  
  if (process.platform == 'win32') {
    prc = spawn('');
  }
  
  if (process.platform == 'darwin') {
    console.log('MacOS detected');
    prc = spawn(whisperCLI, 
            ['-pc', '-f', 'samples/jfk.wav'], 
            {cwd: whisperCLIFolder}
          );
  }

  prc.stdout.on('data', (data: any) => {
    console.log(data.toString());
  });

  prc.stderr.on('data', (data: any) => {
    console.error(data.toString());
  });

  prc.on('exit', (code: any) => {
    console.log(`Child exited with code ${code}`);
  });
});

transcribeCancelButton.addEventListener('clicked', () => {
});

transferToTranslateButton.addEventListener('clicked', () => {
});

// ====================================================================================================================

// 'Translate Tab' Elements

const deeplLanguages: string[] = [
  'Bulgarian',
  'Chinese',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Estonian',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Hungarian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Latvian',
  'Lithuanian',
  'Norwegian',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Slovak',
  'Slovenian',
  'Spanish',
  'Swedish',
  'Turkish',
  'Ukrainian'
];

const translateTopLabel: QLabel = new QLabel();
translateTopLabel.setObjectName('translateTopLabel');
translateTopLabel.setText('Translate file using DeepL');

const translateTitleWidget: QWidget = new QWidget();
const translateTitleLayout: FlexLayout = new FlexLayout();
translateTitleWidget.setObjectName('translateTitleWidget');
translateTitleWidget.setLayout(translateTitleLayout);
translateTitleLayout.addWidget(translateTopLabel);

// Substitle File for Translation Selection Widget
const selectTranslateFileLabel: QLabel = new QLabel();
selectTranslateFileLabel.setObjectName('selectTranslateFileLabel');
selectTranslateFileLabel.setText('Subtitle file:');
const selectTranslateFileButton: QPushButton = new QPushButton();
selectTranslateFileButton.setObjectName('selectTranslateFileButton');
selectTranslateFileButton.setText("Select");
const translateFileComboBox: QComboBox = new QComboBox();
translateFileComboBox.setObjectName('translateFileComboBox')
translateFileComboBox.setEditable(true);
translateFileComboBox.acceptDrops()
const translateFileSpacerLabel: QLabel = new QLabel();
translateFileSpacerLabel.setObjectName('translateFileSpacerLabel');
const translateFileArrowLabel: QLabel = new QLabel();
translateFileArrowLabel.setObjectName('translateFileArrowLabel');
translateFileArrowLabel.setText('→');
const translateFileSourceLanguageComboBox: QComboBox = new QComboBox();
translateFileSourceLanguageComboBox.setObjectName('translateFileSourceLanguageComboBox')
translateFileSourceLanguageComboBox.addItems(deeplLanguages); 
translateFileSourceLanguageComboBox.setCurrentText('English');
const translateFileTargetLanguageComboBox: QComboBox = new QComboBox();
translateFileTargetLanguageComboBox.setObjectName('translateFileTargetLanguageComboBox')
translateFileTargetLanguageComboBox.addItems(deeplLanguages); 
translateFileTargetLanguageComboBox.setCurrentText('German');

const translateFileRootWidget: QWidget = new QWidget();
const translateFileRootLayout: FlexLayout = new FlexLayout();
translateFileRootWidget.setObjectName('translateFileRootWidget');
translateFileRootWidget.setLayout(translateFileRootLayout);

const translateFileTopWidget: QWidget = new QWidget();
const translateFileTopLayout: FlexLayout = new FlexLayout();
translateFileTopWidget.setObjectName('translateFileTopWidget');
translateFileTopWidget.setLayout(translateFileTopLayout);

translateFileTopLayout.addWidget(selectTranslateFileLabel);
translateFileTopLayout.addWidget(selectTranslateFileButton);
translateFileTopLayout.addWidget(translateFileSpacerLabel);
translateFileTopLayout.addWidget(translateFileSourceLanguageComboBox);
translateFileTopLayout.addWidget(translateFileArrowLabel);
translateFileTopLayout.addWidget(translateFileTargetLanguageComboBox);
translateFileRootLayout.addWidget(translateFileTopWidget);
translateFileRootLayout.addWidget(translateFileComboBox);

// Start Transcribe Button
const translateButton: QPushButton = new QPushButton();
translateButton.setText('Start\nTranslation')


// Fill the root layout
translateTabLayout.addWidget(translateTitleWidget);
translateTabLayout.addWidget(translateFileRootWidget);
translateTabLayout.addWidget(translateButton);

// Apply the Stylesheet
translateRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

// ====================================================================================================================

// Functions

function isDataModelExist(dataModelName: String): boolean {
  let whisperRootPath: String = whisperCLIFolder;
  let whisperModelsPath = whisperRootPath + 'models/ggml-' + dataModelName + '.bin';
  if (fs.existsSync(whisperModelsPath)) {
    return true;
  }

  return false;
}

function getDataModelIcon(dataModelName: String): QIcon {
  if (isDataModelExist(dataModelName))
    return new QIcon('assets/green-dot-icon.png');
  else 
    return new QIcon('assets/gray-dot-icon.png')
}

// ====================================================================================================================

// Main Window
const mainWindow: QMainWindow = new QMainWindow();

mainWindow.setWindowTitle("Transcribe & Translate Tool");
mainWindow.setFixedSize(470, 390);
mainWindow.setCentralWidget(tabWidget);

mainWindow.show();
(global as any).win = mainWindow;
// ====================================================================================================================