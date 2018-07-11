# Change Log
All notable changes to the "timing" extension will be documented in this file.

## 2018-07-11 - v0.5.0
* **Added** setting `timing.insertConvertedTime` that indicates whether the current selection is replaced with the converted time
* **Added** command `timing.toggleInsertConvertedTimeUserLevel` to toggle the `timing.insertConvertedTime` setting on user level

## 2018-06-23 - v0.4.2
* **Fixed** layout of Readme for vscode's extension explorer ([#51859](https://github.com/Microsoft/vscode/issues/51859)).

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
