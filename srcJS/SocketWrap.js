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
                console.log(args);
                _this.socket.emit(event, args);
            };
        }
        else {
            this.emit = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var message = [];
                for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                    var word = args_1[_a];
                    message.push(word);
                }
                _this.savedMessages.push(message);
            };
        }
    }
    SocketWrap.prototype.clearSavedMessages = function () {
        this.savedMessages = [];
    };
    return SocketWrap;
}());
exports["default"] = SocketWrap;
