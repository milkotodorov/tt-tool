import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QComboBox,
  QFileDialog,
  QIcon,
  QLabel,
  QPushButton,
  QStatusBar,
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import * as deepl from 'deepl-node'
import localeCode from 'iso-639-1';
import { Config } from './config';

export class Translate {
  // StatusBar
  private statusBar: QStatusBar;

  // Configuration
  private config: Config;

  // Supported DeepL Languages
  private readonly deeplLanguages: string[];

  // Root Widgets & Layouts
  public translateRootWidget: QWidget;
  public translateTabLayout: FlexLayout;

  // Title Widget
  private translateTopLabel: QLabel;
  private translateTitleWidget: QWidget;
  private translateTitleLayout: FlexLayout;

  private selectTranslateFileLabel: QLabel;
  private selectTranslateFileButton: QPushButton;
  public translateFileComboBox: QComboBox;
  private translateFileSpacerLabel: QLabel;
  private translateFileArrowLabel: QLabel;
  private translateFileSourceLanguageComboBox: QComboBox;
  private translateFileTargetLanguageComboBox: QComboBox;

  // Wrapper Widgets
  private translateFileRootWidget: QWidget
  private translateFileRootLayout: FlexLayout
  private translateFileTopWidget: QWidget
  private translateFileTopLayout: FlexLayout

  // Start Transcribe Button
  private translateButton: QPushButton;

  constructor(statusBar: QStatusBar, config: Config) {
    this.statusBar = statusBar;

    // Configuration
    this.config = config;

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
    ];

    // Root Widgets & Layouts
    this.translateRootWidget = new QWidget();
    this.translateRootWidget.setObjectName("translateRootWidget");
    this.translateTabLayout = new FlexLayout();
    this.translateRootWidget.setLayout(this.translateTabLayout);

    // Title Widget
    this.translateTopLabel= new QLabel();
    this.translateTopLabel.setObjectName('translateTopLabel');
    this.translateTopLabel.setText('Translate file using DeepL');

    this.translateTitleWidget = new QWidget();
    this.translateTitleLayout = new FlexLayout();
    this.translateTitleWidget.setObjectName('translateTitleWidget');
    this.translateTitleWidget.setLayout(this.translateTitleLayout);
    this.translateTitleLayout.addWidget(this.translateTopLabel);

    // Subtitle File for Translation Selection Widget
    this.selectTranslateFileLabel = new QLabel();
    this.selectTranslateFileLabel.setObjectName('selectTranslateFileLabel');
    this.selectTranslateFileLabel.setText('Subtitle file:');
    this.selectTranslateFileButton = new QPushButton();
    this.selectTranslateFileButton.setObjectName('selectTranslateFileButton');
    this.selectTranslateFileButton.setText("Select");
    this.translateFileComboBox = new QComboBox();
    this.translateFileComboBox.setObjectName('translateFileComboBox')
    this.translateFileComboBox.setEditable(true);
    this.translateFileComboBox.acceptDrops()
    this.translateFileSpacerLabel = new QLabel();
    this.translateFileSpacerLabel.setObjectName('translateFileSpacerLabel');
    this.translateFileArrowLabel = new QLabel();
    this.translateFileArrowLabel.setObjectName('translateFileArrowLabel');
    this.translateFileArrowLabel.setText('→');
    this.translateFileSourceLanguageComboBox = new QComboBox();
    this.translateFileSourceLanguageComboBox.setObjectName('translateFileSourceLanguageComboBox')
    this.translateFileSourceLanguageComboBox.addItems(this.deeplLanguages);
    this.translateFileSourceLanguageComboBox.setCurrentText('English');
    this.translateFileTargetLanguageComboBox = new QComboBox();
    this.translateFileTargetLanguageComboBox.setObjectName('translateFileTargetLanguageComboBox')
    this.translateFileTargetLanguageComboBox.addItems(this.deeplLanguages);
    this.translateFileTargetLanguageComboBox.setCurrentText('German');

    // Wrapper Widgets
    this.translateFileRootWidget = new QWidget();
    this.translateFileRootLayout = new FlexLayout();
    this.translateFileRootWidget.setObjectName('translateFileRootWidget');
    this.translateFileRootWidget.setLayout(this.translateFileRootLayout);

    this.translateFileTopWidget = new QWidget();
    this.translateFileTopLayout = new FlexLayout();
    this.translateFileTopWidget.setObjectName('translateFileTopWidget');
    this.translateFileTopWidget.setLayout(this.translateFileTopLayout);

    // Fill the layouts
    this.translateFileTopLayout.addWidget(this.selectTranslateFileLabel);
    this.translateFileTopLayout.addWidget(this.selectTranslateFileButton);
    this.translateFileTopLayout.addWidget(this.translateFileSpacerLabel);
    this.translateFileTopLayout.addWidget(this.translateFileSourceLanguageComboBox);
    this.translateFileTopLayout.addWidget(this.translateFileArrowLabel);
    this.translateFileTopLayout.addWidget(this.translateFileTargetLanguageComboBox);
    this.translateFileRootLayout.addWidget(this.translateFileTopWidget);
    this.translateFileRootLayout.addWidget(this.translateFileComboBox);

    // Start Transcribe Button
    this.translateButton = new QPushButton();
    this.translateButton.setText('Start\nTranslation')

    // Fill the root layout
    this.translateTabLayout.addWidget(this.translateTitleWidget);
    this.translateTabLayout.addWidget(this.translateFileRootWidget);
    this.translateTabLayout.addWidget(this.translateButton);

    // Apply the Stylesheet
    this.translateRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

    // Add the event listeners
    this.selectTranslateFileButtonEventListener();
    this.translateButtonEventListener();

    // this.translateButton.setEnabled(false);
    this.translateButton.setEnabled(true);
  }

  private selectTranslateFileButtonEventListener(): void {
    this.selectTranslateFileButton.addEventListener('clicked', (): void => {
      const fileDialog: QFileDialog = new QFileDialog();
      fileDialog.setFileMode(FileMode.ExistingFile);
      fileDialog.setOption(Option.ReadOnly);
      fileDialog.setLabelText(DialogLabel.Accept, 'Select');
      fileDialog.setNameFilter('Subtitle/Text (*.srt *.vtt *.txt)');
      if (fileDialog.exec()) {
        let isFileAlreadyAdded: boolean = false;
        let selectedFile: string = fileDialog.selectedFiles()[0];

        for (let i: number = 0; i < this.translateFileComboBox.count(); i++) {
          this.translateFileComboBox.setCurrentIndex(i);
          if (this.translateFileComboBox.currentText() == selectedFile) {
            isFileAlreadyAdded = true;
            break;
          }
        }

        if (selectedFile != null && !isFileAlreadyAdded) {
          let currentIndex: number = this.translateFileComboBox.currentIndex();
          this.translateFileComboBox.addItem(new QIcon('assets/subtitle-file-icon.png'), selectedFile);
          if (currentIndex != -1)
            this.translateFileComboBox.setCurrentIndex(currentIndex + 1);
          this.translateButton.setEnabled(true);
        }
      }
    });
  }

  public setTranslateButtonState(): void {
    if (this.config.deeplAPIKey == '') {
      const msg: string = 'DeepL API Key is not configured. Maintain it the ConfigTab.';
      this.statusBar.clearMessage();
      this.statusBar.showMessage(msg, 10000);
      console.log(msg);
      this.translateButton.setEnabled(false);
      return;
    }

    if (this.translateFileComboBox.currentText() == '') {
      this.translateButton.setEnabled(false);
      return;
    }

    this.translateButton.setEnabled(true);
  }

  private async deeplTranslate(file: string, fromLang: string, toLang: string): Promise<void> {
    const authKey: string = this.config.deeplAPIKey;
    const translator: deepl.Translator = new deepl.Translator(authKey);
    //ToDo: Implement...
  }

  private translateButtonEventListener(): void {
    this.translateButton.addEventListener('clicked', (): void => {
      const fromLang: string = localeCode.getCode(this.translateFileSourceLanguageComboBox.currentText());
      const toLang: string = localeCode.getCode(this.translateFileTargetLanguageComboBox.currentText());
      this.deeplTranslate(this.translateFileComboBox.currentText(), fromLang, toLang);
    });
  }
}







