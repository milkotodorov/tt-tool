import {
  FlexLayout,
  QFont,
  QIcon,
  QMainWindow,
  QTextBrowser,
  QWidget
} from "@nodegui/nodegui"
import fs from "fs"

export class ConsoleWindow {
  private readonly window: QMainWindow
  private readonly rootWidget: QWidget
  private readonly rootLayout: FlexLayout
  private readonly consoleTextBox: QTextBrowser

  constructor(WindowSize: {Width: number, Height: number} = {Width: 800, Height: 600}) {
    this.window = new QMainWindow()
    this.window.setWindowTitle('Console Output')
    this.window.setWindowIcon(new QIcon('assets/terminal-icon.png'))
    this.rootWidget = new QWidget()
    this.rootLayout = new FlexLayout()
    this.consoleTextBox = new QTextBrowser()
    this.consoleTextBox.setObjectName('console')
    this.consoleTextBox.setFont(new QFont("MesloLGS NF", 11))
    this.window.setCentralWidget(this.rootWidget)
    this.rootWidget.setLayout(this.rootLayout)
    this.rootLayout.addWidget(this.consoleTextBox)

    // Apply the Stylesheet
    this.rootWidget.setStyleSheet(fs.readFileSync('dist/css/common.css', 'utf8'))

    this.window.resize(WindowSize.Width || 800, WindowSize.Height || 600)
    this.window.move(50, 300)
  }

  public close(): void {
    this.window.close()
  }

  public show(): void {
    this.window.show()
  }

  public hide(): void {
    this.window.hide()
  }

  public toggleWindow(): void {
    if (this.window.isHidden())
      this.show()
    else
      this.hide()
  }

  /**
   * Will log any object. It will be converted to string beforehand.
   *
   * @param message Message to be logged
   * @param optionaParams Additional messages that will be appended
   */
  public log(message?: any, ...optionaParams: any[]): void {
    if (!message)
      return

    let logMsg: string
    if (typeof message !== 'string')
      logMsg = JSON.stringify(message, null, 2)
    else
      logMsg = message

    if (optionaParams) {
      optionaParams.forEach((logEntry): void => {
        if (typeof logMsg !== 'string')
          logMsg = logMsg + ' ' + JSON.stringify(logEntry, null, 2)
        else
          logMsg += ' ' + logEntry
      })
    }

    this.consoleTextBox.append(logMsg)
    // Log additionally to the real console
    console.log(logMsg)
  }
}