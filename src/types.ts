/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

interface ICustomFormat {
    format: string;
    description?: string;
    detail?: string;
}

interface ICustomHoverFormat {
    customFormat: string;
    name?: string;
    localize?: boolean;
}
