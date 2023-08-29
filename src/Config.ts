import {
  DialogLabel,
  FileMode,
  FlexLayout,
  Option,
  QFileDialog,
  QIcon,
  QLabel,
  QLineEdit,
  QPushButton,
  QStatusBar,
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import * as path from "node:path";
import {ConsoleWindow} from "./ConsoleWindow";

export class Config {
  // ConsoleWindow
  private consoleWindow: ConsoleWindow;

  // StatusBar
  private statusBar: QStatusBar;

  // Root Widgets & Layouts
  public configRootWidget: QWidget;
  public configTabLayout: FlexLayout;

  // Title Objects
  private configTopLabel: QLabel;
  private configTitleWidget: QWidget;
  private configTitleLayout: FlexLayout;

  private configCLILabelLine: QLabel;
  private configDeepLLabelLine: QLabel;

  // Whisper Configuration Objects
  private whisperConfigLabel: QLabel;
  private whisperConfigLabelWidget: QWidget;
  private whisperConfigLabelLayout: FlexLayout;
  private whisperCLIPathLabel: QLabel;
  private selectWhisperCLIButton: QPushButton;
  private whisperCLILineEdit: QLineEdit;
  private whisperCLIConfigWidget: QWidget;
  private whisperCLIConfigLayout: FlexLayout;
  private whisperCLIConfigTopWidget: QWidget;
  private whisperCLIConfigTopLayout: FlexLayout;
  private whisperCLIConfigL2Widget: QWidget;
  private whisperCLIConfigL2Layout: FlexLayout;

  // DeepL Configuration Objects
  private deeplConfigLabel: QLabel;
  private deeplConfigLabelWidget: QWidget;
  private deeplConfigLabelLayout: FlexLayout;
  private deeplAPIKeyLabel: QLabel;
  private deeplAPIKeyLineEdit: QLineEdit;
  private deeplAPIKeyWidget: QWidget;
  private deeplAPIKeyLayout: FlexLayout;

  // Save Button Objects
  private saveConfigButton: QPushButton;
  private saveConfigWidget: QWidget;
  private saveConfigLayout: FlexLayout;

  // Configuration Objects
  private readonly configFile: string = 'tt-tool-config.json';
  public whisperCLIPath: string;
  public deeplAPIKey: string;
  public lastUsedDeepLSourceLang: string;
  public lastUsedDeepLTargetLang: string;
  public lastUsedWhisperLanguage: string;

  constructor(consoleWindow: ConsoleWindow, statusBar: QStatusBar) {
    // ConsoleWindow
    this.consoleWindow = consoleWindow;
    
    // StatusBar
    this.statusBar = statusBar;

    // Root Widgets
    this.configRootWidget = new QWidget();
    this.configTabLayout = new FlexLayout();

    // Empty Configuration
    this.whisperCLIPath = '';
    this.deeplAPIKey = '';
    this.lastUsedDeepLSourceLang = 'English';
    this.lastUsedDeepLTargetLang = 'German';
    this.lastUsedWhisperLanguage = 'English';

    this.configRootWidget.setObjectName("configRootWidget");
    this.configRootWidget.setLayout(this.configTabLayout);

    // Title Widget
    this.configTopLabel = new QLabel(); 
    this.configTopLabel.setObjectName('configTopLabel');
    this.configTopLabel.setText('Whisper & DeepL Configuration');
    
    this.configTitleWidget = new QWidget();
    this.configTitleWidget.setObjectName('configTitleWidget');
    this.configTitleLayout = new FlexLayout(); 
    this.configTitleWidget.setLayout(this.configTitleLayout);
    this.configTitleLayout.addWidget(this.configTopLabel);

    // Whisper Configuration Widget
    this.whisperConfigLabel = new QLabel();
    this.whisperConfigLabel.setObjectName('whisperConfigLabel');
    this.whisperConfigLabel.setText('Whisper.cpp Configuration');
    this.configCLILabelLine = new QLabel();
    this.configCLILabelLine.setObjectName('configLabelLine');
    this.configCLILabelLine.setText('═'.repeat(50));
    this.whisperCLIPathLabel = new QLabel();
    this.whisperCLIPathLabel.setObjectName('whisperCLIPathLabel');
    this.whisperCLIPathLabel.setText('Whisper CLI Location:');
    this.selectWhisperCLIButton = new QPushButton();
    this.selectWhisperCLIButton.setObjectName('selectWhisperCLIButton');
    this.selectWhisperCLIButton.setText("Select");
    this.whisperCLILineEdit = new QLineEdit();
    this.whisperCLILineEdit.setObjectName('whisperCLILineEdit');

    this.whisperConfigLabelWidget = new QWidget();
    this.whisperConfigLabelLayout = new FlexLayout();
    this.whisperConfigLabelWidget.setObjectName('whisperConfigWidget');
    this.whisperConfigLabelWidget.setLayout(this.whisperConfigLabelLayout);
    this.whisperConfigLabelLayout.addWidget(this.whisperConfigLabel);
    this.whisperConfigLabelLayout.addWidget(this.configCLILabelLine);

    this.whisperCLIConfigTopWidget = new QWidget();
    this.whisperCLIConfigTopWidget.setObjectName('whisperCLIConfigTopWidget');
    this.whisperCLIConfigTopLayout = new FlexLayout();
    this.whisperCLIConfigTopWidget.setLayout(this.whisperCLIConfigTopLayout);
    this.whisperCLIConfigTopLayout.addWidget(this.whisperCLIPathLabel);
    this.whisperCLIConfigTopLayout.addWidget(this.selectWhisperCLIButton);

    this.whisperCLIConfigWidget = new QWidget();
    this.whisperCLIConfigLayout = new FlexLayout();
    this.whisperCLIConfigWidget.setObjectName('whisperCLIConfigWidget');
    this.whisperCLIConfigWidget.setLayout(this.whisperCLIConfigLayout);
    this.whisperCLIConfigL2Widget = new QWidget();
    this.whisperCLIConfigL2Layout = new FlexLayout();
    this.whisperCLIConfigL2Widget.setObjectName('whisperCLIConfigL2Widget');
    this.whisperCLIConfigL2Widget.setLayout(this.whisperCLIConfigL2Layout);

    this.whisperCLIConfigL2Layout.addWidget(this.whisperCLILineEdit);
    this.whisperCLIConfigLayout.addWidget(this.whisperCLIConfigTopWidget);
    this.whisperCLIConfigLayout.addWidget(this.whisperCLIConfigL2Widget);

    // DeepL Configuration Widget
    this.deeplConfigLabel = new QLabel();
    this.deeplConfigLabel.setObjectName('deeplConfigLabel');
    this.deeplConfigLabel.setText('DeepL Configuration');
    this.configDeepLLabelLine = new QLabel();
    this.configDeepLLabelLine.setObjectName('configLabelLine');
    this.configDeepLLabelLine.setText('═'.repeat(50));
    this.deeplAPIKeyLabel = new QLabel();
    this.deeplAPIKeyLabel.setObjectName('deeplAPIKeyLabel');
    this.deeplAPIKeyLabel.setText('DeepL API Key:');
    this.deeplAPIKeyLineEdit = new QLineEdit();
    this.deeplAPIKeyLineEdit.setObjectName('deeplAPIKeyLineEdit');

    this.deeplConfigLabelWidget = new QWidget();
    this.deeplConfigLabelLayout = new FlexLayout();
    this.deeplConfigLabelWidget.setObjectName('deeplConfigLabelWidget');
    this.deeplConfigLabelWidget.setLayout(this.deeplConfigLabelLayout);
    this.deeplConfigLabelLayout.addWidget(this.deeplConfigLabel);
    this.deeplConfigLabelLayout.addWidget(this.configDeepLLabelLine);

    this.deeplAPIKeyWidget = new QWidget();
    this.deeplAPIKeyWidget.setObjectName('deeplAPIKeyWidget');
    this.deeplAPIKeyLayout = new FlexLayout();
    this.deeplAPIKeyWidget.setLayout(this.deeplAPIKeyLayout);
    this.deeplAPIKeyLayout.addWidget(this.deeplAPIKeyLabel);
    this.deeplAPIKeyLayout.addWidget(this.deeplAPIKeyLineEdit);
    this.saveConfigButton = new QPushButton();
    this.saveConfigButton.setObjectName('saveConfigButton');
    this.saveConfigButton.setText("Save");

    // Save Button Widget
    this.saveConfigWidget = new QWidget();
    this.saveConfigWidget.setObjectName('saveConfigWidget');
    this.saveConfigLayout = new FlexLayout();
    this.saveConfigWidget.setLayout(this.saveConfigLayout);
    this.saveConfigLayout.addWidget(this.saveConfigButton);

    // Fill the root layout
    this.configTabLayout.addWidget(this.configTitleWidget);
    this.configTabLayout.addWidget(this.whisperConfigLabelWidget);
    this.configTabLayout.addWidget(this.whisperCLIConfigWidget);
    this.configTabLayout.addWidget(this.deeplConfigLabelWidget);
    this.configTabLayout.addWidget(this.deeplAPIKeyWidget);
    this.configTabLayout.addWidget(this.saveConfigWidget);

    // Apply the Stylesheet
    this.configRootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

    this.readConfigFile();

    // Add event listeners
    this.saveConfigButtonEventListener();
    this.selectWhisperCLIButtonEventListener();
  }

  private readConfigFile(): void {
    if (!fs.existsSync(this.configFile))
      return;

    // Read configuration
    let configBuffer: Buffer;
    let configJSON: any;

    try {
      configBuffer = fs.readFileSync(this.configFile);
    } catch (error) {
      this.consoleWindow.log("Error while reading the configuration file 'tt-tool-config.json': ", error);
      throw new Error();
    }

    try{
      configJSON = JSON.parse(configBuffer.toString());
    } catch(error) {
      this.consoleWindow.log("Error while parsing the configuration file 'tt-tool-config.json': ", error);
      throw new Error();
    }

    // Set the values from the config file only if present
    if (configJSON.whisperCLIPath != null)
      this.whisperCLIPath = configJSON.whisperCLIPath;
    if (configJSON.deeplAPIKey != null)
      this.deeplAPIKey = configJSON.deeplAPIKey;
    if (configJSON.lastUsedDeepLSourceLang != null)
      this.lastUsedDeepLSourceLang = configJSON.lastUsedDeepLSourceLang;
    if (configJSON.lastUsedDeepLTargetLang != null)
      this.lastUsedDeepLTargetLang = configJSON.lastUsedDeepLTargetLang;
    if (configJSON.lastUsedWhisperLanguage != null)
      this.lastUsedWhisperLanguage = configJSON.lastUsedWhisperLanguage;

    // Set loaded configuration into the UI
    this.whisperCLILineEdit.setText(this.whisperCLIPath);
    this.deeplAPIKeyLineEdit.setText(this.deeplAPIKey);
  }

  public saveConfiguration(showMessage: boolean): void {
    if (!fs.existsSync(this.whisperCLILineEdit.text())) {
      this.whisperCLILineEdit.setText('');
      const msg: string = "WhisperCLIPath doesn't exist. Select a valid path";
      this.consoleWindow.log(msg);
      this.statusBar.clearMessage()
      this.statusBar.showMessage(msg, 5000);
      return;
    }

    let config: any = {
      "whisperCLIPath": this.whisperCLILineEdit.text(),
      "deeplAPIKey": this.deeplAPIKeyLineEdit.text(),
      "lastUsedDeepLSourceLang": this.lastUsedDeepLSourceLang,
      "lastUsedDeepLTargetLang": this.lastUsedDeepLTargetLang,
      "lastUsedWhisperLanguage": this.lastUsedWhisperLanguage
    }

    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2), 'utf8');
      if (showMessage)
        this.consoleWindow.log('Configuration file tt-tool-config.json updated.');
    } catch (error) {
      this.consoleWindow.log('Error while saving the configuration file: ', error);
    }

    // Set the current configuration active
    this.whisperCLIPath = config.whisperCLIPath;
    this.deeplAPIKey = config.deeplAPIKey;

    if (showMessage) {
      this.statusBar.clearMessage();
      this.statusBar.showMessage('Configuration saved.', 5000);
    }
  }

  public isDataModelExist(dataModelName: string): boolean {
    const whisperCLIPath: path.ParsedPath = path.parse(this.whisperCLILineEdit.text());
    const modelFile: string = 'models/ggml-' + dataModelName + '.bin';
    const modelFilePath: string = path.join(whisperCLIPath.dir, modelFile);

    return fs.existsSync(modelFilePath);
  }

  public getDataModelIcon(dataModelName: string): QIcon {
    if (this.isDataModelExist(dataModelName))
      return new QIcon('assets/green-dot-icon.png');
    else 
      return new QIcon('assets/gray-dot-icon.png')
  }

  private selectWhisperCLIButtonEventListener(): void {
    this.selectWhisperCLIButton.addEventListener('clicked', () => {
      const fileDialog: QFileDialog = new QFileDialog();
      fileDialog.setFileMode(FileMode.ExistingFile);
      fileDialog.setOption(Option.ReadOnly);
      fileDialog.setLabelText(DialogLabel.Accept, 'Select');
      // fileDialog.setOption(Option.DontUseNativeDialog);
      //ToDo: Filter only executable files
      if (fileDialog.exec()) {
        let selectedFile: string = fileDialog.selectedFiles()[0];
        if (selectedFile != null)
          this.whisperCLILineEdit.setText(selectedFile);
      }
    });
  }

  private saveConfigButtonEventListener(): void {
    this.saveConfigButton.addEventListener('clicked', () => {
      this.saveConfiguration(true);
    });
  }
}