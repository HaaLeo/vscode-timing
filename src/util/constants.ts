/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

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

}

export { Constants };
