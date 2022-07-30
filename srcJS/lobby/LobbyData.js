"use strict";
exports.__esModule = true;
var LobbyData = (function () {
    function LobbyData() {
        this.players = new Set();
        this.inGame = false;
        this.transition = false;
    }
    return LobbyData;
}());
exports["default"] = LobbyData;
