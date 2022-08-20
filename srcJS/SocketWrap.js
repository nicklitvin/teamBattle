"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var SocketWrap = (function () {
    function SocketWrap(socket) {
        var _this = this;
        this.savedMessages = [];
        if (socket) {
            this.socket = socket;
            this.id = this.socket.id;
            this.emit = function (event) {
                var _a;
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                (_a = _this.socket).emit.apply(_a, __spreadArray([event], args, false));
            };
        }
        else {
            this.emit = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.savedMessages.push(args);
            };
        }
    }
    SocketWrap.prototype.clearSavedMessages = function () {
        this.savedMessages = [];
    };
    return SocketWrap;
}());
exports["default"] = SocketWrap;
