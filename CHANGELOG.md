# Changelog
All notable changes to the "timing" extension will be documented in this file. This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2019-12-22 - v2.3.0
* **DEPRECATED** the string type of the `timing.hiddenCommands`.
* **Changed** the `timing.hiddenCommands` setting. It now accepts an array of command IDs.
* **Changed** insert icon to the corresponding [microsoft/vscode-icons](https://github.com/microsoft/vscode-icons) icon.

## 2019-05-16 - v2.2.0
* **Added** support for [remote development](https://code.visualstudio.com/docs/remote/remote-overview) by explicitly forcing the extension to be a UI extension.
* **Added** test results. Test results are now published to azure pipelines.
* **Changed** code coverage. Coverage reports are now published to azure pipelines.
* **Fixed** a bug in the `timing.epochToIsoUtc` that treated its input, no matter how long it was, as milliseconds. This caused the extension to fail when inserting nanoseconds.

## 2019-04-22 - v2.1.0
* **Changed** `timing.hoverTimestamp.targetFormat` setting. It now supports an array of multiple formats, too.  
  In the array you can additionally express custom formats as objects for advanced configuration. ([#30](https://github.com/HaaLeo/vscode-timing/issues/30))
* **Changed** CI/CD provider. Moved the project to azure pipelines.
* **Added** webpack for bundling the extension. Now the extension ships with 11 files instead of 383 and will load much faster.

## 2019-03-16 - v2.0.0
* **BREAKING CHANGES**:
  * The extension now requires minimum VS Code version **1.30.0**
  * Removed setting `timing.hoverTargetFormat`
* **Added** setting `timing.clipboard.readingEnabled` to indicate whether the extension should try to get the input time from the clipboard instead of asking the user for input.
* **Added** setting `timing.clipboard.writingEnabled` to indicate whether the result of the conversion is written to the clipboard. When enabled, no result view is shown.

## 2019-03-08 - v1.4.1
* **Updated** dependencies to fix security vulnerability in `extend`.
* **Fixed** a bug that prevented long epoch times (nanoseconds) being accepted as input for commands.

## 2019-02-05 - v1.4.0
* **Added** `timing.customToCustom` command to convert a custom time to another custom format ([#20](https://github.com/HaaLeo/vscode-timing/issues/20)).
* **Added** _optional arguments_ to reduce the required insertions during a conversion ([#21](https://github.com/HaaLeo/vscode-timing/issues/21)). Speeds up command usage if parameter do not change often.
* **Added** setting `timing.hiddenCommands` to indicate which commands shall be hidden from the command palette ([#23](https://github.com/HaaLeo/vscode-timing/issues/23)).
* **Changed** behavior of the result view: The result view is only shown when the converted time was _not inserted_ automatically ([#22](https://github.com/HaaLeo/vscode-timing/issues/22)).

## 2019-01-28 - v1.3.0
* **Added** _weeks_ to the readable duration conversion.
* **Added** `timing.isoDurationToEpoch` command to convert an ISO 8601 duration to an epoch timestamp.

## 2019-01-22 - v1.2.1
* **Fixed** links in readme for vscode marketplace.

## 2019-01-22 - v1.2.0
* **DEPRECATED** the `timing.hoverTargetFormat` setting. Use the `timing.hoverTimestamp.*` settings instead.
* **Added**
  * Settings:
    * `timing.hoverTimestamp.targetFormat`: Indicates the target format of the hover preview. It can be either "utc", "local" or a custom format.
    * `timing.hoverTimestamp.enabled`: Controls whether the timestamp hover is enabled or disabled.
    * `timing.hoverDuration.sourceUnit`: Indicates the source epoch unit for the duration hover preview. It can be either "s", "ms" or "ns".
    * `timing.hoverDuration.enabled`: Controls whether the duration hover is enabled or disabled.
    * `timing.hoverDuration.useISOTargetFormat`: Indicates whether the ISO 8601 duration definition is used as target format.
  * Commands:
    * `timing.epochToIsoDuration`: Convert an epoch time to an ISO 8601 duration.
    * `timing.epochToReadableDuration`: Convert an epoch time to an human readable duration.
  * Hover Provider:  
    * Shows the duration, when the mouse is hovered over an epoch time.

## 2018-11-08 - v1.1.2
* **Fixed** changelog

## 2018-11-08 - v1.1.1
* **Fixed** [#16](https://github.com/HaaLeo/vscode-timing/issues/16): The custom format options of the quick pick step were not updated, after the command was invoked once.

## 2018-09-13 - v1.1.0
* **Added** setting `timing.hoverTargetFormat` that indicates the target format of the hover preview ([#14](https://github.com/HaaLeo/vscode-timing/issues/14)). Possible values are:
  * `utc`: Show the hover preview in ISO 8601 UTC time. This is the default value.
  * `local`: Show the hover preview in ISO 8601 Local time.
  * `disable`: No hover preview is shown.
  * A custom [momentjs format](https://momentjs.com/docs/#/displaying/format/): For instance `LLLL`.

## 2018-09-06 - v1.0.0
* **BREAKING CHANGES**:
  * The extension now requires minimum VS Code version **1.26.0**
  * Removed command `timing.convertTime`
* **Added** a feature that allows to navigate back during a command. Either press the back button located in the top left corner of a step or press the hotkey <kbd>Alt</kbd> + <kbd>&larr;</kbd>
* **Added** a title bar that shows permanently which command was invoked, the current step's number and the total step count.
* **Added** setting `timing.ignoreFocusOut` (default: `true`) that indicates whether the input box should remain visible when it loses focus.
* **Added** setting `timing.hideResultViewOnEnter` (default: `true`) that indicates whether the result view should be hidden when <kbd>Enter</kbd> was pressed or whether the command shall restart again.
* **Added** a button to the result view that replaces the current selection in the editor with the result when it is clicked.

## 2018-07-11 - v0.5.0
* **Added** setting `timing.insertConvertedTime` that indicates whether the current selection is replaced with the converted time
* **Added** command `timing.toggleInsertConvertedTimeUserLevel` to toggle the `timing.insertConvertedTime` setting on user level

## 2018-06-23 - v0.4.2
* **Fixed** layout of Readme for vscode's extension explorer ([Microsoft/vscode#51859](https://github.com/Microsoft/vscode/issues/51859)).

## 2018-06-13 - v0.4.1
* **Fixed** layout of the Readme and Changelog
* **Added** support for [code coverage](https://codecov.io/gh/HaaLeo/vscode-timing)

## 2018-06-12 - v0.4.0
* **Added** commands that enable conversion from/to custom formats:
  * `timing.epochToCustom`: Converts an epoch time to a custom format
  * `timing.isoRfcToCustom`: Converts an ISO 8601 or RFC 2283 to a custom format
  * `timing.nowAsCustom`: Gets the current time in a custom format
  * `timing.customToEpoch`: Converts a custom time to epoch format (s, ms, ns)
  * `timing.customToIsoLocal`: Converts a custom time to ISO 8601 local format
  * `timing.customToIsoUtc`: Converts a custom time to ISO 8601 UTC format
*  **Added** settings `timing.customFormats` to specify custom formats in the `settings.json`
* **Changed** command description: Simplified the command description
* **Changed** display name on the marketplace from *Timing* to *Time Converter*

## 2018-06-05 - v0.3.0
* **Added** command `timing.nowAsIsoUtc` to get current time as ISO 8601 UTC format
* **Added** command `timing.nowAsIsoLocal` to get current time as ISO 8601 Local format
* **Added** command `timing.nowAsEpoch` to get current time as epoch format

## 2018-06-04 - v0.2.1
* **Fixed** a bug that prevented the `timing.epochToIso*` commands from accepting nanoseconds for conversion

## 2018-06-04 - v0.2.0
* **DEPRECATED** command `timing.convertTime` in favor for the `timing.epochToIsoUtc` command
* **Added** command `timing.epochToIsoUtc` to convert an epoch time to ISO 8601 *utc* format
* **Added** command `timing.epochToIsoLocal` to convert an epoch time to ISO 8601 *local* format
* **Added** command `timing.isoRfcToEpoch` to convert an ISO 8601 or RFC2282 formatted time to an epoch time. Further the user can select the target unit of the epoch time: **seconds**, **milliseconds** or **nanoseconds**

## 2018-05-29 - v0.1.2
* **Fixed** a bug that prevented the extension of running on linux systems
* **Added** Travis CI build stage

## 2018-05-28 - v0.1.1
* **Fixed** layout of table in the readme
* **Updated** gif animations

## 2018-05-28 - v0.1.0
* **Added** a feature that shows the converted time, when the mouse hovers over a number
* **Added** a feature that the time conversion is directly applied if the user selected a number earlier
* **Updated** the extension's icon

## 2018-05-27 - v0.0.1
* **Initial Release**
* **Added** a feature that enables time epoch to UTC conversion using the command palette
