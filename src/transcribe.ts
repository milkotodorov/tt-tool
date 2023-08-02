import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QCheckBox,
  QComboBox,
  QFileDialog,
  QIcon,
  QLabel, QLayout,
  QLineEdit,
  QProgressBar,
  QPushButton,
  QStatusBar,
  QTabWidget,
  QToolButton,
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'node:path';
import localeCode from 'iso-639-1';
import wget from 'wget-improved';
import cliProgress from 'cli-progress';
import EventEmitter from "events";
import { spawn } from 'node:child_process';
import { Config } from './config';
import { Translate } from './translate';

export class Transcribe {
  // StatusBar
  private statusBar: QStatusBar;

  // Downloading Flag
  private isDownloading: boolean = false;

  // Root Tab Widget
  private readonly tabWidget: QTabWidget;

  // Translate Class
  private readonly translate: Translate;

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
  private whisperOptionsL1Widget: QWidget;
  private whisperOptionsL1Layout: FlexLayout;
  private whisperOptionsL2Widget: QWidget;
  private whisperOptionsL2Layout: FlexLayout;

  // Whisper Additional Parameters

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

  // Whisper Segments Length
  private whisperSegmentsLengthWidget: QWidget;
  private whisperSegmentsLengthLayout: FlexLayout;
  private whisperSegmentsLengthLabel: QLabel;
  private whisperSegmentsLengthLineEdit: QLineEdit;

  // Whisper CPUs to use
  private whisperCPUsLabel: QLabel;
  private whisperCPUsComboBox: QComboBox;
  private whisperCPUsWidget: QWidget;
  private whisperCPUsLayout: FlexLayout;

  // Whisper Threads to use
  private whisperThreadsLabel: QLabel;
  private whisperThreadsComboBox: QComboBox;
  private whisperThreadsWidget: QWidget;
  private whisperThreadsLayout: FlexLayout;

  // Whisper Duration to process
  private whisperDuretionWidget: QWidget;
  private whisperDuretionLayout: QLayout;
  private whisperDurationLabel: QLabel;
  private whisperDurationLineEdit: QLineEdit;

  // Whisper stereo audio diarization
  private whisperDiarizeWidget: QWidget;
  private whisperDiarizeLayout: FlexLayout;
  private whisperDiarizeCheckBox: QCheckBox;

  // Whisper custom parameters
  private whisperCustomParamsLabel: QLabel;
  private whisperCustomParamsLineEdit: QLineEdit;
  private whisperCustomParamsWidget: QWidget;
  private whisperCustomParamsLayout: FlexLayout;

  // Action Buttons
  private transcribeStartButton: QPushButton;
  private transcribeCancelButton: QPushButton;
  private transferToTranslateButton: QPushButton;
  private toggleConsoleButton: QPushButton;
  private transcribeButtonsSpacer1Label: QLabel;
  private transcribeButtonsSpacer2Label: QLabel;
  private transcribeButtonsSpacer3Label: QLabel;

  // Buttons Widget
  private actionButtonsWidget: QWidget;
  private actionButtonsLayout: FlexLayout;

  constructor(statusBar: QStatusBar, config: Config, tabWidget: QTabWidget, translate: Translate) {
    this.statusBar = statusBar;
    this.config = config;
    this.tabWidget = tabWidget;
    this.translate = translate;

    const whisperParameters: string = '\n' +
        'options:\n' +
        '  -h,        --help              [default] show this help message and exit\n' +
        '  -t N,      --threads N         [4      ] number of threads to use during computation\n' +
        '  -p N,      --processors N      [1      ] number of processors to use during computation\n' +
        '  -ot N,     --offset-t N        [0      ] time offset in milliseconds\n' +
        '  -on N,     --offset-n N        [0      ] segment index offset\n' +
        '  -d  N,     --duration N        [0      ] duration of audio to process in milliseconds\n' +
        '  -mc N,     --max-context N     [-1     ] maximum number of text context tokens to store\n' +
        '  -ml N,     --max-len N         [0      ] maximum segment length in characters\n' +
        '  -bo N,     --best-of N         [5      ] number of best candidates to keep\n' +
        '  -bs N,     --beam-size N       [-1     ] beam size for beam search\n' +
        '  -wt N,     --word-thold N      [0.01   ] word timestamp probability threshold\n' +
        '  -et N,     --entropy-thold N   [2.40   ] entropy threshold for decoder fail\n' +
        '  -lpt N,    --logprob-thold N   [-1.00  ] log probability threshold for decoder fail\n' +
        '  -su,       --speed-up          [false  ] speed up audio by x2 (reduced accuracy)\n' +
        '  -tr,       --translate         [false  ] translate from source language to english\n' +
        '  -tdrz,     --tinydiarize       [false  ] enable tinydiarize (requires a tdrz model)\n' +
        '  -di,       --diarize           [false  ] stereo audio diarization\n' +
        '  -nf,       --no-fallback       [false  ] do not use temperature fallback while decoding\n' +
        '  -otxt,     --output-txt        [false  ] output result in a text file\n' +
        '  -ovtt,     --output-vtt        [false  ] output result in a vtt file\n' +
        '  -osrt,     --output-srt        [false  ] output result in a srt file\n' +
        '  -owts,     --output-words      [false  ] output script for generating karaoke video\n' +
        '  -ocsv,     --output-csv        [false  ] output result in a CSV file\n' +
        '  -of FNAME, --output-file FNAME [       ] output file path (without file extension)\n' +
        '  -ps,       --print-special     [false  ] print special tokens\n' +
        '  -pc,       --print-colors      [false  ] print colors\n' +
        '  -pp,       --print-progress    [false  ] print progress\n' +
        '  -nt,       --no-timestamps     [true   ] do not print timestamps\n' +
        '  -l LANG,   --language LANG     [en     ] spoken language (\'auto\' for auto-detect)\n' +
        '             --prompt PROMPT     [       ] initial prompt\n' +
        '  -m FNAME,  --model FNAME       [models/ggml-base.en.bin] model path\n' +
        '  -f FNAME,  --file FNAME        [       ] input WAV file path';

    this.whisperLanguages = [
        'auto',
        'Afrikaans',
        'Arabic',
        'Armenian',
        'Azerbaijani',
        'Belarusian',
        'Bosnian',
        'Bulgarian',
        'Catalan',
        'Chinese',
        'Croatian',
        'Czech',
        'Danish',
        'Dutch',
        'English',
        'Estonian',
        'Finnish',
        'French',
        'Galician',
        'German',
        'Greek',
        'Hebrew',
        'Hindi',
        'Hungarian',
        'Icelandic',
        'Indonesian',
        'Italian',
        'Japanese',
        'Kannada',
        'Kazakh',
        'Korean',
        'Latvian',
        'Lithuanian',
        'Macedonian',
        'Malay',
        'Maori',
        'Marathi',
        'Nepali',
        'Norwegian',
        'Persian',
        'Polish',
        'Portuguese',
        'Romanian',
        'Russian',
        'Serbian',
        'Slovak',
        'Slovenian',
        'Spanish',
        'Swahili',
        'Swedish',
        'Tagalog',
        'Tamil',
        'Thai',
        'Turkish',
        'Ukrainian',
        'Urdu',
        'Vietnamese',
        'Welsh'
    ];

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

    // Whisper Additional Parameters
    this.whisperOptionsWidget = new QWidget();
    this.whisperOptionsLayout = new FlexLayout();
    this.whisperOptionsWidget.setObjectName('whisperOptionsWidget');
    this.whisperOptionsWidget.setLayout(this.whisperOptionsLayout);
    this.whisperOptionsL1Widget = new QWidget();
    this.whisperOptionsL1Layout = new FlexLayout();
    this.whisperOptionsL1Widget.setObjectName('whisperOptionsL1Widget');
    this.whisperOptionsL1Widget.setLayout(this.whisperOptionsL1Layout);
    this.whisperOptionsL2Widget = new QWidget();
    this.whisperOptionsL2Layout = new FlexLayout();
    this.whisperOptionsL2Widget.setObjectName('whisperOptionsL2Widget');
    this.whisperOptionsL2Widget.setLayout(this.whisperOptionsL2Layout);

    // Whisper Data Model
    this.whisperModelLabel = new QLabel();
    this.whisperModelLabel.setObjectName('whisperModelLabel');
    this.whisperModelLabel.setText('Data model:');
    this.whisperModelComboBox = new QComboBox();
    this.addDataModels();
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
    this.whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt', 'wts', 'json', 'csv']);
    this.whisperOutputFormatComboBox.setCurrentText('srt');
    this.whisperOutputFormatWidget = new QWidget();
    this.whisperOutputFormatLayout = new FlexLayout();
    this.whisperOutputFormatWidget.setObjectName('whisperOutputFormatWidget');
    this.whisperOutputFormatWidget.setLayout(this.whisperOutputFormatLayout);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatLabel);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatComboBox);

    // Whisper CPUs to use
    const cpuCount: number = os.cpus().length;
    this.whisperCPUsLabel = new QLabel();
    this.whisperCPUsLabel.setObjectName('whisperCPUsLabel');
    this.whisperCPUsLabel.setText('CPUs:')
    this.whisperCPUsComboBox = new QComboBox();
    for (let i: number = 1; i <= cpuCount; i++)
      this.whisperCPUsComboBox.addItem(undefined, i.toString());
    this.whisperCPUsComboBox.setCurrentText('1');
    this.whisperCPUsWidget = new QWidget();
    this.whisperCPUsLayout = new FlexLayout();
    this.whisperCPUsWidget.setObjectName('whisperCPUsWidget')
    this.whisperCPUsWidget.setLayout(this.whisperCPUsLayout);
    this.whisperCPUsLayout.addWidget(this.whisperCPUsLabel);
    this.whisperCPUsLayout.addWidget(this.whisperCPUsComboBox);

    // Whisper Threads to use
    this.whisperThreadsLabel = new QLabel();
    this.whisperThreadsLabel.setObjectName('whisperThreadsLabel');
    this.whisperThreadsLabel.setText('Threads:')
    this.whisperThreadsComboBox = new QComboBox();
    for (let i: number = 1; i <= cpuCount*4; i++)
      if (i % 4 == 0)
        this.whisperThreadsComboBox.addItem(undefined, i.toString());
    this.whisperThreadsComboBox.setCurrentText('4');
    this.whisperThreadsWidget = new QWidget();
    this.whisperThreadsLayout = new FlexLayout();
    this.whisperThreadsWidget.setObjectName('whisperThreadsWidget')
    this.whisperThreadsWidget.setLayout(this.whisperThreadsLayout);
    this.whisperThreadsLayout.addWidget(this.whisperThreadsLabel);
    this.whisperThreadsLayout.addWidget(this.whisperThreadsComboBox);

    // Whisper Segments Length
    this.whisperSegmentsLengthLabel = new QLabel();
    this.whisperSegmentsLengthLabel.setObjectName('whisperSegmentsLengthLabel');
    this.whisperSegmentsLengthLabel.setText('Text segments length:');
    this.whisperSegmentsLengthLineEdit = new QLineEdit();
    this.whisperSegmentsLengthLineEdit.setObjectName('whisperSegmentsLengthLineEdit');
    this.whisperSegmentsLengthLineEdit.setText('0');
    this.whisperSegmentsLengthWidget = new QWidget();
    this.whisperSegmentsLengthLayout = new FlexLayout();
    this.whisperSegmentsLengthWidget.setObjectName('whisperSegmentsLengthWidget');
    this.whisperSegmentsLengthWidget.setLayout(this.whisperSegmentsLengthLayout);
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLabel);
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLineEdit);

    // Whisper Duration to process
    this.whisperDurationLabel = new QLabel();
    this.whisperDurationLabel.setObjectName('whisperDurationLabel');
    this.whisperDurationLabel.setText('Duration to process:')
    this.whisperDurationLineEdit = new QLineEdit();
    this.whisperDurationLineEdit.setObjectName('whisperDurationLineEdit');
    this.whisperDurationLineEdit.setText('0');
    this.whisperDurationLineEdit.setToolTip('Value in milliseconds');
    this.whisperDurationLineEdit.setToolTipDuration(15000);
    this.whisperDuretionWidget = new QWidget();
    this.whisperDuretionLayout = new FlexLayout();
    this.whisperDuretionWidget.setObjectName('whisperDurationWidget');
    this.whisperDuretionWidget.setLayout(this.whisperDuretionLayout);
    this.whisperDuretionLayout.addWidget(this.whisperDurationLabel);
    this.whisperDuretionLayout.addWidget(this.whisperDurationLineEdit);

    // Whisper stereo audio diarization
    this.whisperDiarizeCheckBox = new QCheckBox();
    this.whisperDiarizeCheckBox.setObjectName('whisperDiarizeCheckBox');
    this.whisperDiarizeCheckBox.setText('Stereo diarization');
    this.whisperDiarizeWidget = new QWidget();
    this.whisperDiarizeLayout = new FlexLayout();
    this.whisperDiarizeWidget.setObjectName('whisperDiarizeWidget');
    this.whisperDiarizeWidget.setLayout(this.whisperDiarizeLayout);
    this.whisperDiarizeLayout.addWidget(this.whisperDiarizeCheckBox);

    // Whisper custom parameters
    this.whisperCustomParamsLabel = new QLabel();
    this.whisperCustomParamsLabel.setObjectName('whisperCustomParamsLabel');
    this.whisperCustomParamsLabel.setText('Custom parameters:');
    this.whisperCustomParamsLineEdit = new QLineEdit();
    this.whisperCustomParamsLineEdit.setObjectName('whisperCustomParamsLineEdit');
    this.whisperCustomParamsLineEdit.setToolTip('Space separated additional parameters.\n' +
        'All parameters: https://github.com/ggerganov/whisper.cpp#quick-start\n' + whisperParameters);
    this.whisperCustomParamsLineEdit.setToolTipDuration(120000);
    this.whisperCustomParamsWidget = new QWidget();
    this.whisperCustomParamsLayout = new FlexLayout();
    this.whisperCustomParamsWidget.setObjectName('whisperCustomParamsWidget');
    this.whisperCustomParamsWidget.setLayout(this.whisperCustomParamsLayout);
    this.whisperCustomParamsLayout.addWidget(this.whisperCustomParamsLabel);
    this.whisperCustomParamsLayout.addWidget(this.whisperCustomParamsLineEdit);

    // Whisper Options L1 Widget
    this.whisperOptionsL1Layout.addWidget(this.whisperDataModelWidget);
    this.whisperOptionsL1Layout.addWidget(this.whisperOutputFormatWidget);
    this.whisperOptionsL1Layout.addWidget(this.whisperCPUsWidget);
    this.whisperOptionsL1Layout.addWidget(this.whisperThreadsWidget);

    // Whisper Options L2 Widget
    this.whisperOptionsL2Layout.addWidget(this.whisperDuretionWidget);
    this.whisperOptionsL2Layout.addWidget(this.whisperDiarizeWidget);
    this.whisperOptionsL2Layout.addWidget(this.whisperSegmentsLengthWidget);

    // Fill the OptionsRoot Layout
    this.whisperOptionsLayout.addWidget(this.whisperOptionsL1Widget);
    this.whisperOptionsLayout.addWidget(this.whisperOptionsL2Widget);
    this.whisperOptionsLayout.addWidget(this.whisperCustomParamsWidget);
    this.whisperOptionsWidget.hide();

    // Action Buttons
    this.transcribeStartButton = new QPushButton();
    this.transcribeStartButton.setText('Start\nTranscribe')

    this.transcribeCancelButton = new QPushButton();
    this.transcribeCancelButton.setText('Cancel\nTranscribe')

    this.transferToTranslateButton = new QPushButton();
    this.transferToTranslateButton.setText('Translate\nTranscribed File')

    this.toggleConsoleButton = new QPushButton();
    this.toggleConsoleButton.setText('Toggle\nConsole');

    // Space between the buttons - to be improved
    this.transcribeButtonsSpacer1Label = new QLabel();
    this.transcribeButtonsSpacer1Label.setObjectName('transcribeButtonsSpacer1Label');
    this.transcribeButtonsSpacer2Label = new QLabel();
    this.transcribeButtonsSpacer2Label.setObjectName('transcribeButtonsSpacer2Label');
    this.transcribeButtonsSpacer3Label = new QLabel();
    this.transcribeButtonsSpacer3Label.setObjectName('transcribeButtonsSpacer3Label');

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
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer3Label);
    this.actionButtonsLayout.addWidget(this.toggleConsoleButton);

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
    this.transcribeButtonEventListener();
    this.transcribeCancelButtonEventListener();
    this.transferToTranslateButtonEventListener();
    this.whisperOutputFormatComboBoxEventListener();
    this.audioFileComboBoxEvenListener();
    this.audioFileLanguageComboBoxEventListener();
    this.toggleConsoleButtonEventListener();
    this.audioFileLanguageComboBox.setCurrentText(this.config.lastUsedWhisperLanguage);

    // Set the default DataModel and download it if necessary
    // this.whisperModelComboBox.setCurrentText('medium.en');

    // Disable Cancel Transcribe Button when not transcribing
    this.transcribeCancelButton.setEnabled(false);
    // Transcribe Button disabled when no file is selected
    this.transcribeStartButton.setEnabled(false);
    // Check for transferToTranslateButton Enable/Disable
    this.checkTransferToTranslateButton();
  }

  private audioFileButtonEventListener(): void {
    this.selectAudioFileButton.addEventListener('clicked', (): void => {
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
            isFileAlreadyAdded = true;
            break;
          }
        }
        if (selectedFile != null && !isFileAlreadyAdded) {
          let currentIndex: number = this.audioFileComboBox.currentIndex();
          this.audioFileComboBox.addItem(new QIcon('assets/audio-file-icon.png'), selectedFile);
          if (currentIndex != -1)
            this.audioFileComboBox.setCurrentIndex(currentIndex + 1);
          this.transcribeStartButton.setEnabled(true);
        }
      }

      this.checkTransferToTranslateButton();
    });
  }

  private whisperOptionsButtonEventListener(): void {
    this.whisperOptionsToolButton.addEventListener('clicked', (): void => {
      if (this.whisperOptionsWidget.isHidden())
        this.whisperOptionsWidget.show();
      else
        this.whisperOptionsWidget.hide();
    });    
  }

  private audioFileComboBoxEvenListener(): void {
    this.audioFileComboBox.addEventListener('currentTextChanged', (): void => {
      if (fs.existsSync(this.audioFileComboBox.currentText()))
        this.transcribeStartButton.setEnabled(true);
      else
        this.transcribeStartButton.setEnabled(false);

      this.checkTransferToTranslateButton();
    });
  }

  private whisperOutputFormatComboBoxEventListener(): void {
    this.whisperOutputFormatComboBox.addEventListener('currentTextChanged', (): void => {
      this.checkTransferToTranslateButton();
    });
  }

  private whisperModelComboBoxEventListener(): void {
    this.whisperModelComboBox.addEventListener('currentTextChanged', (text: string): void => {
      // Happens on clear, removeItem and on adding the first item
      if (text == '' || this.isDownloading)
        return;

      if (this.config.whisperCLIPath == '' || this.config.whisperCLIPath == null) {
        const msg: string = 'Whisper CLI Path is not configured in the "Config" Tab. Configure it first';
        console.log(msg);
        this.statusBar.clearMessage();
        this.statusBar.showMessage(msg, 10000);
        this.whisperModelComboBox.setCurrentText('medium.en');
        return;
      }

      let modelFile: string = path.join(path.dirname(this.config.whisperCLIPath), 'models', 'ggml-' + text + '.bin');
      if (!fs.existsSync(modelFile))
        this.downloadDataModel(text);
    });
  }

  private downloadDataModel(model: string): void {
    this.isDownloading = true;

    if (model == '') {
      console.log('downloadDataModel: No model name specified for download');
      return;
    }

    this.whisperModelComboBox.setEnabled(false);
    this.audioFileLanguageComboBox.setEnabled(false);
    const wasTranscribeButtonEnabled: boolean = this.transcribeStartButton.isEnabled();
    this.transcribeStartButton.setEnabled(false);
    this.tabWidget.widget(1).setEnabled(false);
    this.tabWidget.widget(2).setEnabled(false);
    this.selectAudioFileButton.setEnabled(false);

    // ProgressBar in the StatusBar
    let progressBar: QProgressBar = new QProgressBar();
    progressBar.setObjectName('progressBar');
    let downloadLabel: QLabel = new QLabel();
    progressBar.setFixedWidth(400);

    // Console ProgressBar
    const consoleBar: cliProgress.SingleBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_grey);

    const src: string = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-' + model + '.bin';
    const modelsFolder: string = path.join(path.dirname(this.config.whisperCLIPath), 'models');
    let output: string = path.join(modelsFolder, 'ggml-' + model + '.bin');
    if (!fs.existsSync(modelsFolder))
      fs.mkdirSync(modelsFolder);

    let download: EventEmitter = wget.download(src, output, undefined);
    let modelFileSize: number;

    download.on('error', (err: Error): void => {
      console.log('Error while downloading Whisper DataModel (', src, '): ', err);
      console.log('Deleting the uncompleted download: ', output)
      fs.rmSync(output);
      // Set the default DataModel
      this.whisperModelComboBox.setCurrentText('medium.en');
      this.whisperModelComboBox.setEnabled(true);
      this.statusBar.removeWidget(downloadLabel);
      this.statusBar.removeWidget(progressBar);
      this.statusBar.clearMessage();
      this.statusBar.showMessage('Error while downloading DataModel. See the console output for more details.', 10000);
    });

    download.on('start', (fileSize: number): void => {
      modelFileSize = fileSize;
      const modelSizeStr: string = (fileSize / (1024*1024)).toFixed(2) + ' MB'
      const statusBarMsg: string = 'Download Whisper DataModel (' + modelSizeStr + '): ';
      let consoleDownloadMsg: string = 'Downloading Whisper "' + model + '" DataModel. Model Size: ' + modelSizeStr;
      console.log('Whisper DataModel URL: ', src);
      console.log('Target location: ', output);
      downloadLabel.setText(statusBarMsg);
      this.statusBar.clearMessage();
      this.statusBar.addWidget(downloadLabel);
      this.statusBar.addWidget(progressBar);
      progressBar.setRange(0, 100);
      downloadLabel.setText(statusBarMsg);
      console.log(consoleDownloadMsg);
      consoleBar.start(modelFileSize, 0);
    });

    download.on('end', (output: string): void => {
      this.statusBar.removeWidget(downloadLabel);
      this.statusBar.removeWidget(progressBar);
      consoleBar.stop();
      console.log('Download completed: ', output);
      this.statusBar.clearMessage();
      this.statusBar.showMessage('Download completed', 5000);
      this.refreshDataModels(model);
      this.whisperModelComboBox.setEnabled(true);
      this.audioFileLanguageComboBox.setEnabled(true);
      if (wasTranscribeButtonEnabled)
        this.transcribeStartButton.setEnabled(true);
      this.tabWidget.widget(1).setEnabled(true);
      this.tabWidget.widget(2).setEnabled(true);
      this.selectAudioFileButton.setEnabled(true);
      this.isDownloading = false;
    });

    download.on('progress', (progress: number): void => {
      progressBar.setValue(progress * 100);
      consoleBar.update(Math.round(modelFileSize * progress));
    });
  }

  private audioFileLanguageComboBoxEventListener(): void {
    this.audioFileLanguageComboBox.addEventListener('currentTextChanged', (text: string): void => {
      if (text == 'English') {
        this.whisperModelComboBox.setCurrentText('medium.en');
      }
      else
        this.whisperModelComboBox.setCurrentText('large');

      this.config.lastUsedWhisperLanguage = this.audioFileLanguageComboBox.currentText();
      this.config.saveConfiguration(false);
    });
  }

  private transcribeButtonEventListener(): void {
    this.transcribeStartButton.addEventListener('clicked', (): void => {
      this.transcribeStartButton.setEnabled(false);
      this.transcribeCancelButton.setEnabled(true);

      let sourceLanguage: string = 'auto';
      if (this.audioFileLanguageComboBox.currentText() != 'auto')
        sourceLanguage = localeCode.getCode(this.audioFileLanguageComboBox.currentText());

      let outputFormat: string = this.whisperOutputFormatComboBox.currentText();
      let audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText());
      let outputFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name);

      let whisperArgs: string[] = [
        '--model', 'models/ggml-' + this.whisperModelComboBox.currentText() + '.bin',
        '--language', sourceLanguage,
        '--output-' + ((outputFormat == 'wts') ? 'words' : outputFormat),
        '--max-len', this.whisperSegmentsLengthLineEdit.text(),
        '--processors', this.whisperCPUsComboBox.currentText(),
        '--threads', this.whisperThreadsComboBox.currentText(),
        '--duration', this.whisperDurationLineEdit.text(),
        '--print-colors', '--print-progress',
        '--output-file', outputFile,
        '--file', this.audioFileComboBox.currentText()
      ];

      if (this.whisperDiarizeCheckBox.isChecked())
        whisperArgs.push('--diarize');

      if (this.whisperCustomParamsLineEdit.text())
        whisperArgs.push(this.whisperCustomParamsLineEdit.text());

      this.statusBar.clearMessage();
      this.statusBar.showMessage('Transcribing...');

      let whisperCLI: string = this.config.whisperCLIPath;
      if (path.dirname(whisperCLI) && !whisperCLI.startsWith('./'))
        whisperCLI = './' + whisperCLI;
      this.whisperPrc = spawn(whisperCLI, whisperArgs,
          {cwd: path.dirname(this.config.whisperCLIPath)}
      );

      this.whisperPrc.stdout.on('data', (data: any): void => {
        console.log(data.toString());
      });

      this.whisperPrc.stderr.on('data', (data: any): void => {
        console.error(data.toString());
      });

      this.whisperPrc.stderr.on('error', (data: any): void => {
        console.error(data.toString());
      });

      this.whisperPrc.on('exit', (code: any): void => {
        console.log(`Transcribe completed.\nChild exited with code ${code}`);
        if (this.statusBar.currentMessage() != 'Killing Whisper process...') {
          this.statusBar.clearMessage();
          this.statusBar.showMessage('Transcribe completed.', 5000);
        } else {
          setTimeout((): void => {
            this.statusBar.clearMessage();
            this.statusBar.showMessage('Transcribe cancelled.', 5000);
          }, 1500);
        }
        this.transcribeStartButton.setEnabled(true);
        this.transcribeCancelButton.setEnabled(false);
        this.checkTransferToTranslateButton();
      });
    });
  }

  private transcribeCancelButtonEventListener(): void {
    this.transcribeCancelButton.addEventListener('clicked', (): void => {
      const msg: string = 'Killing Whisper process...';
      console.log(msg);
      this.statusBar.clearMessage();
      this.statusBar.showMessage(msg, 5000);
      this.whisperPrc.kill();
    });
  }

  private transferToTranslateButtonEventListener(): void {
    this.transferToTranslateButton.addEventListener('clicked', (): void => {

      let audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText());
      let subtitleFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name +
          '.' + this.whisperOutputFormatComboBox.currentText());

      let isFileAlreadyAdded: boolean = false;

      for (let i: number = 0; i < this.translate.translateFileComboBox.count(); i++) {
        this.translate.translateFileComboBox.setCurrentIndex(i);
        if (this.translate.translateFileComboBox.currentText() == subtitleFile) {
          isFileAlreadyAdded = true;
          break;
        }
      }

      if (!isFileAlreadyAdded) {
        let currentIndex: number = this.translate.translateFileComboBox.currentIndex();
        this.translate.translateFileComboBox.addItem(new QIcon('assets/subtitle-file-icon.png'), subtitleFile);
        if (currentIndex != -1)
          this.translate.translateFileComboBox.setCurrentIndex(currentIndex + 1);
      }

      this.transferToTranslateButton.setEnabled(true);

      // Go to TranslateTab
      this.tabWidget.setCurrentIndex(1);
    });
  }

  private isTranscribedFileExist(format: string): boolean {
    const audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText());
    const subtitleFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name + '.' + format);

    return fs.existsSync(subtitleFile);
  }

  /**
   * Enable / Disable TransferToTranslate Button
   * @private
   */
  private checkTransferToTranslateButton(): void {
    const allowedExt: string[] = ['srt', 'vtt']
    const format: string = this.whisperOutputFormatComboBox.currentText();
    if (this.isTranscribedFileExist(format) && allowedExt.indexOf(format) != -1)
      this.transferToTranslateButton.setEnabled(true);
    else
      this.transferToTranslateButton.setEnabled(false);
  }

  private addDataModels(): void {
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('tiny'), 'tiny');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('tiny.en'), 'tiny.en');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('base'), 'base');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('base.en'), 'base.en');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('small'), 'small');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('small.en'), 'small.en');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('medium'), 'medium');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('medium.en'), 'medium.en');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('large-v1'), 'large-v1');
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('large'), 'large');
  }

  private toggleConsoleButtonEventListener(): void {
    this.toggleConsoleButton.addEventListener('clicked', (): void => {
    });
  }

  public getCurrentModel(): string {
    return this.whisperModelComboBox.currentText();
  }

  public refreshDataModels(selectedModel?: string): void {
    this.whisperModelComboBox.clear();
    this.whisperModelComboBox.addItem(undefined, '');
    this.addDataModels();
    if (selectedModel)
      this.whisperModelComboBox.setCurrentText(selectedModel);
    else
      this.whisperModelComboBox.setCurrentText('medium.en');

    this.whisperModelComboBox.removeItem(0);
  }
}