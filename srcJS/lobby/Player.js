"use strict";
exports.__esModule = true;
var Player = (function () {
    function Player(lobbyId, socket) {
        this.online = true;
        this.lobbyId = lobbyId;
        this.socket = socket;
    }
    return Player;
}());
exports["default"] = Player;
