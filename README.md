# Time Converter &#8212; `timing`

[![Version](https://vsmarketplacebadge.apphb.com/version/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing) [![Installs](https://vsmarketplacebadge.apphb.com/installs/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing) [![Ratings](https://vsmarketplacebadge.apphb.com/rating/HaaLeo.Timing.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=HaaLeo.Timing)  
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://raw.githubusercontent.com/HaaLeo/vscode-timing/master/LICENSE) [![Build Status](https://img.shields.io/travis/HaaLeo/vscode-timing/master.svg?style=flat-square)](https://travis-ci.org/HaaLeo/vscode-timing) [![David](https://img.shields.io/david/HaaLeo/vscode-timing.svg?style=flat-square)](https://david-dm.org/HaaLeo/vscode-timing) [![David](https://img.shields.io/david/dev/HaaLeo/vscode-timing.svg?style=flat-square)](https://david-dm.org/HaaLeo/vscode-timing?type=dev)  
[![Donate](https://img.shields.io/badge/-Donate-blue.svg?logo=paypal&style=flat-square)](https://www.paypal.me/LeoHanisch)

## Description
The *timing* extension converts and visualizes a given time to various formats.  
This extension was inspired by 
[zodiac403's  epoch-time-converter](https://github.com/zodiac403/epoch-time-converter).

## Features

Currently this extension is capable to do the following conversions, where the epoch time can be formated in **seconds**, **milliseconds** or **nanoseconds**:  

| Source Format| Target Format|
|:--:|:--:|
| Epoch (s, ms, ns) | ISO 8601 UTC|
| Epoch (s, ms, ns) | ISO 8601 Local|
| ISO 8601 | Epoch (s, ms, ns)|
| RFC 2282 | Epoch (s, ms, ns)|
| - | Current Time as Epoch (s, ms, ns) |
| - | Current Time as ISO 8601 UTC |
| - | Current Time as ISO 8601 Local |

When the *epoch time is the **source*** format of the conversion its unit is determined by its **digit count**:

| Minimum Length| Maximum Length| Used Unit |
|:--:|:--:|:--:|
| 1 | 11| **s**
|12 | 14| **ms**
|15 | 21| **ns**

>**Note**: Currently those boundaries are fixed and cannot be changed.

When the *epoch time is the **target*** format of the conversion its unit can be selected by the user during the conversion process.  

### Conversion via Command Palette

In order to convert a time via the command palette there exist several commands. Each command will show up an input box where you can enter the time. After pressing <kbd>Enter</kbd> it will display the converted time in the input box again, ready to be copied.

![Convert Sample](doc/Convert_Sample.gif)

If a valid time string is pre-selected, the command will directly convert the user selection and show the corresponding result.

![Convert Selection Sample](doc/Convert_Selection_Sample.gif)

If required, the command will ask you to select the **target format** of the epoch time (s, ms, ns).

![Convert Selection Option Sample](doc/Convert_Selection_Option_Sample.gif)

### Current Time

In addition, you can also get the current time as **epoch** or **ISO 8601** format.

![Now as ISO 8601 Local](doc/Get_Now_Local_Sample.gif)

### Hover Preview

When you hover over a number the extension shows you the converted **UTC time** of that number and which **unit** was used for the conversion.

![Hover Sample](doc/Hover_Sample.gif)

## Command Overview

* `timing.epochToIsoUtc`: Convert epoch time to ISO 8601 format (UTC)
* `timing.epochToIsoLocal`: Convert epoch time to ISO 8601 format (Local)
* `timing.isoRfcToEpoch`: Convert ISO 8601 or RFC 2822 time to selected epoch format
* `timing.nowAsIsoUtc`: Get current time as ISO 8601 UTC format
* `timing.nowAsIsoLocal`: Get current time as ISO 8601 Local format
* `timing.nowAsEpoch`: Get current time as epoch format
* `timing.convertTime`: **DEPRECATED**, use `timing.epochToIsoUtc` instead

## Contribution
If you found a bug or are missing a feature do not hesitate to [file an issue](https://github.com/HaaLeo/vscode-timing/issues/new).  
Pull Requests are welcome!
