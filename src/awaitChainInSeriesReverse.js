"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reverseForEach_1 = require("./reverseForEach");
if (!('reverseForEach' in Array.prototype)) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.reverseForEach = reverseForEach_1.default;
}
var awaitChainInSeriesReverse = function (chainLinks) {
    var finalDone;
    var priorChain = function () { return finalDone(); };
    var addLink = function (linkToAdd) {
        var fn = priorChain;
        priorChain = function () { return linkToAdd(fn); };
    };
    return function (doneCb) {
        finalDone = doneCb;
        chainLinks.reverseForEach(function (link) { return addLink(link); });
        priorChain();
    };
};
exports.default = awaitChainInSeriesReverse;
