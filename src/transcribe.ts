import { FileMode, FlexLayout, QComboBox, QFileDialog, QIcon, QLabel,
  QLineEdit, QPushButton, QToolButton, QWidget } from "@nodegui/nodegui";
import * as fs from 'fs';
import { Config } from './config';

export class Transcribe {
  // Configuration
  private config: Config;

  // Whisper Languages
  private readonly whisperLanguages: string[];

  // Root Widgets & Layouts
  public transcribeRootWidget: QWidget;
  public transcribeTabLayout: FlexLayout;

  // Title Widget
  private transcribeTopLabel: QLabel;
  private transcribeTitleWidget: QWidget;
  private transcribeTitleLayout: FlexLayout;

  // Audio File Selection Widget
  private selectAudioFileLabel: QLabel;
  private selectAudioFileButton: QPushButton;
  private audioFileComboBox: QComboBox;
  private audioFileLanguageLabel: QLabel;
  private audioFileLanguageComboBox: QComboBox;
  private audioFileRootWidget: QWidget;
  private audioFileRootLayout: FlexLayout;
  private audioFileTopWidget: QWidget;
  private audioFileTopLayout: FlexLayout;

  // Whisper Options
  private whisperOptionsToolButton: QToolButton;
  private whisperOptionsWidget: QWidget;
  private whisperOptionsLayout: FlexLayout;

  // Whisper Data Model
  private whisperModelLabel: QLabel;
  private whisperModelComboBox: QComboBox;
  private whisperDataModelWidget: QWidget;
  private whisperDataModelLayout: FlexLayout;

  // Whisper Output Format
  private whisperOutputFormatLabel: QLabel;
  private whisperOutputFormatComboBox: QComboBox;
  private whisperOutputFormatWidget: QWidget;
  private whisperOutputFormatLayout: FlexLayout;

  // Whisper Additional Parameters
  private textSegmentsLeengthLabel: QLabel;
  private textSegmentsLeengthQLineEdit: QLineEdit;
  private whisperSegmentsLengthWidget: QWidget;
  private whisperSegmentsLengthLayout: FlexLayout;  

  // Action Buttons
  private transcribeStartButton: QPushButton;
  private transcribeCancelButton: QPushButton;
  private transferToTranslateButton: QPushButton;
  private transcribeButtonsSpacer1Label: QLabel;
  private transcribeButtonsSpacer2Label: QLabel;

  // Buttons Widget
  private actionButtonsWidget: QWidget;
  private actionButtonsLayout: FlexLayout;

  constructor(config: Config) {
    this.config = config;

    this.whisperLanguages = [
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

    // Root Widgets & Layouts
    this.transcribeRootWidget = new QWidget();
    this.transcribeRootWidget.setObjectName("transcribeRootWidget");
    this.transcribeTabLayout = new FlexLayout();
    this.transcribeRootWidget.setLayout(this.transcribeTabLayout);

    // Title Widget
    this.transcribeTopLabel = new QLabel();
    this.transcribeTopLabel.setObjectName('transcribeTopLabel');
    this.transcribeTopLabel.setText('Transcribe audio file into text using Whisper');

    this.transcribeTitleWidget = new QWidget();
    this.transcribeTitleLayout = new FlexLayout();
    this.transcribeTitleWidget.setObjectName('transcribeTitleWidget');
    this.transcribeTitleWidget.setLayout(this.transcribeTitleLayout);

    this.transcribeTitleLayout.addWidget(this.transcribeTopLabel);

    // Audio File Selection Widget
    this.selectAudioFileLabel = new QLabel();
    this.selectAudioFileLabel.setObjectName('selectAudioFileLabel');
    this.selectAudioFileLabel.setText('Audio file:');
    this.selectAudioFileButton = new QPushButton();
    this.selectAudioFileButton.setObjectName('selectAudioFileButton');
    this.selectAudioFileButton.setText("Select");
    this.audioFileComboBox = new QComboBox();
    this.audioFileComboBox.setObjectName('audioFileComboBox')
    this.audioFileComboBox.setEditable(true);
    this.audioFileComboBox.acceptDrops()
    this.audioFileLanguageLabel = new QLabel();
    this.audioFileLanguageLabel.setObjectName('audioFileLanguageLabel');
    this.audioFileLanguageLabel.setText('Audio language:');
    this.audioFileLanguageComboBox = new QComboBox();
    this.audioFileLanguageComboBox.setObjectName('audioFileLanguageComboBox')
    this.audioFileLanguageComboBox.addItems(this.whisperLanguages);
    this.audioFileLanguageComboBox.setCurrentText('English');
    this.audioFileLanguageComboBox.setToolTip('Sorted by Word Error Rate accurancy.\n' 
        + 'More info: https://raw.githubusercontent.com/openai/whisper/main/language-breakdown.svg');

    this.audioFileRootWidget = new QWidget();
    this.audioFileRootLayout = new FlexLayout();
    this.audioFileRootWidget.setObjectName('audioFileRootWidget');
    this.audioFileRootWidget.setLayout(this.audioFileRootLayout);
    
    this.audioFileTopWidget = new QWidget();
    this.audioFileTopLayout = new FlexLayout();
    this.audioFileTopWidget.setObjectName('audioFileTopWidget');
    this.audioFileTopWidget.setLayout(this.audioFileTopLayout);
    
    this.audioFileTopLayout.addWidget(this.selectAudioFileLabel);
    this.audioFileTopLayout.addWidget(this.selectAudioFileButton);
    this.audioFileTopLayout.addWidget(this.audioFileLanguageLabel);
    this.audioFileTopLayout.addWidget(this.audioFileLanguageComboBox);
    this.audioFileRootLayout.addWidget(this.audioFileTopWidget);
    this.audioFileRootLayout.addWidget(this.audioFileComboBox);

    // Whisper Options
    this.whisperOptionsToolButton = new QToolButton();
    this.whisperOptionsToolButton.setObjectName('whisperOptionsToolButton')
    this.whisperOptionsToolButton.setText('Advanced Whisper Options');
    this.whisperOptionsToolButton.setCheckable(true);
    this.whisperOptionsToolButton.setChecked(false);

    this.whisperOptionsWidget = new QWidget();
    this.whisperOptionsLayout = new FlexLayout();
    this.whisperOptionsWidget.setObjectName('whisperOptionsWidget');
    this.whisperOptionsWidget.setLayout(this.whisperOptionsLayout);

    // Whisper Data Model
    this.whisperModelLabel = new QLabel();
    this.whisperModelLabel.setObjectName('whisperModelLabel');
    this.whisperModelLabel.setText('Data model:');
    this.whisperModelComboBox = new QComboBox();
    this.whisperModelComboBox.addItem(config.getDataModelIcon('tiny'), 'tiny');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('tiny.en'), 'tiny.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('base'), 'base');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('base.en'), 'bade.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('small'), 'small');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('small.en'), 'small.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('medium'), 'medium');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('medium.en'), 'medium.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('large-v1'), 'larve-v1');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('large'), 'large');
    this.whisperModelComboBox.setCurrentText('medium.en');
    this.whisperModelComboBox.setToolTip('Data model will be automatically selected upon language change as follows:\n' 
        + '"meduim-en" for English and "large" for everything else.');
    this.whisperModelComboBox.setToolTipDuration(30000);
    this.whisperModelComboBox.setMaximumWidth(140);
    this.whisperDataModelWidget = new QWidget();
    this.whisperDataModelLayout = new FlexLayout();
    this.whisperDataModelWidget.setObjectName('whisperDataModelWidget');
    this.whisperDataModelWidget.setLayout(this.whisperDataModelLayout);
    this.whisperDataModelLayout.addWidget(this.whisperModelLabel);
    this.whisperDataModelLayout.addWidget(this.whisperModelComboBox);

    // Whisper Output Format
    this.whisperOutputFormatLabel = new QLabel();
    this.whisperOutputFormatLabel.setObjectName('whisperOutputFormatLabel');
    this.whisperOutputFormatLabel.setText('Output format:');
    this.whisperOutputFormatComboBox = new QComboBox();
    this.whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt', 'wts', 'csv']);
    this.whisperOutputFormatComboBox.setCurrentText('srt');
    this.whisperOutputFormatWidget = new QWidget();
    this.whisperOutputFormatLayout = new FlexLayout();
    this.whisperOutputFormatWidget.setObjectName('whisperOutputFormatWidget');
    this.whisperOutputFormatWidget.setLayout(this.whisperOutputFormatLayout);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatLabel);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatComboBox);

    // Whisper Additional Parameters
    this.textSegmentsLeengthLabel = new QLabel();
    this.textSegmentsLeengthLabel.setObjectName('textSegmentsLeengthLabel');
    this.textSegmentsLeengthLabel.setText('Text segments length:');
    this.textSegmentsLeengthQLineEdit = new QLineEdit();
    this.textSegmentsLeengthQLineEdit.setObjectName('textSegmentsLeengthQLineEdit');
    this.textSegmentsLeengthQLineEdit.setText('150');
    this.textSegmentsLeengthQLineEdit.setMaximumWidth(37);

    this.whisperSegmentsLengthWidget = new QWidget();
    this.whisperSegmentsLengthLayout = new FlexLayout();
    this.whisperSegmentsLengthWidget.setObjectName('whisperSegmentsLengthWidget');
    this.whisperSegmentsLengthWidget.setLayout(this.whisperSegmentsLengthLayout);
    this.whisperSegmentsLengthLayout.addWidget(this.textSegmentsLeengthLabel);
    this.whisperSegmentsLengthLayout.addWidget(this.textSegmentsLeengthQLineEdit);

    this.whisperOptionsLayout.addWidget(this.whisperDataModelWidget);
    this.whisperOptionsLayout.addWidget(this.whisperOutputFormatWidget);
    this.whisperOptionsLayout.addWidget(this.whisperSegmentsLengthWidget);
    this.whisperOptionsWidget.hide(); 

    // Action Buttons
    this.transcribeStartButton = new QPushButton();
    this.transcribeStartButton.setText('Start\nTranscribe')

    this.transcribeCancelButton = new QPushButton();
    this.transcribeCancelButton.setText('Cancel\nTranscribe')

    this.transferToTranslateButton = new QPushButton();
    this.transferToTranslateButton.setText('Tranlate\nTranscribed File')

    // Space between the buttons - to be improved
    this.transcribeButtonsSpacer1Label = new QLabel();
    this.transcribeButtonsSpacer1Label.setObjectName('transcribeButtonsSpacer1Label');
    this.transcribeButtonsSpacer2Label = new QLabel();
    this.transcribeButtonsSpacer2Label.setObjectName('transcribeButtonsSpacer2Label');

    // Buttons Widget
    this.actionButtonsWidget = new QWidget();
    this.actionButtonsLayout = new FlexLayout();
    this.actionButtonsWidget.setObjectName('actionButtonsWidget');
    this.actionButtonsWidget.setLayout(this.actionButtonsLayout);
    this.actionButtonsLayout.addWidget(this.transcribeStartButton);
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer1Label);
    this.actionButtonsLayout.addWidget(this.transcribeCancelButton);
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer2Label);
    this.actionButtonsLayout.addWidget(this.transferToTranslateButton);


    // Fill the tab root layout
    this.transcribeTabLayout.addWidget(this.transcribeTitleWidget);
    this.transcribeTabLayout.addWidget(this.audioFileRootWidget);
    this.transcribeTabLayout.addWidget(this.whisperOptionsToolButton);
    this.transcribeTabLayout.addWidget(this.whisperOptionsWidget);
    this.transcribeTabLayout.addWidget(this.actionButtonsWidget); 
    
    // Apply the Stylesheet
    this.transcribeRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

    // Add the event listeners
    this.audioFileButtonEventListener();
    this.whisperOptionsButtonEventListener();
    this.whisperModelComboBoxEventListener();
    this.whisperModelComboBoxEventListener();
    this.transcribeButtonEventListener();
    this.transcribeCancelButtonEventListener();
    this.transferToTranslateButtonEventListener();
  }

  private audioFileButtonEventListener(): void {
    this.selectAudioFileButton.addEventListener('clicked', () => {
      const fileDialog: QFileDialog = new QFileDialog();
      fileDialog.setFileMode(FileMode.ExistingFile);
      // ToDo: Filter non-relevant files
      // fileDialog.setNameFilter('Videos/Audios (*.mp4 *.wav)'); 
      fileDialog.exec();
      this.audioFileComboBox.addItem(new QIcon('assets/audio-file-icon.png'),
        fileDialog.selectedFiles()[0]);
    });
  }

  private whisperOptionsButtonEventListener(): void {
    this.whisperOptionsToolButton.addEventListener('clicked', () => {
      if (this.whisperOptionsWidget.isHidden())
        this.whisperOptionsWidget.show();
      else
        this.whisperOptionsWidget.hide();
    });    
  }

  private whisperModelComboBoxEventListener(): void {
    this.whisperModelComboBox.addEventListener('currentTextChanged', (text) => {
      console.log('Model selected: ' + text);
    });  
  }


  private transcribeButtonEventListener(): void {
    this.transcribeStartButton.addEventListener('clicked', () => {
      const { spawn } = require('node:child_process');
      let prc: any;
      
      if (process.platform == 'win32') {
        prc = spawn('');
      }
      
      if (process.platform == 'darwin') {
        console.log('MacOS detected');
        prc = spawn(this.config.whisperCLI, 
                ['-pc', '-f', 'samples/jfk.wav'], 
                {cwd: this.config.whisperCLIFolder}
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
  }

  private transcribeCancelButtonEventListener(): void {
    this.transcribeCancelButton.addEventListener('clicked', () => {
    });
  }

  private transferToTranslateButtonEventListener():void {
    this.transferToTranslateButton.addEventListener('clicked', () => {
    });  
  }
};