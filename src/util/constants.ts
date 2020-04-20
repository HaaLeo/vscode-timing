/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

import * as tzIds from 'tz-ids/index.json';

class Constants {
    public static readonly MILLISECONDS = 'ms';
    public static readonly SECONDS = 's';
    public static readonly NANOSECONDS = 'ns';

    public static readonly EPOCHUNITS = [
        {
            label: Constants.SECONDS,
            detail: 'seconds'
        },
        {
            label: Constants.MILLISECONDS,
            detail: 'milliseconds'
        },
        {
            label: Constants.NANOSECONDS,
            detail: 'nanoseconds'
        }
    ];

    public static readonly TIMEZONES: string[] = tzIds;

    public static readonly UTCOFFSETS = [ // Source: https://en.wikipedia.org/wiki/List_of_UTC_time_offsets
        '-12:00',
        '-11:00',
        '-10:00',
        '-09:30',
        '-09:00',
        '-08:00',
        '-07:00',
        '-06:00',
        '-05:00',
        '-04:00',
        '-03:30',
        '-03:00',
        '-02:00',
        '-01:00',
        '+00:00',
        '+01:00',
        '+02:00',
        '+03:00',
        '+03:30',
        '+04:00',
        '+04:30',
        '+05:00',
        '+05:30',
        '+05:45',
        '+06:00',
        '+06:30',
        '+07:00',
        '+08:00',
        '+08:45',
        '+09:00',
        '+09:30',
        '+10:00',
        '+10:30',
        '+11:00',
        '+12:00',
        '+12:45',
        '+13:00',
        '+14:00'
    ];
}

export { Constants };
