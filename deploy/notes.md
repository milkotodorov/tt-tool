# Notes

 - Manually add MacOS app package icon. Add as follows into `tt-tool.app/Contents/Info.plist` in the `<dict>` section:

    ```xml
    <key>CFBundleIconFile</key>
    <string>dist/assets/tt-tool-icon.icns</string>
    ```
 - Add Windows app icon by running `npm run set-app-icon-win`. It changes the `qode.exe` icon into the `node_modules`. So it needs to be run only once till next update of the node dependencies.   