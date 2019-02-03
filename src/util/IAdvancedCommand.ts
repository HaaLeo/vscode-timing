/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

'use strict';

interface IAdvancedCommand {
    baseCommandId: string;
    id: string;
    name?: string;
    sourceUnit?: string;
    targetUnit?: string;
    sourceFormat?: string;
    targetFormat?: string;
}
