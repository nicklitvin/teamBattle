"use strict";
exports.__esModule = true;
var LobbyManagerData = (function () {
    function LobbyManagerData() {
        this.sockets = {};
        this.players = {};
        this.lobbies = {};
        this.lobbyIdLength = 6;
    }
    return LobbyManagerData;
}());
exports["default"] = LobbyManagerData;
