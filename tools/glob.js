// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const glob = require('glob');

/**
 *  @param  {Array<string>} srcList
 *      The array which includes a glob pattern string.
 *  @param  {Object=}  options
 *      The `glob`'s `options` argument.
 *  @return {Promise<Array<string>>}
 *      The array which includes a resolved file path string.
 */
function resolveGlobList(srcList, options) {
    if (!Array.isArray(srcList)) {
        throw new TypeError('resolveGlobList: the argument should be `Array<string>`.');
    }

    /** @type   {Array<Promise<Array<string>>>} */
    const srcs = srcList.map(function(pattern){
        return new Promise(function (resolve, reject) {
            glob(pattern, options, function (err, files){
                if (!!err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    });

    /** @type   {Promise<Array<string>>}    */
    const fileList = Promise.all(srcs).then(function(args){
        const list = args.reduce(function(a, b) {
            return a.concat(b);
        }, []);
        return list;
    });

    return fileList;
}

module.exports = {
    resolveGlobList,
};
