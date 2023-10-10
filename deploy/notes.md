# Notes

 - Manually add MacOS app package icon. Add as follows into `tt-tool.app/Contents/Info.plist` in the `<dict>` section:

    ```xml
    <key>CFBundleIconFile</key>
    <string>dist/assets/tt-tool-icon-tp.png</string>
    ```
