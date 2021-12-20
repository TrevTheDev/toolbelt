"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line func-names
var reverseForEach = function (callbackFn) {
    var i;
    var len = this.length - 1;
    for (i = len; i >= 0; i -= 1)
        callbackFn(this[i], i, this);
};
if (!('reverseForEach' in Array.prototype)) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.reverseForEach = reverseForEach;
}
exports.default = reverseForEach;
