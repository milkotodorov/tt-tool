// ============================================================================
// 'Config Tab' Elements

import { FlexLayout, QIcon, QLabel, QLineEdit, QPushButton, QWidget } from "@nodegui/nodegui";
import * as fs from 'fs';

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
  public whisperCLIFolder: String;
  public whisperCLI: String;

  constructor() {
    // Root Widgets
    this.configRootWidget = new QWidget();
    this.configTabLayout = new FlexLayout();

    // Configuration
    this.whisperCLIFolder = '/Users/.../whisper.cpp/';
    this.whisperCLI = this.whisperCLIFolder + 'main';

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
  }

  private readConfigFile() {
    this.whisperCLILineEdit.setText('/Users/.../whisper.cpp/main');
  }

  public isDataModelExist(dataModelName: String): boolean {
    let whisperRootPath: String = this.whisperCLIFolder;
    let whisperModelsPath = whisperRootPath + 'models/ggml-' + dataModelName + '.bin';
    if (fs.existsSync(whisperModelsPath)) {
      return true;
    }

    return false;
  }

  public getDataModelIcon(dataModelName: String): QIcon {
    if (this.isDataModelExist(dataModelName))
      return new QIcon('assets/green-dot-icon.png');
    else 
      return new QIcon('assets/gray-dot-icon.png')
  }
};