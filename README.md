# VS Code Time Converter &#8212; `timing`

[![Version](https://vsmarketplacebadge.apphb.com/version/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing) [![Installs](https://vsmarketplacebadge.apphb.com/installs/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing) [![Ratings](https://vsmarketplacebadge.apphb.com/rating/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing#review-details) [![Stars](https://img.shields.io/github/stars/HaaLeo/vscode-timing.svg?label=Stars&logo=github&style=flat-square)](https://github.com/HaaLeo/vscode-timing/stargazers)  
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://raw.githubusercontent.com/HaaLeo/vscode-timing/master/LICENSE) [![Build Status](https://img.shields.io/travis/HaaLeo/vscode-timing/master.svg?style=flat-square)](https://travis-ci.org/HaaLeo/vscode-timing) [![Codecov](https://img.shields.io/codecov/c/github/HaaLeo/vscode-timing.svg?style=flat-square)](https://codecov.io/gh/HaaLeo/vscode-timing)  
[![David](https://img.shields.io/david/HaaLeo/vscode-timing.svg?style=flat-square)](https://david-dm.org/HaaLeo/vscode-timing) [![David](https://img.shields.io/david/dev/HaaLeo/vscode-timing.svg?style=flat-square)](https://david-dm.org/HaaLeo/vscode-timing?type=dev) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)  
[![Donate](https://img.shields.io/badge/-Donate-blue.svg?logo=paypal&style=flat-square)](https://www.paypal.me/LeoHanisch)

## Description
The *timing* extension converts and visualizes a given time to various formats.  
This extension was inspired by 
[zodiac403's  epoch-time-converter](https://github.com/zodiac403/epoch-time-converter).

## Features

Currently this extension is capable to do the following conversions, where the _epoch_ time can be formated in **seconds**, **milliseconds** or **nanoseconds**, and _custom_ is a [momentjs format](https://momentjs.com/docs/#/displaying/format/), that you can specify in the settings or insert during the conversion:  

| Source Format| ⟶ | Target Format|
|:--|:--:|:-- |
| Epoch (s, ms, ns) | ⟶ | ISO 8601 Local|
| Epoch (s, ms, ns) | ⟶ | ISO 8601 UTC|
| Epoch (s, ms, ns) | ⟶ | Custom|
| ISO 8601 / RFC 2282 | ⟶ | Epoch (s, ms, ns)|
| ISO 8601 / RFC 2282 | ⟶ | Custom|
| - | ⟶ | Now as Epoch (s, ms, ns)|
| - | ⟶ | Now as ISO 8601 Local|
| - | ⟶ | Now as ISO 8601 UTC|
| - | ⟶ | Now as Custom|
| Custom | ⟶ | Epoch (s, ms, ns)|
| Custom | ⟶ | ISO 8601 Local|
| Custom | ⟶ | ISO 8601 Utc|

When the _epoch time is the **source**_ format of the conversion its unit is determined by its **digit count**:

| Minimum Length| Maximum Length| Used Unit |
|:--:|:--:|:--:|
| 1 | 11| **s**
|12 | 14| **ms**
|15 | 21| **ns**

>**Note**: Currently those boundaries are fixed and cannot be changed.

When the _epoch time is the **target**_ format of the conversion you can select its unit during the conversion process.  

### Conversion via Command Palette

In order to convert a time via the command palette there exist several commands. Each command will show up an input box where you can enter the time. After pressing <kbd>Enter</kbd> it will display the converted time in the input box again, ready to be copied.

![Convert Sample](doc/Convert_Sample.gif)

If a valid time string is pre-selected, the command will directly convert the selection and show the corresponding result.

![Convert Selection Sample](doc/Convert_Selection_Sample.gif)

If required, the command will ask you to select the **target format** of the epoch time (s, ms, ns).

![Convert Selection Option Sample](doc/Convert_Selection_Option_Sample.gif)

### Current Time

In addition, you can also get the current time as **epoch**, **ISO 8601**, or **custom** format.

![Now as ISO 8601 Local](doc/Get_Now_Local_Sample.gif)

### Custom Formats
To convert different times from/to custom formats you need to insert a **valid [momentjs format](https://momentjs.com/docs/#/displaying/format/)** after you invoke a corresponding command.  

![Convert To CustomSample](doc/Convert_To_Custom_Sample.gif)

Optionally you can specify **custom formats** of the following shape in the user settings. Those will be shown as possible choices.  
Example:

```JSON
{
    "timing.customFormats": [
        {
            "format": "LLLL",
            "description": "US",
            "detail": "Often used in the US"
        },
        {
            "format": "DD.MM.YYYY HH:mm:ss",
            "description": "GER",
            "detail": "Often used in Germany"
        }
    ]
}
```

### Hover Preview

When you hover over a number the extension shows you the converted **UTC time** of that number and which **unit** was used for the conversion.

![Hover Sample](doc/Hover_Sample.gif)

## Command Overview

* `timing.customToEpoch`: Custom ⟶ Epoch
* `timing.customToIsoUtc`: Custom ⟶ ISO 8601 UTC
* `timing.customToIsoLocal`: Custom ⟶ ISO 8601 Local
* `timing.epochToIsoUtc`: Epoch ⟶ ISO 8601 UTC
* `timing.epochToIsoLocal`: Epoch ⟶ ISO 8601 Local
* `timing.epochToCustom`: Epoch ⟶ Custom
* `timing.isoRfcToEpoch`: ISO 8601 / RFC 2822 ⟶ Epoch
* `timing.isoRfcToCustom`: ISO 8601 / RFC 2822 ⟶ Custom
* `timing.nowAsCustom`: Now ⟶ Custom
* `timing.nowAsEpoch`: Now ⟶ Epoch
* `timing.nowAsIsoLocal`: Now ⟶ Epoch
* `timing.nowAsIsoUtc`: Now ⟶ Epoch
* `timing.convertTime`: **DEPRECATED**, use `timing.epochToIsoUtc` instead

## Contribution

If you found a bug or are missing a feature do not hesitate to [file an issue](https://github.com/HaaLeo/vscode-timing/issues/new).  
Pull Requests are welcome!

## Support
When you like this extension make sure to [star the repo](https://github.com/HaaLeo/vscode-timing/stargazers) and [write a review](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing#review-details). I am always looking for new ideas and feedback.  
In addition, it is possible to [donate via paypal](https://www.paypal.me/LeoHanisch).
