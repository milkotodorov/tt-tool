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
  QWidget
} from "@nodegui/nodegui";
import * as fs from 'fs';
import {FileData, fileNamePathSplit} from "./util";

export class Config {
  // Root Widgets & Layouts
  public configRootWidget: QWidget;
  public configTabLayout: FlexLayout;

  // Title Objects
  private configTopLabel: QLabel;
  private configTitleWidget: QWidget;
  private configTitleLayout: FlexLayout;

  // Whisper Configuration Objects
  private whisperConfigLabel: QLabel;
  private whisperCLIPathLabel: QLabel;
  private selectWhisperCLIButton: QPushButton;
  private whisperCLILineEdit: QLineEdit;
  private whisperCLIConfigWidget: QWidget;
  private whisperCLIConfigLayout: FlexLayout; 

  // DeepL Configuration Objects
  private deeplConfigLabel: QLabel;
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
  public whisperCLIFolder: string;
  public whisperCLI: string;
  public deeplAPIKey: string;

  constructor() {
    // Root Widgets
    this.configRootWidget = new QWidget();
    this.configTabLayout = new FlexLayout();

    // Empty Configuration
    this.whisperCLI = '';
    this.whisperCLIFolder = '';
    this.deeplAPIKey = '';

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
    this.whisperConfigLabel.setText('Whisper.cpp Configuration ══════════════════');
    this.whisperCLIPathLabel = new QLabel();
    this.whisperCLIPathLabel.setObjectName('whisperCLIPathLabel');
    this.whisperCLIPathLabel.setText('Whisper CLI Location:');
    this.selectWhisperCLIButton = new QPushButton();
    this.selectWhisperCLIButton.setObjectName('selectWhisperCLIButton');
    this.selectWhisperCLIButton.setText("Select");
    this.whisperCLILineEdit = new QLineEdit();
    this.whisperCLILineEdit.setObjectName('whisperCLILineEdit');

    this.whisperCLIConfigWidget = new QWidget();
    this.whisperCLIConfigWidget.setObjectName('whisperCLIConfigWidget');
    this.whisperCLIConfigLayout = new FlexLayout(); 
    this.whisperCLIConfigWidget.setLayout(this.whisperCLIConfigLayout);
    this.whisperCLIConfigLayout.addWidget(this.whisperCLIPathLabel);
    this.whisperCLIConfigLayout.addWidget(this.selectWhisperCLIButton);

    // DeepL Configuration Widget
    this.deeplConfigLabel = new QLabel();
    this.deeplConfigLabel.setObjectName('deeplConfigLabel');
    this.deeplConfigLabel.setText('DeepL Configuration ═════════════════════');
    this.deeplAPIKeyLabel = new QLabel();
    this.deeplAPIKeyLabel.setObjectName('deeplAPIKeyLabel');
    this.deeplAPIKeyLabel.setText('DeepL API Key:');
    this.deeplAPIKeyLineEdit = new QLineEdit();
    this.deeplAPIKeyLineEdit.setObjectName('deeplAPIKeyLineEdit');

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
    this.configTabLayout.addWidget(this.whisperConfigLabel);
    this.configTabLayout.addWidget(this.whisperCLIConfigWidget);
    this.configTabLayout.addWidget(this.whisperCLILineEdit);
    this.configTabLayout.addWidget(this.deeplConfigLabel);
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
      console.log("Error while reading the configuration file 'tt-tool-config.json': ", error);
      throw new Error();
    }

    try{
      configJSON = JSON.parse(configBuffer.toString());
    } catch(error) {
      console.log("Error while parsing the configuration file 'tt-tool-config.json': ", error);
      throw new Error();
    }

    this.whisperCLIFolder = configJSON.whisperCLIFolder;
    this.whisperCLI = this.whisperCLIFolder + configJSON.whisperCLIExecutable;
    this.deeplAPIKey = configJSON.deeplAPIKey;

    // Set loaded configuration into the UI
    this.whisperCLILineEdit.setText(this.whisperCLI);
    this.deeplAPIKeyLineEdit.setText(this.deeplAPIKey);
  }

  private saveConfiguration(): void {
    let fileData: FileData | null = fileNamePathSplit(this.whisperCLILineEdit.text());

    let config: any = {
      "whisperCLIFolder": fileData?.filePath,
      "whisperCLIExecutable": fileData?.fileFullName,
      "deeplAPIKey": this.deeplAPIKeyLineEdit.text()
    }

    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2), 'utf8');
      console.log('Configuration file updated.');
    } catch (error) {
      console.log('Error while saving the configuration file: ', error);
    }

    // Set the current configuration active
    this.whisperCLIFolder = config.whisperCLIFolder;
    this.whisperCLI = config.whisperCLIFolder + config.whisperCLIExecutable;
    this.deeplAPIKey = config.deeplAPIKey;

    //ToDo: Write a notification (status bar - pop-up) upon successful save
  }

  public isDataModelExist(dataModelName: string): boolean {
    let whisperModelsPath: string = this.whisperCLIFolder + 'models/ggml-' + dataModelName + '.bin';
    return fs.existsSync(whisperModelsPath);
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
      this.saveConfiguration();
    });
  }
}