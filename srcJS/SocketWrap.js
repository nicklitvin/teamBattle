"use strict";
exports.__esModule = true;
var SocketWrap = (function () {
    function SocketWrap(socket) {
        var _this = this;
        this.savedMessages = [];
        if (socket) {
            this.socket = socket;
            this.id = this.socket.id;
            this.emit = function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                _this.socket.emit(event, args);
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
