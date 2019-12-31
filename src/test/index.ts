'use strict';

import * as fs from 'fs';
import * as glob from 'glob';
import * as paths from 'path';

import { Instrumenter, createInstrumenter } from 'istanbul-lib-instrument';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createSourceMapStore, MapStore } from 'istanbul-lib-source-maps';
import { create } from 'istanbul-reports';
import { createContext } from 'istanbul-lib-report';
import { hookRequire, Transformer, TransformerOptions } from 'istanbul-lib-hook';
import * as Mocha from 'mocha';

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implement he method statically
// tslint:disable:no-var-requires
const tty = require('tty');
// tslint:enable:no-var-requires

if (!tty.getWindowSize) {
    tty.getWindowSize = (): number[] => {
        return [80, 75];
    };
}

function _mkDirIfExists(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function _readCoverOptions(testsRoot: string): ITestRunnerOptions {
    const coverConfigPath = paths.join(testsRoot, '..', '..', 'coverconfig.json');
    let coverConfig: ITestRunnerOptions;
    if (fs.existsSync(coverConfigPath)) {
        const configContent = fs.readFileSync(coverConfigPath, 'utf-8');
        coverConfig = JSON.parse(configContent);
    }
    return coverConfig;
}

function run(testsRoot, clb): any {
    // Enable source map support
    require('source-map-support').install();

    // Read configuration for the coverage file
    let coverageRunner: CoverageRunner = undefined
    const coverOptions: ITestRunnerOptions = _readCoverOptions(testsRoot);
    if (coverOptions && coverOptions.enabled) {
        // Setup coverage pre-test, including post-test hook to report
        coverageRunner = new CoverageRunner(coverOptions, testsRoot, clb);
        coverageRunner.setupCoverage();
    }

    // Glob test files
    glob('**/**.test.js', { cwd: testsRoot }, (error, files): any => {
        let mocha = new Mocha({
            ui: 'bdd',
            useColors: true,
            timeout: 3000,
            reporter: "mocha-multi-reporters",
            reporterOptions: {
                "reporterEnabled": "mocha-junit-reporter, spec",
                "mochaJunitReporterReporterOptions": {
                    "mochaFile": testsRoot + "/../../test-results.xml"
                }
            }
        });

        if (error) {
            return clb(error);
        }
        try {
            // Fill into Mocha
            files.forEach((f): Mocha => {
                return mocha.addFile(paths.join(testsRoot, f));
            });
            // Run the tests
            let failureCount = 0;

            mocha.run()
                .on('fail', (test, err): void => {
                    failureCount++;
                })
                .on('end', async (): Promise<void> => {
                    clb(undefined, failureCount);
                    await coverageRunner.reportCoverage();
                });
        } catch (error) {
            return clb(error);
        }
    });
}
exports.run = run;

interface ITestRunnerOptions {
    enabled?: boolean;
    relativeCoverageDir: string;
    relativeSourcePath: string;
    ignorePatterns: string[];
    includePid?: boolean;
    verbose?: boolean;
}

class CoverageRunner {

    private coverageVar: string = '$$cov_' + new Date().getTime() + '$$';
    private transformer: Transformer = undefined;
    private matchFn: any = undefined;
    private instrumenter: Instrumenter = undefined;
    private sourceRoot: string = undefined;
    private sourceMapStore: MapStore;

    constructor(private options: ITestRunnerOptions, private testsRoot: string, endRunCallback: any) {
        if (!options.relativeSourcePath) {
            return endRunCallback('Error - relativeSourcePath must be defined for code coverage to work');
        }
    }

    public setupCoverage(): void {
        // Set up Code Coverage, hooking require so that instrumented code is returned
        const self = this;
        self.sourceRoot = paths.join(self.testsRoot, self.options.relativeSourcePath);
        self.sourceMapStore = createSourceMapStore({ baseDir: self.sourceRoot, verbose: self.options.verbose })

        self.instrumenter = createInstrumenter({
            coverageVariable: self.coverageVar,
            produceSourceMap: true,
            sourceMapUrlCallback: self.sourceMapStore.registerURL.bind(self.sourceMapStore)
        });

        // Glob source files
        const srcFiles = glob.sync('**/**.js', {
            cwd: self.sourceRoot,
            ignore: self.options.ignorePatterns,
        });

        // Create a match function - taken from the run-with-cover.js in istanbul.
        const decache = require('decache');
        const fileMap = {};
        srcFiles.forEach((file) => {
            const fullPath = paths.join(self.sourceRoot, file);
            fileMap[fullPath] = true;

            // On Windows, extension is loaded pre-test hooks and this mean we lose
            // our chance to hook the Require call. In order to instrument the code
            // we have to decache the JS file so on next load it gets instrumented.
            // This doesn't impact tests, but is a concern if we had some integration
            // tests that relied on VSCode accessing our module since there could be
            // some shared global state that we lose.
            decache(fullPath);
        });

        self.matchFn = (file): boolean => fileMap[file];
        self.matchFn.files = Object.keys(fileMap);

        // Hook up to the Require function so that when this is called, if any of our source files
        // are required, the instrumented version is pulled in instead. These instrumented versions
        // write to a global coverage variable with hit counts whenever they are accessed
        self.transformer = (code: string, options: TransformerOptions) => {
            const transformFn = self.instrumenter.instrumentSync.bind(self.instrumenter);
            return transformFn(code, options.filename, false);
        }

        const hookOpts = { verbose: self.options.verbose, extensions: ['.js'] };
        hookRequire(self.matchFn, self.transformer, hookOpts);

        // initialize the global variable to stop mocha from complaining about leaks
        global[self.coverageVar] = {};
    }

    /**
     * Writes a coverage report.
     * Note that as this is called in the process exit callback, all calls must be synchronous.
     *
     * @returns {void}
     *
     * @memberOf CoverageRunner
     */
    public async reportCoverage(): Promise<void> {
        const self = this;
        // unhookRunInContext();
        let cov: any;
        if (typeof global[self.coverageVar] === 'undefined' || Object.keys(global[self.coverageVar]).length === 0) {
            console.error('No coverage information was collected, exit without writing coverage information');
            return;
        } else {
            cov = global[self.coverageVar];
        }

        // TODO consider putting this under a conditional flag
        // Files that are not touched by code ran by the test runner is manually instrumented, to
        // illustrate the missing coverage.
        self.matchFn.files.forEach((file: string) => {
            if (!cov[file]) {
                self.transformer(fs.readFileSync(file, 'utf-8'), { filename: file });

                // When instrumenting the code,
                // istanbul will give each FunctionDeclaration a value of 1 in coverState.s,
                // presumably to compensate for function hoisting.
                // We need to reset this, as the function was not hoisted,
                // as it was never loaded.
                Object.keys(self.instrumenter.fileCoverage.s).forEach((key) => {
                    self.instrumenter.fileCoverage.s[key] = 0;
                });

                cov[file] = self.instrumenter.fileCoverage;
            }
        });

        // TODO Allow config of reporting directory with
        const reportingDir = paths.join(self.testsRoot, self.options.relativeCoverageDir);
        const includePid = self.options.includePid;
        const pidExt = includePid ? ('-' + process.pid) : '';
        const coverageFile = paths.resolve(reportingDir, 'coverage' + pidExt + '.json');

        // yes, do this again since some test runners could clean the dir initially created
        _mkDirIfExists(reportingDir);
        fs.writeFileSync(coverageFile, JSON.stringify(cov), 'utf8');

        const map = createCoverageMap(cov)
        // @ts-ignore
        const transformedMap = await self.sourceMapStore.transformCoverage(map);
        // @ts-ignore
        const context = createContext({ dir: reportingDir, coverageMap: transformedMap });

        const report = create('cobertura', { projectRoot: self.sourceRoot });
        // @ts-ignore
        report.execute(context)
    }
}
