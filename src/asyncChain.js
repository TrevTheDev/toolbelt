"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// noinspection JSUnusedGlobalSymbols
Object.defineProperty(exports, "__esModule", { value: true });
var asyncChain = function (defaultElementHandlerCb, chainDoneCb, chainEmptyCb, processOnlyAfterPreviousElementDone) {
    if (processOnlyAfterPreviousElementDone === void 0) { processOnlyAfterPreviousElementDone = false; }
    var currentItemIndex = 0;
    var autoItemIndex = 0;
    var elementHandlerCb2ToElementHandlerCb = function (elementHandlerCb2) { return function (element, awaitPreviousResult, index) {
        awaitPreviousResult(function (previousResult, elementDoneCb) {
            elementHandlerCb2(element, elementDoneCb, previousResult, index);
        });
    }; };
    var defaultElementHandlerCb_ = processOnlyAfterPreviousElementDone
        ? elementHandlerCb2ToElementHandlerCb(defaultElementHandlerCb)
        : defaultElementHandlerCb;
    var queue = {};
    var resultsAwaitingPreviousResultCb = { 0: undefined };
    var previousResultCbsAwaitingResult = {};
    var done = false;
    var chainDone = function (result) {
        done = true;
        if (Object.keys(queue).length === 0
            && Object.keys(resultsAwaitingPreviousResultCb).length === 0
            && Object.keys(previousResultCbsAwaitingResult).length === 0) {
            if (chainDoneCb)
                setImmediate(function () { return chainDoneCb(result); });
        }
        else
            throw new Error('done called, but queue is not empty');
    };
    var processNextItem = function () {
        setImmediate(function () {
            if (currentItemIndex in queue) {
                var idx_1 = currentItemIndex;
                var awaitPreviousResult = function (previousResultCb) {
                    var elementDone = function (result, lastItem) {
                        if (lastItem === void 0) { lastItem = false; }
                        if (lastItem || done)
                            chainDone(result);
                        else {
                            if (previousResultCbsAwaitingResult[idx_1 + 1] !== undefined) {
                                var _a = previousResultCbsAwaitingResult[idx_1 + 1], previousResultCb_1 = _a.previousResultCb, elementDone_1 = _a.elementDone;
                                setImmediate(function () { return previousResultCb_1(result, elementDone_1); });
                                delete previousResultCbsAwaitingResult[idx_1 + 1];
                            }
                            else
                                resultsAwaitingPreviousResultCb[idx_1 + 1] = result;
                            if (processOnlyAfterPreviousElementDone)
                                currentItemIndex += 1;
                            processNextItem();
                        }
                    };
                    if (idx_1 in resultsAwaitingPreviousResultCb) {
                        var result_1 = resultsAwaitingPreviousResultCb[idx_1];
                        setImmediate(function () { return previousResultCb(result_1, elementDone); });
                        delete resultsAwaitingPreviousResultCb[idx_1];
                    }
                    else
                        previousResultCbsAwaitingResult[idx_1] = { previousResultCb: previousResultCb, elementDone: elementDone };
                };
                if (!done) {
                    var _a = queue[currentItemIndex], element = _a.element, elementHandlerCb = _a.elementHandlerCb;
                    delete queue[currentItemIndex];
                    elementHandlerCb(element, awaitPreviousResult, currentItemIndex);
                    if (!processOnlyAfterPreviousElementDone)
                        currentItemIndex += 1;
                }
            }
            else if (chainEmptyCb && Object.keys(queue).length === 0)
                chainEmptyCb();
        });
    };
    return {
        add: function (element, index, elementHandlerCb) {
            var key = index === undefined ? autoItemIndex : index;
            autoItemIndex += 1;
            if (done)
                throw new Error('asyncChain is marked as done, meaning no elements can be added');
            if (queue[key])
                throw new Error("element with index : ".concat(index, " already added"));
            var elementHandlerCb_;
            if (!elementHandlerCb && !defaultElementHandlerCb)
                throw new Error('no elementHandlerCb provided and one is required');
            if (!elementHandlerCb)
                elementHandlerCb_ = defaultElementHandlerCb_;
            else {
                elementHandlerCb_ = processOnlyAfterPreviousElementDone
                    ? elementHandlerCb2ToElementHandlerCb(elementHandlerCb)
                    : elementHandlerCb;
            }
            queue[key] = {
                element: element,
                elementHandlerCb: elementHandlerCb_,
            };
            processNextItem();
        },
        done: function (result) { return chainDone(result); },
        get queue() {
            return queue;
        },
        get queueLength() {
            return Object.keys(queue).length;
        },
        get resultsAwaitingPreviousResultCbLength() {
            return Object.keys(resultsAwaitingPreviousResultCb).length;
        },
        get previousResultCbsAwaitingResultLength() {
            return Object.keys(previousResultCbsAwaitingResult).length;
        },
        get length() {
            return autoItemIndex;
        },
    };
};
if (typeof Array.prototype.asyncChain !== 'function') {
    // eslint-disable-next-line func-names,no-extend-native
    Array.prototype.asyncChain = function (elementHandlerCb, chainDoneCb) {
        var aChain = asyncChain(elementHandlerCb, chainDoneCb);
        var length = this.length - 1;
        this.forEach(function (element, index) {
            if (index === length) {
                aChain.add(element, undefined, function (elementA, awaitPreviousResult, indexA) {
                    elementHandlerCb(elementA, function (previousResultCb) {
                        awaitPreviousResult(function (previousResult, elementDone) {
                            previousResultCb(previousResult, function (result) { return elementDone(result, true); });
                        });
                    }, indexA);
                });
            }
            else
                aChain.add(element);
        });
    };
}
exports.default = asyncChain;
