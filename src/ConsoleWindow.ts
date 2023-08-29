import {
  FlexLayout,
  QMainWindow,
  QTextBrowser,
  QWidget
} from "@nodegui/nodegui";
import fs from "fs";

export class ConsoleWindow {
  public readonly window: QMainWindow;
  private readonly rootWidget: QWidget;
  private readonly rootLayout: FlexLayout;
  private readonly consoleTextBox: QTextBrowser;

  constructor(WindowSize: {Width: number, Height: number} = {Width: 800, Height: 600}) {
    this.window = new QMainWindow();
    this.window.setWindowTitle('Console Output');
    this.rootWidget = new QWidget();
    this.rootLayout = new FlexLayout();
    this.consoleTextBox = new QTextBrowser();
    this.consoleTextBox.setObjectName('console');

    this.window.setCentralWidget(this.rootWidget);
    this.rootWidget.setLayout(this.rootLayout);
    this.rootLayout.addWidget(this.consoleTextBox);
    this.rootWidget.setStyleSheet(fs.readFileSync('css/main.css', 'utf8'));

    this.window.resize(WindowSize.Width || 800, WindowSize.Height || 600);
    this.window.move(50, 300);
  }

  public show(): void {
    this.window.show();
  }

  public hide(): void {
    this.window.hide();
  }

  public toggleWindow(): void {
    if (this.window.isHidden())
      this.show();
    else
      this.hide();
  }

  /**
   * Will log any object. It will be converted to string beforehand.
   *
   * @param message Message to be logged
   * @param optionaParams Additional messages that will be appended
   */
  public log(message?: any, ...optionaParams: any[]): void {
    if (!message)
      return;

    let logMsg: string;
    if (typeof message !== 'string')
      logMsg = JSON.stringify(message, null, 2);
    else
      logMsg = message;

    if (optionaParams) {
      optionaParams.forEach((logEntry): void => {
        if (typeof logMsg !== 'string')
          logMsg = logMsg + ' ' + JSON.stringify(logEntry, null, 2);
        else
          logMsg += ' ' + logEntry;
      });
    }

    this.consoleTextBox.append(logMsg);
    // Log additionally to the real console
    console.log(logMsg);
  }
}