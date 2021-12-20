"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var awaitChainInSeries = function (chainLinks) {
    var finalDone;
    var priorChain = function () { return finalDone(); };
    var aChain = {
        addLink: function (linkToAdd) {
            var fn = priorChain;
            priorChain = function () { return linkToAdd(fn); };
        },
        await: function (doneCb) {
            finalDone = doneCb;
            priorChain();
            aChain.await = function () {
                throw new Error('already awaited');
            };
            aChain.addLink = function () {
                throw new Error('already awaited');
            };
        },
    };
    if (chainLinks)
        chainLinks.forEach(function (link) { return aChain.addLink(link); });
    return aChain;
};
exports.default = awaitChainInSeries;
