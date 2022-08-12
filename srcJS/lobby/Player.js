"use strict";
exports.__esModule = true;
var Player = (function () {
    function Player(id, lobbyId, socketWrap) {
        this.online = true;
        this.returning = false;
        this.id = id;
        this.lobbyId = lobbyId;
        this.socketWrap = socketWrap;
    }
    return Player;
}());
exports["default"] = Player;
