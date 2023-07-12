import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QComboBox,
  QFileDialog,
  QIcon,
  QLabel,
  QLineEdit,
  QPushButton,
  QToolButton,
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import { Config } from './config';
import { spawn } from 'node:child_process';
import localeCode from 'iso-639-1';

export class Transcribe {
  // Configuration
  private config: Config;

  // Whisper Process
  private whisperPrc: any;

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
        'auto',
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
    this.audioFileLanguageComboBox.setCurrentText('auto');
    this.audioFileLanguageComboBox.setToolTip('Sorted by Word Error Rate accurancy.\n' 
        + 'More info: https://github.com/openai/whisper#available-models-and-languages');

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
    this.whisperModelComboBox.addItem(config.getDataModelIcon('base.en'), 'base.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('small'), 'small');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('small.en'), 'small.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('medium'), 'medium');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('medium.en'), 'medium.en');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('large-v1'), 'larve-v1');
    this.whisperModelComboBox.addItem(config.getDataModelIcon('large'), 'large');
    this.whisperModelComboBox.setCurrentText('medium.en');
    this.whisperModelComboBox.setToolTip('Data model will be automatically selected upon language change as follows:\n' 
        + '"medium-en" for English and "large" for everything else.');
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
    this.textSegmentsLeengthQLineEdit.setText('0');
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

    // Disable Cancel Transcribe Button when not transcribing
    this.transcribeCancelButton.setEnabled(false);
    // Transcribe Button disabled when no file is selected
    this.transcribeStartButton.setEnabled(false);
  }

  private audioFileButtonEventListener(): void {
    this.selectAudioFileButton.addEventListener('clicked', () => {
    const fileDialog: QFileDialog = new QFileDialog();
    fileDialog.setFileMode(FileMode.ExistingFile);
    fileDialog.setOption(Option.ReadOnly);
    fileDialog.setLabelText(DialogLabel.Accept, 'Select');
    // fileDialog.setOption(Option.DontUseNativeDialog);
    // fileDialog.setNameFilter('Audios/Videos (*.mp4 *.wav)');
    //ToDo: Filter non-relevant files
    if (fileDialog.exec()) {
      let isFileAlreadyAdded: boolean = false;
      let selectedFile: string = fileDialog.selectedFiles()[0];

      for (let i: number = 0; i < this.audioFileComboBox.count(); i++) {
        this.audioFileComboBox.setCurrentIndex(i);
        if (this.audioFileComboBox.currentText() == selectedFile) {
          console.log(selectedFile);
          isFileAlreadyAdded = true;
          break;
        }
      }
      if (selectedFile != null && !isFileAlreadyAdded) {
        this.audioFileComboBox.addItem(new QIcon('assets/audio-file-icon.png'), selectedFile);
        this.transcribeStartButton.setEnabled(true);
      }
    }
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
      //ToDo: Implement automatic download + Initial Download??
    });  
  }


  private transcribeButtonEventListener(): void {
    this.transcribeStartButton.addEventListener('clicked', () => {
      this.transcribeStartButton.setEnabled(false);
      this.transcribeCancelButton.setEnabled(true);

      let sourceLanguage: string = 'auto';
      if (this.audioFileLanguageComboBox.currentText() != 'auto')
        sourceLanguage = localeCode.getCode(this.audioFileLanguageComboBox.currentText());

      // Windows
      if (process.platform == 'win32') {
        this.whisperPrc = spawn(this.config.whisperCLI,
            ['--model', 'models\\ggml-' + this.whisperModelComboBox.currentText() + '.bin',
              '--language', sourceLanguage,
              '-o' + this.whisperOutputFormatComboBox.currentText(),
              '-ml', this.textSegmentsLeengthQLineEdit.text(),
              '-pc', '-pp', this.audioFileComboBox.currentText()],
            {cwd: this.config.whisperCLIFolder}
        );
      }

      // MacOS & Linux
      if (process.platform == 'darwin' || process.platform == 'linux') {
        this.whisperPrc = spawn(this.config.whisperCLI,
                ['--model', 'models/ggml-' + this.whisperModelComboBox.currentText() + '.bin',
                  '--language', sourceLanguage,
                  '-o' + this.whisperOutputFormatComboBox.currentText(),
                  '-ml', this.textSegmentsLeengthQLineEdit.text(),
                  '-pc', '-pp', this.audioFileComboBox.currentText()],
                {cwd: this.config.whisperCLIFolder}
              );
      }

      this.whisperPrc.stdout.on('data', (data: any) => {
        console.log(data.toString());
      });

      this.whisperPrc.stderr.on('data', (data: any) => {
        console.error(data.toString());
      });

      this.whisperPrc.on('exit', (code: any) => {
        console.log(`Child exited with code ${code}`);
        this.transcribeStartButton.setEnabled(true);
        this.transcribeCancelButton.setEnabled(false);
      });
    });
  }

  private transcribeCancelButtonEventListener(): void {
    //ToDo: Disable Cancel Button when not transcribing
    this.transcribeCancelButton.addEventListener('clicked', () => {
      console.log('Killing Whisper process requested...');
      this.whisperPrc.kill();
    });
  }

  private transferToTranslateButtonEventListener():void {
    this.transferToTranslateButton.addEventListener('clicked', () => {
    });  
  }
}