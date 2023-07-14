import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QCheckBox,
  QComboBox,
  QFileDialog,
  QIcon,
  QLabel,
  QLineEdit,
  QPushButton,
  QTabWidget,
  QToolButton,
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import * as os from "os";
import * as path from "node:path";
import localeCode from 'iso-639-1';
import { spawn } from 'node:child_process';
import { Config } from './config';
import { Translate } from "./translate";

export class Transcribe {
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
  private whisperSegmentsLengthLabel: QLabel;
  private whisperSegmentsLengthLineEdit: QLineEdit;
  private whisperSegmentsLengthWidget: QWidget;
  private whisperSegmentsLengthLayout: FlexLayout;

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
  private whisperDurationLabel: QLabel;
  private whisperDurationLineEdit: QLineEdit;
  private whisperDurationWidget: QWidget;
  private whisperDurationLayout: FlexLayout;

  // Whisper stereo audio diarization
  private whisperDiarizeLabel: QLabel;
  private whisperDiarizeCheckBox: QCheckBox;
  private whisperDiarizeWidget: QWidget;
  private whisperDiarizeLayout: FlexLayout;

  // Whisper custom parameters
  private whisperCustomParamsLabel: QLabel;
  private whisperCustomParamsLineEdit: QLineEdit;
  private whisperCustomParamsWidget: QWidget;
  private whisperCustomParamsLayout: FlexLayout;

  // Action Buttons
  private transcribeStartButton: QPushButton;
  private transcribeCancelButton: QPushButton;
  private transferToTranslateButton: QPushButton;
  private transcribeButtonsSpacer1Label: QLabel;
  private transcribeButtonsSpacer2Label: QLabel;

  // Buttons Widget
  private actionButtonsWidget: QWidget;
  private actionButtonsLayout: FlexLayout;

  constructor(config: Config, tabWidget: QTabWidget, translate: Translate) {
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
    this.whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt', 'wts', 'json', 'csv']);
    this.whisperOutputFormatComboBox.setCurrentText('srt');
    this.whisperOutputFormatWidget = new QWidget();
    this.whisperOutputFormatLayout = new FlexLayout();
    this.whisperOutputFormatWidget.setObjectName('whisperOutputFormatWidget');
    this.whisperOutputFormatWidget.setLayout(this.whisperOutputFormatLayout);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatLabel);
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatComboBox);

    // Whisper Segments Length
    this.whisperSegmentsLengthLabel = new QLabel();
    this.whisperSegmentsLengthLabel.setObjectName('textSegmentsLengthLabel');
    this.whisperSegmentsLengthLabel.setText('Text segments length:');
    this.whisperSegmentsLengthLineEdit = new QLineEdit();
    this.whisperSegmentsLengthLineEdit.setObjectName('textSegmentsLengthQLineEdit');
    this.whisperSegmentsLengthLineEdit.setText('0');
    this.whisperSegmentsLengthLineEdit.setFixedWidth(37);

    this.whisperSegmentsLengthWidget = new QWidget();
    this.whisperSegmentsLengthLayout = new FlexLayout();
    this.whisperSegmentsLengthWidget.setObjectName('whisperSegmentsLengthWidget');
    this.whisperSegmentsLengthWidget.setLayout(this.whisperSegmentsLengthLayout);
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLabel);
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLineEdit);

    // Whisper Options L1 Widget
    this.whisperOptionsL1Layout.addWidget(this.whisperDataModelWidget);
    this.whisperOptionsL1Layout.addWidget(this.whisperOutputFormatWidget);
    this.whisperOptionsL1Layout.addWidget(this.whisperSegmentsLengthWidget);

    // Whisper CPUs to use
    const cpuCount: number = os.cpus().length;
    this.whisperCPUsLabel = new QLabel();
    this.whisperCPUsLabel.setObjectName('whisperCPUsLabel');
    this.whisperCPUsLabel.setText('CPUs:')
    this.whisperCPUsComboBox = new QComboBox();
    for(let i: number = 1; i <= cpuCount; i++)
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
    for(let i: number = 1; i <= cpuCount*4; i++)
      if (i % 4 == 0)
        this.whisperThreadsComboBox.addItem(undefined, i.toString());
    this.whisperThreadsComboBox.setCurrentText('4');
    this.whisperThreadsWidget = new QWidget();
    this.whisperThreadsLayout = new FlexLayout();
    this.whisperThreadsWidget.setObjectName('whisperThreadsWidget')
    this.whisperThreadsWidget.setLayout(this.whisperThreadsLayout);
    this.whisperThreadsLayout.addWidget(this.whisperThreadsLabel);
    this.whisperThreadsLayout.addWidget(this.whisperThreadsComboBox);

    // Whisper Duration to process
    this.whisperDurationLabel = new QLabel();
    this.whisperDurationLabel.setObjectName('whisperDurationLabel');
    this.whisperDurationLabel.setText('Duration to process:')
    this.whisperDurationLineEdit = new QLineEdit();
    this.whisperDurationLineEdit.setObjectName('whisperDurationLineEdit');
    this.whisperDurationLineEdit.setText('0');
    this.whisperDurationLineEdit.setFixedWidth(72);
    this.whisperDurationLineEdit.setToolTip('Value in milliseconds');
    this.whisperDurationLineEdit.setToolTipDuration(15000);
    this.whisperDurationWidget = new QWidget();
    this.whisperDurationLayout = new FlexLayout();
    this.whisperDurationWidget.setObjectName('whisperDurationWidget');
    this.whisperDurationWidget.setLayout(this.whisperDurationLayout);
    this.whisperDurationLayout.addWidget(this.whisperDurationLabel);
    this.whisperDurationLayout.addWidget(this.whisperDurationLineEdit);

    // Whisper stereo audio diarization
    this.whisperDiarizeLabel = new QLabel();
    this.whisperDiarizeCheckBox = new QCheckBox();
    this.whisperDiarizeCheckBox.setObjectName('whisperDiarizeCheckBox');
    this.whisperDiarizeCheckBox.setText('Stereo audio\n diarization');
    this.whisperDiarizeWidget = new QWidget();
    this.whisperDiarizeLayout = new FlexLayout();

    // Whisper Options L2 Widget
    this.whisperOptionsL2Layout.addWidget(this.whisperCPUsWidget);
    this.whisperOptionsL2Layout.addWidget(this.whisperThreadsWidget);
    this.whisperOptionsL2Layout.addWidget(this.whisperDiarizeCheckBox);
    this.whisperOptionsL2Layout.addWidget(this.whisperDurationWidget);

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
    this.whisperOutputFormatComboBoxEventListener();
    this.audioFileComboBoxEvenListener();
    this.audioFileLanguageComboBoxEventListener();

    // Disable Cancel Transcribe Button when not transcribing
    this.transcribeCancelButton.setEnabled(false);
    // Transcribe Button disabled when no file is selected
    this.transcribeStartButton.setEnabled(false);
    // Check for transferToTranslateButton Enable/Disable
    this.checkTransferToTranslateButton();
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
    this.whisperOptionsToolButton.addEventListener('clicked', () => {
      if (this.whisperOptionsWidget.isHidden())
        this.whisperOptionsWidget.show();
      else
        this.whisperOptionsWidget.hide();
    });    
  }

  private audioFileComboBoxEvenListener(): void {
    this.audioFileComboBox.addEventListener('currentTextChanged', () => {
      if (fs.existsSync(this.audioFileComboBox.currentText()))
        this.transcribeStartButton.setEnabled(true);
      else
        this.transcribeStartButton.setEnabled(false);

      this.checkTransferToTranslateButton();
    });
  }

  private whisperOutputFormatComboBoxEventListener(): void {
    this.whisperOutputFormatComboBox.addEventListener('currentTextChanged', () => {
      this.checkTransferToTranslateButton();
    });
  }

  private whisperModelComboBoxEventListener(): void {
    this.whisperModelComboBox.addEventListener('currentTextChanged', (text: string) => {
      console.log('Model selected: ' + text);
      //ToDo: Implement automatic download + Initial Download??
      // Use https://github.com/TylerLeonhardt/wgetjs
    });  
  }

  private audioFileLanguageComboBoxEventListener(): void {
    this.audioFileLanguageComboBox.addEventListener('currentTextChanged', (text: string) => {
      if (text == 'English') {
        this.whisperModelComboBox.setCurrentText('medium.en');
      }
      else
        this.whisperModelComboBox.setCurrentText('large');
    });
  }

  private transcribeButtonEventListener(): void {
    this.transcribeStartButton.addEventListener('clicked', () => {
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

      this.whisperPrc = spawn(this.config.whisperCLIPath, whisperArgs,
          {cwd: path.dirname(this.config.whisperCLIPath)}
      );

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
        this.checkTransferToTranslateButton();
      });
    });
  }

  private transcribeCancelButtonEventListener(): void {
    this.transcribeCancelButton.addEventListener('clicked', () => {
      console.log('Killing Whisper process requested...');
      this.whisperPrc.kill();
    });
  }

  private transferToTranslateButtonEventListener(): void {
    this.transferToTranslateButton.addEventListener('clicked', () => {

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
    const subtitleFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name +
        '.' + this.whisperOutputFormatComboBox.currentText());

    return fs.existsSync(subtitleFile);
  }

  /**
   * Enable / Disable TransferToTranslate Button
   * @private
   */
  private checkTransferToTranslateButton(): void {
    const allowedExt: string[] = ['srt', 'txt']
    const format: string = this.whisperOutputFormatComboBox.currentText();
    if (this.isTranscribedFileExist(format) && allowedExt.indexOf(format) != -1)
      this.transferToTranslateButton.setEnabled(true);
    else
      this.transferToTranslateButton.setEnabled(false);
  }
}