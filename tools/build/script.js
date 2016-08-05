// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const path = require('path');
const source = require('vinyl-source-stream');

const { getSuffixedCommandName } = require('../platform');
const { spawnChildProcess, assertReturnCode } = require('../spawn');

/**
 *  @param  {string}    srcDir
 *  @param  {string}    distDir
 *  @param  {string}    binName
 *
 *  @returns    {NodeJS.ReadWriteStream}
 */
function buildLegacyLib(srcDir, distDir, binName) {
    return gulp.src(srcDir)
        .pipe(concat(binName))
        .pipe(uglify({
            compress: true,
            preserveComments: 'license',
        }))
        .pipe(gulp.dest(distDir));
}

/**
 *  @param  {string}    cwd
 *  @param  {string}    nodeModDir
 *  @param  {string}    projectDir
 *  @returns    {Promise<void>}
 */
function compileTypeScript(cwd, nodeModDir, projectDir) {
    const command = getSuffixedCommandName('tsc');
    const bin = path.resolve(nodeModDir, '.bin', command);
    const args = [
        '--project',
        projectDir,
    ];
    const option = {
        cwd,
        stdio: 'inherit',
    };
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

/**
 *  @param  {string}    entryPoint
 *  @param  {string}    distDir
 *  @param  {string}    binName
 *  @param  {boolean}   isRelease
 *
 *  @returns    {NodeJS.ReadableStream}
 */
function runLinkerForClient(entryPoint, distDir, binName, isRelease) {
    const option = {
        insertGlobals: false,
        debug: !isRelease,
        extensions: ['.jsx'],
    };

    const babelPresets = [
    ];

    let babelPlugins = [
        // For our target browsers, we need not some transforms.
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-classes',
        'transform-es2015-computed-properties',
        'check-es2015-constants',
        'transform-es2015-destructuring',
        'transform-es2015-function-name',
        'transform-es2015-modules-commonjs',
        'transform-es2015-object-super',
        'transform-es2015-parameters',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-unicode-regex',
        'transform-regenerator',

        // for React
        'syntax-jsx',
        'transform-react-jsx',

        // some utilitis
        'transform-inline-environment-variables',
        'transform-node-env-inline',
    ];
    if (isRelease) {
        babelPlugins = babelPlugins.concat([
            'transform-react-constant-elements',
            'transform-react-inline-elements',
        ]);
    }
    else {
        babelPlugins = babelPlugins.concat([
            'transform-react-jsx-source',
        ]);
    }

    const babel = babelify.configure({
        presets: babelPresets,
        plugins: babelPlugins,
    });

    return browserify(entryPoint, option)
        .transform(babel)
        .bundle()
        .pipe(source(binName))
        .pipe(gulp.dest(distDir));
}


/**
 *  @param  {string}    cwd
 *  @param  {string}    npmModDir
 *  @param  {string}    srcDir
 *  @param  {string}    distDir
 *  @param  {boolean}   isRelease
 *  @returns    {Promise<void>}
 */
function compileScriptForServer(cwd, npmModDir, srcDir, distDir, isRelease) {
    const babelPresets = [
    ];

    let babelPlugins = [
        // For Node.js v6~, we need not some transforms.
        'transform-es2015-modules-commonjs',

        // for React
        'syntax-jsx',
        'transform-react-jsx',
    ];
    if (isRelease) {
        babelPlugins = babelPlugins.concat([
            'transform-react-constant-elements',
            'transform-react-inline-elements',
        ]);
    }
    else {
        babelPlugins = babelPlugins.concat([
            'transform-react-jsx-source',
        ]);
    }

    const args = [
        srcDir,
        '--presets', babelPresets.join(','),
        '--plugins', babelPlugins.join(','),
        '--source-maps', 'inline',
        '--extensions', '.js,.jsx',
        '--out-dir', distDir,
    ];

    const option = {
        cwd,
        stdio: 'inherit',
    };

    const command = getSuffixedCommandName('babel');
    const bin = path.resolve(npmModDir, '.bin', command);
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

module.exports = {
    buildLegacyLib,
    compileTypeScript,
    runLinkerForClient,
    compileScriptForServer,
};
