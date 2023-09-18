import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QComboBox,
  QFileDialog,
  QIcon,
  QLabel,
  QPixmap,
  QPushButton,
  QSize,
  QStatusBar,
  QWidget
} from "@nodegui/nodegui"
import * as fs from 'fs'
import * as deepl from 'deepl-node'
import localeCode from 'iso-639-1'
import path from "node:path"
import {Config} from './config'
import {Node, parseSync, stringifySync} from 'subtitle'
import {NodeList} from "subtitle/src/types"
import {ConsoleWindow} from "./ConsoleWindow"

export class Translate {
  // ConsoleWindow
  private consoleWindow: ConsoleWindow

  // StatusBar
  private statusBar: QStatusBar

  // Configuration
  private config: Config

  // Supported DeepL Languages
  private readonly deeplLanguages: string[]

  // Root Widgets & Layouts
  public translateRootWidget: QWidget
  public translateTabLayout: FlexLayout

  // Title Widget
  private translateTopLabel: QLabel
  private translateTitleWidget: QWidget
  private translateTitleLayout: FlexLayout

  private selectTranslateFileLabel: QLabel
  private selectTranslateFileButton: QPushButton
  public translateFileComboBox: QComboBox
  private translateFileSpacerLabel: QLabel
  private translateFileArrowLabel: QLabel
  private translateArrowPixmap: QPixmap;
  private translateFileSourceLanguageComboBox: QComboBox
  private translateFileTargetLanguageComboBox: QComboBox

  // Wrapper Widgets
  private translateFileRootWidget: QWidget
  private translateFileRootLayout: FlexLayout
  private translateFileTopWidget: QWidget
  private translateFileTopLayout: FlexLayout

  // Buttons Widget
  private actionButtonsWidget: QWidget
  private actionButtonsLayout: FlexLayout

  // Action Buttons
  private translateButton: QPushButton
  private deeplUsageCheckButton: QPushButton
  private toggleConsoleButton: QPushButton
  private transcribeButtonsSpacer1Label: QLabel
  private transcribeButtonsSpacer2Label: QLabel

  constructor(consoleWindow: ConsoleWindow, statusBar: QStatusBar, config: Config) {
    this.consoleWindow = consoleWindow
    this.statusBar = statusBar

    // Configuration
    this.config = config

    // Supported DeepL Languages
    this.deeplLanguages = [
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
    ]

    // Root Widgets & Layouts
    this.translateRootWidget = new QWidget()
    this.translateRootWidget.setObjectName("translateRootWidget")
    this.translateTabLayout = new FlexLayout()
    this.translateRootWidget.setLayout(this.translateTabLayout)

    // Title Widget
    this.translateTopLabel= new QLabel()
    this.translateTopLabel.setObjectName('translateTopLabel')
    this.translateTopLabel.setText('Translate file using DeepL')

    this.translateTitleWidget = new QWidget()
    this.translateTitleLayout = new FlexLayout()
    this.translateTitleWidget.setObjectName('translateTitleWidget')
    this.translateTitleWidget.setLayout(this.translateTitleLayout)
    this.translateTitleLayout.addWidget(this.translateTopLabel)

    // Subtitle File for Translation Selection Widget
    this.selectTranslateFileLabel = new QLabel()
    this.selectTranslateFileLabel.setObjectName('selectTranslateFileLabel')
    this.selectTranslateFileLabel.setText('Subtitle file:')
    this.selectTranslateFileButton = new QPushButton()
    this.selectTranslateFileButton.setObjectName('selectTranslateFileButton')
    this.selectTranslateFileButton.setText("Select")
    this.translateFileComboBox = new QComboBox()
    this.translateFileComboBox.setObjectName('translateFileComboBox')
    this.translateFileComboBox.setEditable(true)
    this.translateFileComboBox.acceptDrops()
    this.translateFileSpacerLabel = new QLabel()
    this.translateFileSpacerLabel.setObjectName('translateFileSpacerLabel')
    this.translateFileArrowLabel = new QLabel()
    this.translateFileArrowLabel.setObjectName('translateFileArrowLabel')
    this.translateArrowPixmap = new QPixmap()
    this.translateArrowPixmap.load('assets/arrow.png')
    this.translateFileArrowLabel.setPixmap(this.translateArrowPixmap.scaled(32, 32))
    this.translateFileSourceLanguageComboBox = new QComboBox()
    this.translateFileSourceLanguageComboBox.setObjectName('translateFileSourceLanguageComboBox')
    this.translateFileSourceLanguageComboBox.addItems(this.deeplLanguages)
    this.translateFileSourceLanguageComboBox.setCurrentText(config.lastUsedDeepLSourceLang)
    this.translateFileTargetLanguageComboBox = new QComboBox()
    this.translateFileTargetLanguageComboBox.setObjectName('translateFileTargetLanguageComboBox')
    this.translateFileTargetLanguageComboBox.addItems(this.deeplLanguages)
    this.translateFileTargetLanguageComboBox.setCurrentText(config.lastUsedDeepLTargetLang)

    // Wrapper Widgets
    this.translateFileRootWidget = new QWidget()
    this.translateFileRootLayout = new FlexLayout()
    this.translateFileRootWidget.setObjectName('translateFileRootWidget')
    this.translateFileRootWidget.setLayout(this.translateFileRootLayout)

    this.translateFileTopWidget = new QWidget()
    this.translateFileTopLayout = new FlexLayout()
    this.translateFileTopWidget.setObjectName('translateFileTopWidget')
    this.translateFileTopWidget.setLayout(this.translateFileTopLayout)

    // Fill the layouts
    this.translateFileTopLayout.addWidget(this.selectTranslateFileLabel)
    this.translateFileTopLayout.addWidget(this.selectTranslateFileButton)
    this.translateFileTopLayout.addWidget(this.translateFileSpacerLabel)
    this.translateFileTopLayout.addWidget(this.translateFileSourceLanguageComboBox)
    //ToDo: Fin better "arrow" symbol for Windows
    this.translateFileTopLayout.addWidget(this.translateFileArrowLabel)
    // this.translateFileTopLayout.addWidget(this.translateArrow)
    this.translateFileTopLayout.addWidget(this.translateFileTargetLanguageComboBox)
    this.translateFileRootLayout.addWidget(this.translateFileTopWidget)
    this.translateFileRootLayout.addWidget(this.translateFileComboBox)

    // Start Transcribe Button
    this.translateButton = new QPushButton()
    this.translateButton.setObjectName('translateButton')
    this.translateButton.setText('Start\nTranslation')
    this.translateButton.setIcon(new QIcon('assets/translate-icon.png'))
    this.translateButton.setIconSize(new QSize(32, 32))
    this.deeplUsageCheckButton = new QPushButton()
    this.deeplUsageCheckButton.setObjectName('deeplUsageCheckButton')
    this.deeplUsageCheckButton.setText('Check\nDeepL Usage')
    this.deeplUsageCheckButton.setIcon(new QIcon('assets/usage-icon.png'))
    this.deeplUsageCheckButton.setIconSize(new QSize(32, 32))
    this.toggleConsoleButton = new QPushButton()
    this.toggleConsoleButton.setText('Toggle\nConsole')
    this.toggleConsoleButton.setIcon(new QIcon('assets/terminal-icon.png'))
    this.toggleConsoleButton.setIconSize(new QSize(32, 32))

    // Space between the buttons - to be improved
    this.transcribeButtonsSpacer1Label = new QLabel()
    this.transcribeButtonsSpacer1Label.setObjectName('transcribeButtonsSpacer1Label')
    this.transcribeButtonsSpacer2Label = new QLabel()
    this.transcribeButtonsSpacer2Label.setObjectName('transcribeButtonsSpacer2Label')

    // Buttons Widget
    this.actionButtonsWidget = new QWidget()
    this.actionButtonsLayout = new FlexLayout()
    this.actionButtonsWidget.setObjectName('actionButtonsWidget')
    this.actionButtonsWidget.setLayout(this.actionButtonsLayout)
    this.actionButtonsLayout.addWidget(this.translateButton)
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer1Label)
    this.actionButtonsLayout.addWidget(this.deeplUsageCheckButton)
    this.actionButtonsLayout.addWidget(this.transcribeButtonsSpacer2Label)
    this.actionButtonsLayout.addWidget(this.toggleConsoleButton)

    // Fill the root layout
    this.translateTabLayout.addWidget(this.translateTitleWidget)
    this.translateTabLayout.addWidget(this.translateFileRootWidget)
    this.translateTabLayout.addWidget(this.actionButtonsWidget)

    // Apply the Stylesheet
    this.translateRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'))

    // Add the event listeners
    this.selectTranslateFileButtonEventListener()
    this.translateButtonEventListener()
    this.deeplUsageCheckButtonEventListener()
    this.translateFileSourceLanguageComboBoxEL()
    this.translateFileTargetLanguageComboBoxEL()
    this.toggleConsoleButtonEventListener()

    // Set Buttons Enable/Disable State
    this.setButtonsState()
  }

  private selectTranslateFileButtonEventListener(): void {
    this.selectTranslateFileButton.addEventListener('clicked', (): void => {
      const fileDialog: QFileDialog = new QFileDialog()
      fileDialog.setFileMode(FileMode.ExistingFile)
      fileDialog.setOption(Option.ReadOnly)
      fileDialog.setLabelText(DialogLabel.Accept, 'Select')
      fileDialog.setNameFilter('Subtitle/Text (*.srt *.vtt)')
      if (fileDialog.exec()) {
        let isFileAlreadyAdded: boolean = false
        let selectedFile: string = fileDialog.selectedFiles()[0]

        for (let i: number = 0; i < this.translateFileComboBox.count(); i++) {
          this.translateFileComboBox.setCurrentIndex(i)
          if (this.translateFileComboBox.currentText() == selectedFile) {
            isFileAlreadyAdded = true
            break
          }
        }

        if (selectedFile != null && !isFileAlreadyAdded) {
          let currentIndex: number = this.translateFileComboBox.currentIndex()
          this.translateFileComboBox.addItem(new QIcon('assets/subtitle-file-icon.png'), selectedFile)
          if (currentIndex != -1)
            this.translateFileComboBox.setCurrentIndex(currentIndex + 1)
          this.translateButton.setEnabled(true)
        }
      }
    })
  }

  private async getDeepLUsage(): Promise<deepl.Usage | null> {
   if (!this.isDeepLAPIKeyMaintained())
     return null

    const authKey: string = this.config.deeplAPIKey
    const translator: deepl.Translator = new deepl.Translator(authKey)
    let deeplUsage: deepl.Usage
    try {
      deeplUsage = await translator.getUsage()
    } catch (error) {
      this.statusBar.clearMessage()
      this.statusBar.showMessage('DeepL API Error.', 5000)
      this.consoleWindow.log(error)
      return null
    }

    return deeplUsage
  }

  private async checkDeepLUsage(): Promise<void> {
    let deeplUsage: deepl.Usage | null = await this.getDeepLUsage()

    if (deeplUsage != null) {
      if (deeplUsage.character) {
        let msgUsage: string = `DeepL usage: ${deeplUsage.character.count} of ${deeplUsage.character.limit} characters used.`
        this.consoleWindow.log(msgUsage)
        if (deeplUsage.anyLimitReached())
          msgUsage += ' Quota used up.'
        this.statusBar.clearMessage()
        this.statusBar.showMessage(msgUsage, 5000)
      }
    }
  }

  private isDeepLAPIKeyMaintained(): boolean {
    if (this.config.deeplAPIKey == '') {
      const msg: string = 'DeepL API Key is not configured. Maintain it the ConfigTab.'
      this.statusBar.clearMessage()
      this.statusBar.showMessage(msg, 10000)
      this.consoleWindow.log(msg)
      return false
    }

    return true
  }

  public setButtonsState(): void {
    if (!this.isDeepLAPIKeyMaintained()) {
      this.translateButton.setEnabled(false)
      this.deeplUsageCheckButton.setEnabled(false)
      return
    }

    this.deeplUsageCheckButton.setEnabled(true)

    if (this.translateFileComboBox.currentText() == '') {
      this.translateButton.setEnabled(false)
      return
    }

    this.translateButton.setEnabled(true)
  }

  private async deeplTranslate(srcFile: string, sourceLang: deepl.SourceLanguageCode,
                               targetLang: deepl.TargetLanguageCode): Promise<void> {
    this.translateButton.setEnabled(false)
    this.statusBar.clearMessage()
    this.statusBar.showMessage('Translating...')

    // Prepare DeepL API
    const authKey: string = this.config.deeplAPIKey
    let translator: deepl.Translator = new deepl.Translator(authKey)

    this.consoleWindow.log(`Translating from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}`)

    const srcFilePPath: path.ParsedPath = path.parse(srcFile)
    const tmpTxtFile: string = path.join(srcFilePPath.dir, srcFilePPath.name + '-SubText.txt')
    const deeplFile: string = path.join(srcFilePPath.dir, srcFilePPath.name + '-DeepL.txt')
    const outSubFile: string = path.join(srcFilePPath.dir, `${srcFilePPath.name}.${targetLang.toUpperCase()}${srcFilePPath.ext}`)
    const isWebVTT: boolean = srcFilePPath.ext == '.vtt'

    if (fs.existsSync(outSubFile)) {
      const msg: string = 'Translation already exist: '
      this.consoleWindow.log(msg + outSubFile)
      this.statusBar.clearMessage()
      this.statusBar.showMessage(msg + path.basename(outSubFile), 5000)
      this.translateButton.setEnabled(true)
      return
    }

    // Extract subtitles as object
    this.translateFileComboBox.currentText()
    let sub: string
    try {
      sub = fs.readFileSync(srcFile, 'utf8')
    } catch (err) {
      const errMsg: string = 'Error while reading the subtitle file '
      this.consoleWindow.log(errMsg, srcFile)
      this.consoleWindow.log(err)
      this.statusBar.clearMessage()
      this.statusBar.showMessage(errMsg + srcFilePPath.base, 5000)
      this.translateButton.setEnabled(true)
      return
    }

    let subObj: NodeList = parseSync(sub)

    // Extract the Subtitles into text file
    if (fs.existsSync(tmpTxtFile))
      fs.rmSync(tmpTxtFile)
    let textFile: fs.WriteStream = fs.createWriteStream(tmpTxtFile)
    try {
      subObj.forEach(function (subEl: Node): void {
        if (subEl.type === 'cue') {
          if (subEl.data.start == 0)
            textFile.write(subEl.data.text)
          else
            textFile.write('\n' + subEl.data.text)
        }
      })
    } catch (err) {
      const errMsg: string = 'Error writing the temp output file '
      this.consoleWindow.log(errMsg, tmpTxtFile)
      this.consoleWindow.log(err)
      this.statusBar.clearMessage()
      this.statusBar.showMessage(errMsg + path.basename(tmpTxtFile), 5000)
      // Delete temp files
      fs.rmSync(tmpTxtFile)
      this.translateButton.setEnabled(true)
      return
    } finally {
      textFile.close()
    }

    textFile.on('close', async (): Promise<void> => {
      // Check DeepL Quota
      const trChars: number = (fs.readFileSync(tmpTxtFile, 'utf8')).length
      const deeplUsage: deepl.Usage | null = await this.getDeepLUsage()
      if (deeplUsage == null) {
        // Delete temp files
        fs.rmSync(tmpTxtFile)
        this.translateButton.setEnabled(true)
        return
      }
      let msgUsage: string = `DeepL usage: ${deeplUsage.character?.count} of ${deeplUsage.character?.limit} characters used.`
      if (deeplUsage.anyLimitReached()) {
        msgUsage += ' Quota used up.'
        this.statusBar.clearMessage()
        this.statusBar.showMessage(msgUsage, 5000)
        this.consoleWindow.log(msgUsage)
      }
      this.consoleWindow.log('Characters to be translated: ', trChars)
      this.consoleWindow.log(msgUsage)
      if (deeplUsage.character) {
        const deeplCharsLeft: number = deeplUsage.character.limit - deeplUsage.character.count
        if ((deeplCharsLeft) < trChars) {
          const msgQuotaExceed: string = `DeepL quota left for ${deeplCharsLeft} characters. ` +
              `Needed ${trChars}. Quota will be exceeded. Aborting...`
          this.statusBar.clearMessage()
          this.statusBar.showMessage(msgQuotaExceed, 5000)
          this.consoleWindow.log(msgQuotaExceed)
          // Delete temp files
          fs.rmSync(tmpTxtFile)
          this.translateButton.setEnabled(true)
          return
        }
      }

      // Translate the text file with DeepL API
      // Note: whole file translation improves accuracy over line by line
      try {
        if (fs.existsSync(deeplFile))
          fs.rmSync(deeplFile)
        await translator.translateDocument(tmpTxtFile, deeplFile, sourceLang, targetLang)
      } catch (error: any) {
        if (error.documentHandle) {
          // If the error occurs after the document was already uploaded,
          // documentHandle will contain the document ID and key
          const handle = error.documentHandle
          this.consoleWindow.log(`Error while translating file ${tmpTxtFile}`)
          this.consoleWindow.log(`Document ID: ${handle.documentId}, Document key: ${handle.documentKey}`)
          this.statusBar.clearMessage()
          this.statusBar.showMessage(`Error while translating file ${path.basename(tmpTxtFile)}.`, 5000)
        } else {
          const errMsg: string = 'Error occurred during document upload'
          this.statusBar.clearMessage()
          this.statusBar.showMessage(errMsg, 5000)
          this.consoleWindow.log(errMsg + `: ${error}`)
        }
        this.translateButton.setEnabled(true)
        // Delete temp files
        fs.rmSync(tmpTxtFile)
        return
      }

      // Update the subtitles object with the translated values
      if (!fs.existsSync(deeplFile)) {
        const errMsg: string = `DeepL translation file ${path.basename(deeplFile)} doesn't exist`
        this.consoleWindow.log(errMsg)
        this.statusBar.clearMessage()
        this.statusBar.showMessage(errMsg, 5000)
      }
      let trText: string
      try {
        trText = fs.readFileSync(deeplFile, 'utf8')
      } catch (err) {
        const errMsg: string = `Error while reading DeepL translated file ${path.basename(deeplFile)}.`
        this.consoleWindow.log(errMsg)
        this.consoleWindow.log(err)
        this.statusBar.clearMessage()
        this.statusBar.showMessage(errMsg, 5000)
        this.translateButton.setEnabled(true)
        // Delete temp files
        fs.rmSync(tmpTxtFile)
        fs.rmSync(deeplFile)
        return
      }

      const trTextArr: string[] = trText.split(/\r?\n/)

      for (let i: number = 0; i < subObj.length; i++) {
        let subEl: Node = subObj[i]
        if (subEl.type === 'cue')
          subEl.data.text = trTextArr[i - Number(isWebVTT)]
        subObj[i] = subEl
      }

      // Construct object for the output subtitles file with appropriate format
      let trSub: string
      if (isWebVTT)
        trSub = stringifySync(subObj, {format: 'WebVTT'})
      else
        trSub = stringifySync(subObj, {format: 'SRT'})

      try {
        // Write the data to the output file
        fs.writeFileSync(outSubFile, trSub)
      } catch (err) {
        const errMsg: string = 'Error writing to output translation subtitle file: '
        this.consoleWindow.log(errMsg + outSubFile)
        this.consoleWindow.log(err)
        this.statusBar.clearMessage()
        this.statusBar.showMessage(errMsg + path.basename(outSubFile), 5000)
        this.translateButton.setEnabled(true)
        // Delete temp files
        fs.rmSync(tmpTxtFile)
        fs.rmSync(deeplFile)
        return
      }

      this.statusBar.clearMessage()
      this.statusBar.showMessage(`Translation complete. Subtitle file: ${path.basename(outSubFile)}`, 5000)
      this.consoleWindow.log('Translation complete. Output file: ', outSubFile)

      // Delete temp files
      fs.rmSync(tmpTxtFile)
      fs.rmSync(deeplFile)

      this.translateButton.setEnabled(true)
    })
  }

  private translateButtonEventListener(): void {
    this.translateButton.addEventListener('clicked', (): void => {
      const sourceLang: deepl.SourceLanguageCode = deepl.standardizeLanguageCode(
          localeCode.getCode(this.translateFileSourceLanguageComboBox.currentText())) as deepl.SourceLanguageCode
      const targetLang: deepl.TargetLanguageCode = deepl.standardizeLanguageCode(
          localeCode.getCode(this.translateFileTargetLanguageComboBox.currentText())) as deepl.TargetLanguageCode
      this.deeplTranslate(this.translateFileComboBox.currentText(), sourceLang, targetLang)
    })
  }
  private toggleConsoleButtonEventListener(): void {
    this.toggleConsoleButton.addEventListener('clicked', (): void => {
      this.consoleWindow.toggleWindow()
    })
  }

  private deeplUsageCheckButtonEventListener(): void {
    this.deeplUsageCheckButton.addEventListener('clicked', async (): Promise<void> => {
      this.deeplUsageCheckButton.setEnabled(false)
      await this.checkDeepLUsage()
      this.deeplUsageCheckButton.setEnabled(true)
    })
  }

  private translateFileSourceLanguageComboBoxEL(): void {
    this.translateFileSourceLanguageComboBox.addEventListener('currentTextChanged', (): void => {
      this.config.lastUsedDeepLSourceLang = this.translateFileSourceLanguageComboBox.currentText()
      this.config.saveConfiguration(false)
    })
  }

  private translateFileTargetLanguageComboBoxEL(): void {
    this.translateFileTargetLanguageComboBox.addEventListener('currentTextChanged', (): void => {
      this.config.lastUsedDeepLTargetLang = this.translateFileTargetLanguageComboBox.currentText()
      this.config.saveConfiguration(false)
    })
  }
}






