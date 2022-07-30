"use strict";
exports.__esModule = true;
var GameManager_1 = require("../game/GameManager");
var LobbyManagerData = (function () {
    function LobbyManagerData(io) {
        this.sockets = {};
        this.players = {};
        this.lobbies = {};
        this.lobbyIdLength = 6;
        this.gameManager = new GameManager_1["default"](io, this.players, this.lobbies);
    }
    return LobbyManagerData;
}());
exports["default"] = LobbyManagerData;
