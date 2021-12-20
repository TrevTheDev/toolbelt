"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var awaitCallbacksInParallel = function (cbArray) {
    var finalDone;
    var arrayLength;
    var i = 0;
    var addLink = function (linkToAdd) {
        linkToAdd(function () {
            i += 1;
            if (i === arrayLength)
                finalDone();
        });
    };
    return function (doneCb) {
        arrayLength = cbArray.length;
        finalDone = doneCb;
        cbArray.forEach(function (link) { return addLink(link); });
    };
};
exports.default = awaitCallbacksInParallel;
