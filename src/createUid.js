"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createUid = function (length) {
    if (length === void 0) { length = 20; }
    return Array.from({ length: length }, function () { return Math.random().toString(36)[2]; }).join('');
};
exports.default = createUid;
