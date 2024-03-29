/*!
 * ---------------------------------------------------------------------------------------------
 *  Copyright (c) Leo Hanisch. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 * --------------------------------------------------------------------------------------------
 */

import * as path from 'path';

import { runTests } from 'vscode-test';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
async function main(): Promise<void> {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to the extension test runner script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './');

        const launchArgs = [path.resolve(__dirname, '../../src/test/testfiles')];

        // Download VS Code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to run tests');
        process.exit(1);
    }
}

void main();
