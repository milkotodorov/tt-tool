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
  QSize,
  QStatusBar,
  QWidget
} from "@nodegui/nodegui"
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'node:path'
import localeCode from 'iso-639-1'
import wget from 'wget-improved'
import cliProgress from 'cli-progress'
import EventEmitter from "events"
import {spawn} from 'node:child_process'
import {Config} from './config'
import {Translate} from './translate'
import {ConsoleWindow} from "./ConsoleWindow"
import AdmZip from "adm-zip";

export class Transcribe {
  // ConsoleWindow
  private consoleWindow: ConsoleWindow

  // StatusBar
  private statusBar: QStatusBar

  // Downloading Flag
  private isDownloading: boolean = false

  // Root EventEmitter
  private readonly rootEM: EventEmitter;

  // Translate Class
  private readonly translate: Translate

  // Configuration
  private config: Config

  // Whisper Process
  private whisperPrc: any

  // Whisper Languages
  private readonly whisperLanguages: string[]

  // Root Widgets & Layouts
  public transcribeRootWidget: QWidget
  public transcribeTabLayout: FlexLayout

  // Title Widget
  private transcribeTopLabel: QLabel
  private transcribeTitleWidget: QWidget
  private transcribeTitleLayout: FlexLayout

  // Audio File Selection Widget
  private selectAudioFileLabel: QLabel
  private selectAudioFileButton: QPushButton
  private audioFileComboBox: QComboBox
  private audioFileLanguageLabel: QLabel
  private audioFileLanguageComboBox: QComboBox
  private audioFileRootWidget: QWidget
  private audioFileRootLayout: FlexLayout
  private audioFileTopWidget: QWidget
  private audioFileTopLayout: FlexLayout

  // Whisper Options
  private whisperOptionsToolButton: QPushButton
  private whisperOptionsWidget: QWidget
  private whisperOptionsLayout: FlexLayout
  private whisperOptionsL1Widget: QWidget
  private whisperOptionsL1Layout: FlexLayout
  private whisperOptionsL2Widget: QWidget
  private whisperOptionsL2Layout: FlexLayout

  // Whisper Additional Parameters

  // Whisper Data Model
  private whisperModelLabel: QLabel
  private whisperModelComboBox: QComboBox
  private whisperDataModelWidget: QWidget
  private whisperDataModelLayout: FlexLayout

  // Whisper Output Format
  private whisperOutputFormatLabel: QLabel
  private whisperOutputFormatComboBox: QComboBox
  private whisperOutputFormatWidget: QWidget
  private whisperOutputFormatLayout: FlexLayout

  // Whisper Segments Length
  private whisperSegmentsLengthWidget: QWidget
  private whisperSegmentsLengthLayout: FlexLayout
  private whisperSegmentsLengthLabel: QLabel
  private whisperSegmentsLengthLineEdit: QLineEdit

  // Whisper CPUs to use
  private whisperCPUsLabel: QLabel
  private whisperCPUsComboBox: QComboBox
  private whisperCPUsWidget: QWidget
  private whisperCPUsLayout: FlexLayout

  // Whisper Threads to use
  private whisperThreadsLabel: QLabel
  private whisperThreadsComboBox: QComboBox
  private whisperThreadsWidget: QWidget
  private whisperThreadsLayout: FlexLayout

  // Whisper Duration to process
  private whisperDuretionWidget: QWidget
  private whisperDuretionLayout: QLayout
  private whisperDurationLabel: QLabel
  private whisperDurationLineEdit: QLineEdit

  // Whisper stereo audio diarization
  private whisperDiarizeWidget: QWidget
  private whisperDiarizeLayout: FlexLayout
  private whisperDiarizeCheckBox: QCheckBox

  // Whisper custom parameters
  private whisperCustomParamsLabel: QLabel
  private whisperCustomParamsLineEdit: QLineEdit
  private whisperCustomParamsWidget: QWidget
  private whisperCustomParamsLayout: FlexLayout

  // Action Buttons
  private transcribeStartButton: QPushButton
  private transcribeCancelButton: QPushButton
  private transferToTranslateButton: QPushButton
  private toggleConsoleButton: QPushButton
  private transcribeButtonsSpacer1Label: QLabel
  private transcribeButtonsSpacer2Label: QLabel
  private transcribeButtonsSpacer3Label: QLabel

  // Buttons Widget
  private actionButtonsWidget: QWidget
  private actionButtonsLayout: FlexLayout

  constructor(consoleWindow: ConsoleWindow, statusBar: QStatusBar,
              config: Config, rootEM: EventEmitter, translate: Translate) {
    this.consoleWindow = consoleWindow
    this.statusBar = statusBar
    this.config = config
    this.rootEM = rootEM
    this.translate = translate

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
    ]

    // Root Widgets & Layouts
    this.transcribeRootWidget = new QWidget()
    this.transcribeRootWidget.setObjectName("transcribeRootWidget")
    this.transcribeTabLayout = new FlexLayout()
    this.transcribeRootWidget.setLayout(this.transcribeTabLayout)

    // Title Widget
    this.transcribeTopLabel = new QLabel()
    this.transcribeTopLabel.setObjectName('transcribeTopLabel')
    this.transcribeTopLabel.setText('Transcribe audio file into text using Whisper')

    this.transcribeTitleWidget = new QWidget()
    this.transcribeTitleLayout = new FlexLayout()
    this.transcribeTitleWidget.setObjectName('transcribeTitleWidget')
    this.transcribeTitleWidget.setLayout(this.transcribeTitleLayout)

    this.transcribeTitleLayout.addWidget(this.transcribeTopLabel)

    // Audio File Selection Widget
    this.selectAudioFileLabel = new QLabel()
    this.selectAudioFileLabel.setObjectName('selectAudioFileLabel')
    this.selectAudioFileLabel.setText('Audio file:')
    this.selectAudioFileButton = new QPushButton()
    this.selectAudioFileButton.setObjectName('selectAudioFileButton')
    this.selectAudioFileButton.setText("Select")
    this.audioFileComboBox = new QComboBox()
    this.audioFileComboBox.setObjectName('audioFileComboBox')
    this.audioFileComboBox.setEditable(true)
    this.audioFileComboBox.acceptDrops()
    this.audioFileLanguageLabel = new QLabel()
    this.audioFileLanguageLabel.setObjectName('audioFileLanguageLabel')
    this.audioFileLanguageLabel.setText('Audio language:')
    this.audioFileLanguageComboBox = new QComboBox()
    this.audioFileLanguageComboBox.setObjectName('audioFileLanguageComboBox')
    this.audioFileLanguageComboBox.addItems(this.whisperLanguages)
    this.audioFileLanguageComboBox.setCurrentText('auto')

    this.audioFileRootWidget = new QWidget()
    this.audioFileRootLayout = new FlexLayout()
    this.audioFileRootWidget.setObjectName('audioFileRootWidget')
    this.audioFileRootWidget.setLayout(this.audioFileRootLayout)
    
    this.audioFileTopWidget = new QWidget()
    this.audioFileTopLayout = new FlexLayout()
    this.audioFileTopWidget.setObjectName('audioFileTopWidget')
    this.audioFileTopWidget.setLayout(this.audioFileTopLayout)
    
    this.audioFileTopLayout.addWidget(this.selectAudioFileLabel)
    this.audioFileTopLayout.addWidget(this.selectAudioFileButton)
    this.audioFileTopLayout.addWidget(this.audioFileLanguageLabel)
    this.audioFileTopLayout.addWidget(this.audioFileLanguageComboBox)
    this.audioFileRootLayout.addWidget(this.audioFileTopWidget)
    this.audioFileRootLayout.addWidget(this.audioFileComboBox)

    // Whisper Options
    this.whisperOptionsToolButton = new QPushButton()
    this.whisperOptionsToolButton.setObjectName('whisperOptionsToolButton')
    this.whisperOptionsToolButton.setText('Advanced Whisper Options')
    this.whisperOptionsToolButton.setIcon(new QIcon('assets/advanced-options-icon.ico'))
    this.whisperOptionsToolButton.setIconSize(new QSize(32, 32))
    this.whisperOptionsToolButton.setCheckable(true)
    this.whisperOptionsToolButton.setChecked(false)


    // Whisper Additional Parameters
    this.whisperOptionsWidget = new QWidget()
    this.whisperOptionsLayout = new FlexLayout()
    this.whisperOptionsWidget.setObjectName('whisperOptionsWidget')
    this.whisperOptionsWidget.setLayout(this.whisperOptionsLayout)
    this.whisperOptionsL1Widget = new QWidget()
    this.whisperOptionsL1Layout = new FlexLayout()
    this.whisperOptionsL1Widget.setObjectName('whisperOptionsL1Widget')
    this.whisperOptionsL1Widget.setLayout(this.whisperOptionsL1Layout)
    this.whisperOptionsL2Widget = new QWidget()
    this.whisperOptionsL2Layout = new FlexLayout()
    this.whisperOptionsL2Widget.setObjectName('whisperOptionsL2Widget')
    this.whisperOptionsL2Widget.setLayout(this.whisperOptionsL2Layout)

    // Whisper Data Model
    this.whisperModelLabel = new QLabel()
    this.whisperModelLabel.setObjectName('whisperModelLabel')
    this.whisperModelLabel.setText('Data model:')
    this.whisperModelComboBox = new QComboBox()
    this.addDataModels()
    this.whisperModelComboBox.setToolTip('Data model will be automatically selected upon language change as follows:\n' 
        + '"medium-en" for English and "large" for everything else.')
    this.whisperModelComboBox.setToolTipDuration(30000)
    this.whisperModelComboBox.setMaximumWidth(140)
    this.whisperDataModelWidget = new QWidget()
    this.whisperDataModelLayout = new FlexLayout()
    this.whisperDataModelWidget.setObjectName('whisperDataModelWidget')
    this.whisperDataModelWidget.setLayout(this.whisperDataModelLayout)
    this.whisperDataModelLayout.addWidget(this.whisperModelLabel)
    this.whisperDataModelLayout.addWidget(this.whisperModelComboBox)

    // Whisper Output Format
    this.whisperOutputFormatLabel = new QLabel()
    this.whisperOutputFormatLabel.setObjectName('whisperOutputFormatLabel')
    this.whisperOutputFormatLabel.setText('Output format:')
    this.whisperOutputFormatComboBox = new QComboBox()
    this.whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt'])
    if (this.config.whisperCLIArch != 'win-x64-gpu')
      this.whisperOutputFormatComboBox.addItems(['lrc', 'wts', 'csv', 'json'])
    this.whisperOutputFormatComboBox.setCurrentText('srt')
    this.whisperOutputFormatWidget = new QWidget()
    this.whisperOutputFormatLayout = new FlexLayout()
    this.whisperOutputFormatWidget.setObjectName('whisperOutputFormatWidget')
    this.whisperOutputFormatWidget.setLayout(this.whisperOutputFormatLayout)
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatLabel)
    this.whisperOutputFormatLayout.addWidget(this.whisperOutputFormatComboBox)

    // Whisper CPUs to use
    const cpuCount: number = os.cpus().length
    this.whisperCPUsLabel = new QLabel()
    this.whisperCPUsLabel.setObjectName('whisperCPUsLabel')
    this.whisperCPUsLabel.setText('CPUs:')
    this.whisperCPUsComboBox = new QComboBox()
    for (let i: number = 1; i <= cpuCount; i++)
      this.whisperCPUsComboBox.addItem(undefined, i.toString())
    this.whisperCPUsComboBox.setCurrentText('1')
    this.whisperCPUsWidget = new QWidget()
    this.whisperCPUsLayout = new FlexLayout()
    this.whisperCPUsWidget.setObjectName('whisperCPUsWidget')
    this.whisperCPUsWidget.setLayout(this.whisperCPUsLayout)
    this.whisperCPUsLayout.addWidget(this.whisperCPUsLabel)
    this.whisperCPUsLayout.addWidget(this.whisperCPUsComboBox)

    // Whisper Threads to use
    this.whisperThreadsLabel = new QLabel()
    this.whisperThreadsLabel.setObjectName('whisperThreadsLabel')
    this.whisperThreadsLabel.setText('Threads:')
    this.whisperThreadsComboBox = new QComboBox()
    for (let i: number = 1; i <= cpuCount*4; i++)
      if (i % 4 == 0)
        this.whisperThreadsComboBox.addItem(undefined, i.toString())
    this.whisperThreadsComboBox.setCurrentText('4')
    this.whisperThreadsWidget = new QWidget()
    this.whisperThreadsLayout = new FlexLayout()
    this.whisperThreadsWidget.setObjectName('whisperThreadsWidget')
    this.whisperThreadsWidget.setLayout(this.whisperThreadsLayout)
    this.whisperThreadsLayout.addWidget(this.whisperThreadsLabel)
    this.whisperThreadsLayout.addWidget(this.whisperThreadsComboBox)

    // Whisper Segments Length
    this.whisperSegmentsLengthLabel = new QLabel()
    this.whisperSegmentsLengthLabel.setObjectName('whisperSegmentsLengthLabel')
    this.whisperSegmentsLengthLabel.setText('Text segments length:')
    this.whisperSegmentsLengthLineEdit = new QLineEdit()
    this.whisperSegmentsLengthLineEdit.setObjectName('whisperSegmentsLengthLineEdit')
    this.whisperSegmentsLengthLineEdit.setText('0')
    this.whisperSegmentsLengthWidget = new QWidget()
    this.whisperSegmentsLengthLayout = new FlexLayout()
    this.whisperSegmentsLengthWidget.setObjectName('whisperSegmentsLengthWidget')
    this.whisperSegmentsLengthWidget.setLayout(this.whisperSegmentsLengthLayout)
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLabel)
    this.whisperSegmentsLengthLayout.addWidget(this.whisperSegmentsLengthLineEdit)

    // Whisper Duration to process
    this.whisperDurationLabel = new QLabel()
    this.whisperDurationLabel.setObjectName('whisperDurationLabel')
    this.whisperDurationLabel.setText('Duration to process:')
    this.whisperDurationLineEdit = new QLineEdit()
    this.whisperDurationLineEdit.setObjectName('whisperDurationLineEdit')
    this.whisperDurationLineEdit.setText('0')
    this.whisperDurationLineEdit.setToolTip('Value in milliseconds')
    this.whisperDurationLineEdit.setToolTipDuration(15000)
    this.whisperDuretionWidget = new QWidget()
    this.whisperDuretionLayout = new FlexLayout()
    this.whisperDuretionWidget.setObjectName('whisperDurationWidget')
    this.whisperDuretionWidget.setLayout(this.whisperDuretionLayout)
    this.whisperDuretionLayout.addWidget(this.whisperDurationLabel)
    this.whisperDuretionLayout.addWidget(this.whisperDurationLineEdit)

    // Whisper stereo audio diarization
    this.whisperDiarizeCheckBox = new QCheckBox()
    this.whisperDiarizeCheckBox.setObjectName('whisperDiarizeCheckBox')
    this.whisperDiarizeCheckBox.setText('Stereo diarization')
    this.whisperDiarizeWidget = new QWidget()
    this.whisperDiarizeLayout = new FlexLayout()
    this.whisperDiarizeWidget.setObjectName('whisperDiarizeWidget')
    this.whisperDiarizeWidget.setLayout(this.whisperDiarizeLayout)
    this.whisperDiarizeLayout.addWidget(this.whisperDiarizeCheckBox)

    // Whisper custom parameters
    this.whisperCustomParamsLabel = new QLabel()
    this.whisperCustomParamsLabel.setObjectName('whisperCustomParamsLabel')
    this.whisperCustomParamsLabel.setText('Custom parameters:')
    this.whisperCustomParamsLineEdit = new QLineEdit()
    this.whisperCustomParamsLineEdit.setObjectName('whisperCustomParamsLineEdit')
    this.whisperCustomParamsLineEdit.setToolTip('Space separated additional parameters.\n' +
        'Use -h to list all available parameters (see console output).')
    this.whisperCustomParamsLineEdit.setToolTipDuration(120000)
    this.whisperCustomParamsWidget = new QWidget()
    this.whisperCustomParamsLayout = new FlexLayout()
    this.whisperCustomParamsWidget.setObjectName('whisperCustomParamsWidget')
    this.whisperCustomParamsWidget.setLayout(this.whisperCustomParamsLayout)
    this.whisperCustomParamsLayout.addWidget(this.whisperCustomParamsLabel)
    this.whisperCustomParamsLayout.addWidget(this.whisperCustomParamsLineEdit)

    // Whisper Options L1 Widget
    this.whisperOptionsL1Layout.addWidget(this.whisperDataModelWidget)
    this.whisperOptionsL1Layout.addWidget(this.whisperOutputFormatWidget)
    this.whisperOptionsL1Layout.addWidget(this.whisperCPUsWidget)
    this.whisperOptionsL1Layout.addWidget(this.whisperThreadsWidget)

    // Whisper Options L2 Widget
    this.whisperOptionsL2Layout.addWidget(this.whisperDuretionWidget)
    this.whisperOptionsL2Layout.addWidget(this.whisperDiarizeWidget)
    this.whisperOptionsL2Layout.addWidget(this.whisperSegmentsLengthWidget)

    // Fill the OptionsRoot Layout
    this.whisperOptionsLayout.addWidget(this.whisperOptionsL1Widget)
    this.whisperOptionsLayout.addWidget(this.whisperOptionsL2Widget)
    this.whisperOptionsLayout.addWidget(this.whisperCustomParamsWidget)
    this.whisperOptionsWidget.hide()

    // Action Buttons
    this.transcribeStartButton = new QPushButton()
    this.transcribeStartButton.setObjectName('transcribeStartButton')
    this.transcribeStartButton.setText('Start\nTranscribe')
    this.transcribeStartButton.setIcon(new QIcon('assets/transcribe-icon.png'))
    this.transcribeStartButton.setIconSize(new QSize(32, 32))

    this.transcribeCancelButton = new QPushButton()
    this.transcribeCancelButton.setObjectName('transcribeCancelButton')
    this.transcribeCancelButton.setText('Cancel\nTranscribe')
    this.transcribeCancelButton.setIcon(new QIcon('assets/cancel-icon.png'))
    this.transcribeCancelButton.setIconSize(new QSize(32, 32))

    this.transferToTranslateButton = new QPushButton()
    this.transferToTranslateButton.setObjectName('transferToTranslateButton')
    this.transferToTranslateButton.setText('Translate\nTranscribed File')
    this.transferToTranslateButton.setIcon(new QIcon('assets/translate-icon.png'))
    this.transferToTranslateButton.setIconSize(new QSize(32, 32))

    this.toggleConsoleButton = new QPushButton()
    this.toggleConsoleButton.setObjectName('toggleConsoleButton')
    this.toggleConsoleButton.setText('Toggle\nConsole')
    this.toggleConsoleButton.setIcon(new QIcon('assets/terminal-icon.png'))
    this.toggleConsoleButton.setIconSize(new QSize(32, 32))

    // Space between the buttons - to be improved
    this.transcribeButtonsSpacer1Label = new QLabel()
    this.transcribeButtonsSpacer1Label.setObjectName('transcribeButtonsSpacer1Label')
    this.transcribeButtonsSpacer2Label = new QLabel()
    this.transcribeButtonsSpacer2Label.setObjectName('transcribeButtonsSpacer2Label')
    this.transcribeButtonsSpacer3Label = new QLabel()
    this.transcribeButtonsSpacer3Label.setObjectName('transcribeButtonsSpacer3Label')

    // Buttons Widget
    this.actionButtonsWidget = new QWidget()
    this.actionButtonsLayout = new FlexLayout()
    this.actionButtonsWidget.setObjectName('actionButtonsWidget')
    this.actionButtonsWidget.setLayout(this.actionButtonsLayout)
    this.actionButtonsLayout.addWidget(this.transcribeStartButton)
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer1Label)
    this.actionButtonsLayout.addWidget(this.transcribeCancelButton)
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer2Label)
    this.actionButtonsLayout.addWidget(this.transferToTranslateButton)
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer3Label)
    this.actionButtonsLayout.addWidget(this.toggleConsoleButton)

    // Fill the tab root layout
    this.transcribeTabLayout.addWidget(this.transcribeTitleWidget)
    this.transcribeTabLayout.addWidget(this.audioFileRootWidget)
    this.transcribeTabLayout.addWidget(this.whisperOptionsToolButton)
    this.transcribeTabLayout.addWidget(this.whisperOptionsWidget)
    this.transcribeTabLayout.addWidget(this.actionButtonsWidget)

    // Apply the Stylesheet
    this.transcribeRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'))

    // Add the event listeners
    this.audioFileButtonEventListener()
    this.whisperOptionsButtonEventListener()
    this.whisperModelComboBoxEventListener()
    this.transcribeButtonEventListener()
    this.transcribeCancelButtonEventListener()
    this.transferToTranslateButtonEventListener()
    this.whisperOutputFormatComboBoxEventListener()
    this.audioFileComboBoxEvenListener()
    this.audioFileLanguageComboBoxEventListener()
    this.toggleConsoleButtonEventListener()
    this.audioFileLanguageComboBox.setCurrentText(this.config.lastUsedWhisperLanguage)

    // Set the default DataModel and download it if necessary
    // this.whisperModelComboBox.setCurrentText('medium.en')

    // Disable Cancel Transcribe Button when not transcribing
    this.transcribeCancelButton.setEnabled(false)
    // Transcribe Button disabled when no file is selected
    this.transcribeStartButton.setEnabled(false)
    // Check for transferToTranslateButton Enable/Disable
    this.checkTransferToTranslateButton()
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private audioFileButtonEventListener(): void {
    this.selectAudioFileButton.addEventListener('clicked', (): void => {
      const fileDialog: QFileDialog = new QFileDialog()
      fileDialog.setFileMode(FileMode.ExistingFile)
      fileDialog.setOption(Option.ReadOnly)
      fileDialog.setLabelText(DialogLabel.Accept, 'Select')

      /*
        ---------------- Allowed File Formats ----------------
        Multimedia/video containers: .wmv, .avi, .flv, .mkv, .ogg, .ogm, .mov
        MPEG audio/video: .mpg, .mp2, .mp3, .mp4, .m4a, .aac
        RealNetworks audio/video: .ra, .rm, .rv, .rmvb
        Windows Media audio: .wma
        FLAC audio: .flac
        AIFF audio: .aif, .aiff, .aifc
        WAVE audio: .wav
      */
      const multimediaFilesExt: string = 'Multimedia Files (' +
          '*.wmv *.avi *.flv *.mkv *.ogg *.ogm *.mov ' +
          '*.mpg *.mp2 *.mp3 *.mp4 *.m4a *.aac' +
          '*.ra *.rm *.rv *.rmvb' +
          '*.wma *.flac *.aif *.aiff *.aifc *.wav)'
      fileDialog.setNameFilter(multimediaFilesExt)

      if (fileDialog.exec()) {
        let isFileAlreadyAdded: boolean = false
        let selectedFile: string = fileDialog.selectedFiles()[0]

        for (let i: number = 0; i < this.audioFileComboBox.count(); i++) {
          this.audioFileComboBox.setCurrentIndex(i)
          if (this.audioFileComboBox.currentText() == selectedFile) {
            isFileAlreadyAdded = true
            break
          }
        }
        if (selectedFile != null && !isFileAlreadyAdded) {
          let currentIndex: number = this.audioFileComboBox.currentIndex()
          this.audioFileComboBox.addItem(new QIcon('assets/audio-file-icon.png'), selectedFile)
          if (currentIndex != -1)
            this.audioFileComboBox.setCurrentIndex(currentIndex + 1)
          this.transcribeStartButton.setEnabled(true)
        }
      }

      this.checkTransferToTranslateButton()
    })
  }

  private whisperOptionsButtonEventListener(): void {
    this.whisperOptionsToolButton.addEventListener('clicked', (): void => {
      if (this.whisperOptionsWidget.isHidden())
        this.whisperOptionsWidget.show()
      else
        this.whisperOptionsWidget.hide()
    })    
  }

  private audioFileComboBoxEvenListener(): void {
    this.audioFileComboBox.addEventListener('currentTextChanged', (): void => {
      if (fs.existsSync(this.audioFileComboBox.currentText()))
        this.transcribeStartButton.setEnabled(true)
      else
        this.transcribeStartButton.setEnabled(false)

      this.checkTransferToTranslateButton()
    })
  }

  private whisperOutputFormatComboBoxEventListener(): void {
    this.whisperOutputFormatComboBox.addEventListener('currentTextChanged', (): void => {
      this.checkTransferToTranslateButton()
    })
  }

  private whisperModelComboBoxEventListener(): void {
    this.whisperModelComboBox.addEventListener('currentTextChanged', (text: string): void => {
      // Happens on clear, removeItem and on adding the first item
      if (text == '' || this.isDownloading)
        return

      if (this.config.whisperCLIPath == '' || this.config.whisperCLIPath == null) {
        const msg: string = 'Whisper CLI Path is not configured in the "Config" Tab. Configure it first'
        this.consoleWindow.log(msg)
        this.statusBar.clearMessage()
        this.statusBar.showMessage(msg, 10000)
        this.whisperModelComboBox.setCurrentText('medium.en')
        return
      }

      const modelFile: string = path.join(path.dirname(this.config.whisperCLIPath), 'models', 'ggml-' + text + '.bin')
      const coreMLModel: string = path.join(path.dirname(this.config.whisperCLIPath), 'models', 'ggml-' + text + '-encoder.mlmodelc')
      // In case we have DataModel not for CoreML
      if (this.config.whisperCLIArch === 'darwin-arm64' &&
          !fs.existsSync(coreMLModel) && fs.existsSync(modelFile))
        fs.rmSync(modelFile)

      if (!fs.existsSync(modelFile))
        this.downloadDataModel(text)
    })
  }

  private downloadDataModel(model: string, coreML: boolean = false): void {
    if (model == '') {
      this.consoleWindow.log('downloadDataModel: No model name specified for download')
      return
    }

    this.isDownloading = true
    const wasTranscribeButtonEnabled: boolean = this.transcribeStartButton.isEnabled()
    const wasTransferToTranslateButtonEnabled: boolean = this.transferToTranslateButton.isEnabled()

    // ProgressBar in the StatusBar
    let progressBar: QProgressBar = new QProgressBar()
    progressBar.setObjectName('progressBar')
    let downloadLabel: QLabel = new QLabel()
    progressBar.setFixedWidth(400)

    // Console ProgressBar
    const consoleBar: cliProgress.SingleBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_grey)

    let modelFileName: string
    let dataModelType: string
    if (coreML) {
      modelFileName = 'ggml-' + model + '-encoder.mlmodelc.zip'
      dataModelType = 'CoreML-Model'
    }
    else {
      modelFileName = 'ggml-' + model + '.bin'
      dataModelType = 'DataModel'
    }

    const src: string = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/' + modelFileName
    const modelsFolder: string = path.join(path.dirname(this.config.whisperCLIPath), 'models')
    let modelFile: string = path.join(modelsFolder, modelFileName)
    if (!fs.existsSync(modelsFolder))
      fs.mkdirSync(modelsFolder)

    let download: EventEmitter = wget.download(src, modelFile + '.download', undefined)
    let modelFileSize: number

    download.on('error', (err: Error): void => {
      this.consoleWindow.log(`Error while downloading Whisper ${dataModelType} (`, src, '): ', err)
      this.consoleWindow.log('Deleting the uncompleted download: ', modelFile)
      fs.rmSync(modelFile)
      // Set the default DataModel
      this.whisperModelComboBox.setCurrentText('medium.en')
      this.whisperModelComboBox.setEnabled(true)
      this.statusBar.removeWidget(downloadLabel)
      this.statusBar.removeWidget(progressBar)
      this.statusBar.clearMessage()
      this.statusBar.showMessage(`Error while downloading ${dataModelType}. See the console output for more details.`, 10000)
    })

    download.on('start', (fileSize: number): void => {
      this.whisperModelComboBox.setEnabled(false)
      this.audioFileLanguageComboBox.setEnabled(false)
      this.transcribeStartButton.setEnabled(false)
      this.transferToTranslateButton.setEnabled(false)
      this.rootEM.emit('disableTranslateTab')
      this.rootEM.emit('disableConfigTab')
      this.selectAudioFileButton.setEnabled(false)

      modelFileSize = fileSize
      const modelSizeStr: string = (fileSize / (1024*1024)).toFixed(2) + ' MB'
      const statusBarMsg: string = `Download Whisper ${dataModelType} (` + modelSizeStr + '): '
      let consoleDownloadMsg: string = 'Downloading Whisper "' + model + `" ${dataModelType}. Model Size: ` + modelSizeStr
      this.consoleWindow.log(`Whisper ${dataModelType} URL: `, src)
      this.consoleWindow.log('Target location: ', modelFile)
      downloadLabel.setText(statusBarMsg)
      this.statusBar.clearMessage()
      this.statusBar.addWidget(downloadLabel)
      this.statusBar.addWidget(progressBar)
      progressBar.setRange(0, 100)
      downloadLabel.setText(statusBarMsg)
      this.consoleWindow.log(consoleDownloadMsg)
      consoleBar.start(modelFileSize, 0)
    })

    download.on('end', async (output: string): Promise<void> => {
      fs.renameSync(modelFile + '.download', modelFile)
      this.statusBar.removeWidget(downloadLabel)
      this.statusBar.removeWidget(progressBar)
      consoleBar.stop()
      this.consoleWindow.log('Download completed: ', output)
      this.statusBar.clearMessage()
      this.statusBar.showMessage('Download completed', 5000)
      this.isDownloading = false
      // Download CoreML Model for Apple Silicon ARM64
      let coreMLModelFolder: string = path.join(modelsFolder, 'ggml-' + model + '-encoder.mlmodelc')
      if (this.config.whisperCLIArch === 'darwin-arm64' && !fs.existsSync(coreMLModelFolder)) {
        if (coreML) {
          let coreMLZip: AdmZip = new AdmZip(modelFile)
          this.consoleWindow.log(`Extracting CoreML Model ZIP archive ${modelFile}...`)
          this.statusBar.clearMessage()
          this.statusBar.showMessage('Extracting CoreML Model ZIP archive...')
          // Workaround to show message in StatusBar and log as the 'extractAllTo' blocks all
          await this.sleep(500)
          coreMLZip.extractAllTo(modelsFolder, true)
          this.consoleWindow.log('Extracting CoreML Model complete')
          this.statusBar.clearMessage()
          this.statusBar.showMessage('Downloading & Extracting CoreML Model complete')
          fs.rmSync(modelFile)
          this.consoleWindow.log(`Deleting CoreML Model ZIP archive ${modelFile}`)
        } else
          this.downloadDataModel(model, true)
      }
      this.refreshDataModels(model)
      this.whisperModelComboBox.setEnabled(true)
      this.audioFileLanguageComboBox.setEnabled(true)
      if (wasTranscribeButtonEnabled)
        this.transcribeStartButton.setEnabled(true)
      if (wasTransferToTranslateButtonEnabled)
        this.transferToTranslateButton.setEnabled(true)
      this.rootEM.emit('enableTranslateTab')
      this.rootEM.emit('enableConfigTab')
      this.selectAudioFileButton.setEnabled(true)
    })

    download.on('progress', (progress: number): void => {
      progressBar.setValue(progress * 100)
      consoleBar.update(Math.round(modelFileSize * progress))
    })
  }

  private audioFileLanguageComboBoxEventListener(): void {
    this.audioFileLanguageComboBox.addEventListener('currentTextChanged', (text: string): void => {
      if (text == 'English') {
        this.whisperModelComboBox.setCurrentText('medium.en')
      }
      else
        this.whisperModelComboBox.setCurrentText('large')

      this.config.lastUsedWhisperLanguage = this.audioFileLanguageComboBox.currentText()
      this.config.saveConfiguration(false)
    })
  }

  private transcribeButtonEventListener(): void {
    this.transcribeStartButton.addEventListener('clicked', (): void => {
      this.transcribeStartButton.setEnabled(false)
      this.transcribeCancelButton.setEnabled(true)

      let sourceLanguage: string = 'auto'
      if (this.audioFileLanguageComboBox.currentText() != 'auto')
        sourceLanguage = localeCode.getCode(this.audioFileLanguageComboBox.currentText())

      let outputFormat: string = this.whisperOutputFormatComboBox.currentText()
      let audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText())
      let outputFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name)

      let whisperArgs: string[] = [
        '--model', 'models/ggml-' + this.whisperModelComboBox.currentText() + '.bin',
        '--language', sourceLanguage,
        '--output-' + ((outputFormat == 'wts') ? 'words' : outputFormat),
        '--max-len', this.whisperSegmentsLengthLineEdit.text(),
        '--processors', this.whisperCPUsComboBox.currentText(),
        '--threads', this.whisperThreadsComboBox.currentText(),
        '--duration', this.whisperDurationLineEdit.text(),
        '--file', this.audioFileComboBox.currentText()
      ]

      // Not available for Windows port of Whisper.cpp with GPU acceleration
      if (this.config.whisperCLIArch == 'win-x64-gpu') {
        whisperArgs.push('--no-colors') // No colors till HTML parser for BASH colors is implemented
      }
      else {
        whisperArgs.push('--print-progress')
        // No colors till HTML parser for BASH colors is implemented
        // whisperArgs.push('--print-colors')
        whisperArgs.push('--output-file', outputFile)
      }

      if (this.whisperDiarizeCheckBox.isChecked())
        whisperArgs.push('--diarize')

      if (this.whisperCustomParamsLineEdit.text())
        whisperArgs.push(this.whisperCustomParamsLineEdit.text())

      this.statusBar.clearMessage()
      this.statusBar.showMessage('Transcribing...')

      let whisperCLI: string = this.config.whisperCLIPath
      if (path.dirname(whisperCLI) && !whisperCLI.startsWith('./'))
        whisperCLI = './' + whisperCLI
      this.whisperPrc = spawn(whisperCLI, whisperArgs,
          {cwd: path.dirname(this.config.whisperCLIPath)}
      )

      this.whisperPrc.stdout.on('data', (data: any): void => {
        this.consoleWindow.log(data.toString())
      })

      this.whisperPrc.stderr.on('data', (data: any): void => {
        this.consoleWindow.log(data.toString())
      })

      this.whisperPrc.stderr.on('error', (data: any): void => {
        this.consoleWindow.log(data.toString())
      })

      this.whisperPrc.on('exit', (code: any): void => {
        if (code != null)
          this.consoleWindow.log(`Transcribe completed.\nChild exited with code ${code}`)
        else
          this.consoleWindow.log('Transcribe aborted.')
        if (this.statusBar.currentMessage() != 'Killing Whisper process...') {
          this.statusBar.clearMessage()
          this.statusBar.showMessage('Transcribe completed.', 5000)
        } else {
          setTimeout((): void => {
            this.statusBar.clearMessage()
            this.statusBar.showMessage('Transcribe cancelled.', 5000)
          }, 1500)
        }
        this.transcribeStartButton.setEnabled(true)
        this.transcribeCancelButton.setEnabled(false)
        this.checkTransferToTranslateButton()
      })
    })
  }

  private transcribeCancelButtonEventListener(): void {
    this.transcribeCancelButton.addEventListener('clicked', (): void => {
      const msg: string = 'Killing Whisper process...'
      this.consoleWindow.log(msg)
      this.statusBar.clearMessage()
      this.statusBar.showMessage(msg, 5000)
      this.whisperPrc.kill()
    })
  }

  private transferToTranslateButtonEventListener(): void {
    this.transferToTranslateButton.addEventListener('clicked', (): void => {

      let audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText())
      let subtitleFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name +
          '.' + this.whisperOutputFormatComboBox.currentText())

      let isFileAlreadyAdded: boolean = false

      for (let i: number = 0; i < this.translate.translateFileComboBox.count(); i++) {
        this.translate.translateFileComboBox.setCurrentIndex(i)
        if (this.translate.translateFileComboBox.currentText() == subtitleFile) {
          isFileAlreadyAdded = true
          break
        }
      }

      if (!isFileAlreadyAdded) {
        let currentIndex: number = this.translate.translateFileComboBox.currentIndex()
        this.translate.translateFileComboBox.addItem(new QIcon('assets/subtitle-file-icon.png'), subtitleFile)
        if (currentIndex != -1)
          this.translate.translateFileComboBox.setCurrentIndex(currentIndex + 1)
      }

      this.transferToTranslateButton.setEnabled(true)

      // Go to TranslateTab
      this.rootEM.emit('showTranslateTab')
    })
  }

  private isTranscribedFileExist(format: string): boolean {
    const audioFileParsedPath: path.ParsedPath = path.parse(this.audioFileComboBox.currentText())
    const subtitleFile: string = path.join(audioFileParsedPath.dir, audioFileParsedPath.name + '.' + format)

    return fs.existsSync(subtitleFile)
  }

  /**
   * Enable / Disable TransferToTranslate Button
   * @private
   */
  private checkTransferToTranslateButton(): void {
    const allowedExt: string[] = ['srt', 'vtt']
    const format: string = this.whisperOutputFormatComboBox.currentText()
    if (this.isTranscribedFileExist(format) && allowedExt.indexOf(format) != -1)
      this.transferToTranslateButton.setEnabled(true)
    else
      this.transferToTranslateButton.setEnabled(false)
  }

  private addDataModels(): void {
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('tiny'), 'tiny')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('tiny.en'), 'tiny.en')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('base'), 'base')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('base.en'), 'base.en')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('small'), 'small')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('small.en'), 'small.en')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('medium'), 'medium')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('medium.en'), 'medium.en')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('large-v1'), 'large-v1')
    this.whisperModelComboBox.addItem(this.config.getDataModelIcon('large'), 'large')
  }

  private toggleConsoleButtonEventListener(): void {
    this.toggleConsoleButton.addEventListener('clicked', (): void => {
      this.consoleWindow.toggleWindow()
      this.rootEM.emit('activateMainWindow')
    })
  }

  public getCurrentModel(): string {
    return this.whisperModelComboBox.currentText()
  }

  public refreshDataModels(selectedModel?: string): void {
    this.whisperModelComboBox.clear()
    this.whisperModelComboBox.addItem(undefined, '')
    this.addDataModels()
    if (selectedModel)
      this.whisperModelComboBox.setCurrentText(selectedModel)
    else
      this.whisperModelComboBox.setCurrentText('medium.en')

    this.whisperModelComboBox.removeItem(0)
  }

  public refreshSupportedSubtitlesFormats(): void {
    this.whisperOutputFormatComboBox.clear()
    this.whisperOutputFormatComboBox.addItems(['srt', 'txt', 'vtt'])
    if (this.config.whisperCLIArch != 'win-x64-gpu')
      this.whisperOutputFormatComboBox.addItems(['lrc', 'wts', 'csv', 'json'])
  }
}