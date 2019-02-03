/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

interface ICommandOptions {
    sourceFormat?: string;
    targetFormat?: string;
    sourceUnit?: 's' | 'ms' | 'ns';
    targetUnit?: 's' | 'ms' | 'ns';
}

export { ICommandOptions };
