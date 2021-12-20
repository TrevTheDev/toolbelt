"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// returns a function that is only executed on the first call,
// irrespective of how many times it is called.
var runFunctionOnlyOnce = function () {
    var called = false;
    // eslint-disable-next-line no-return-assign
    return function (fn) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return called || ((called = true) && fn.apply(void 0, args));
    }; };
};
exports.default = runFunctionOnlyOnce;
