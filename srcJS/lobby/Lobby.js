"use strict";
exports.__esModule = true;
var LobbyData_1 = require("./LobbyData");
var Lobby = (function () {
    function Lobby(id) {
        this._data = new LobbyData_1["default"]();
        this._data.id = id;
        this._data.redirectToLobby = "lobby?r=".concat(id);
        this._data.redirectToGame = "game?r=".concat(id);
    }
    Lobby.prototype.getData = function () {
        return this._data;
    };
    Lobby.prototype.addPlayer = function (id) {
        if (this.getPlayerCount() == 0) {
            this._data.captain = id;
        }
        this._data.players.add(id);
        this.updateCountText();
    };
    Lobby.prototype.removePlayer = function (id) {
        this._data.players["delete"](id);
        if (this._data.captain == id && this.getPlayerCount() > 0) {
            var players = this._data.players.values();
            this._data.captain = players.next().value;
        }
        this.updateCountText();
    };
    Lobby.prototype.getPlayerCount = function () {
        return this._data.players.size;
    };
    Lobby.prototype.updateCountText = function () {
        this._data.countText = "Players in lobby: ".concat(this.getPlayerCount());
    };
    Lobby.prototype.switchToInGameStatus = function () {
        this._data.inGame = true;
        this._data.transition = true;
    };
    Lobby.prototype.endTransitionPhase = function () {
        this._data.transition = false;
    };
    Lobby.prototype.switchBackFromInGameStatus = function () {
        this._data.inGame = false;
    };
    return Lobby;
}());
exports["default"] = Lobby;
