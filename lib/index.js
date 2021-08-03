'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var classNameRegex = /className=\"([0-9a-zA-Z\-\_\s\/]*)\"/gi;
var classNamesRegex = /classnames\(((.|\s)*?)\)/img;
var stringBetweenQuotesRegex = /(["'])(\\?.)*?\1/img;
var ignore = [];

function loader(source, inputSourceMap) {
    var prefix = getQueryParameterByName('prefix', this.query);

    if (prefix) {
        // Process classes with classnames module
        var classNamesMatches = source.match(classNamesRegex);

        if (classNamesMatches) {
            classNamesMatches.map(function (item) {
                item = item.replace(/\s+/g, '');

                var classNamesMatchesStrings = item.match(stringBetweenQuotesRegex);

                if (classNamesMatchesStrings) {
                    classNamesMatchesStrings.map(function (item) {
                        source = source.replace(new RegExp(item, 'g'), function (text) {
                            var replaceResult = "'" + prefix + '-' + text.replace(/['"]/g, '') + "'";
                            ignore.push(replaceResult);
                            return replaceResult;
                        });
                    });
                }
            });
        }

        source = source.replace(classNameRegex, function (text, classNames) {
            var attr = text.match(/classname/ig);
            if (attr && attr[0]) {
                attr = attr[0];
            } else {
                attr = 'className';
            }

            var prefixedClassNames = classNames.split(' ').map(function (className) {
                if (ignoreClassName(className)) {
                    return className;
                }

                return prefix + '-' + className;
            }).join(' ');

            return attr + '=\'' + prefixedClassNames + '\'';
        });
    }

    this.callback(null, source, inputSourceMap);
}

function ignoreClassName(className) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return classMatchesTest(className, options.ignore) || className.trim().length === 0 || /^[A-Z-]/.test(className) || ignore.findIndex(function (item) {
        return className === item;
    }) >= 0;
}

function classMatchesTest(className, ignore) {
    if (!ignore) return false;

    className = className.trim();

    if (ignore instanceof RegExp) return ignore.exec(className);

    if (Array.isArray(ignore)) {
        return ignore.some(function (test) {
            if (test instanceof RegExp) return test.exec(className);

            return className === test;
        });
    }

    return className === ignore;
}

function getQueryParameterByName(name, query) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(query);
    if (!results) return null;
    if (!results[2]) return '';
    return results[2].replace(/\+/g, " ");
}

exports.default = loader;
module.exports = exports['default'];