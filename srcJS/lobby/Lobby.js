"use strict";
exports.__esModule = true;
var Lobby = (function () {
    function Lobby(id) {
        this._players = new Set();
        this._inGame = false;
        this._transition = false;
        this._id = id;
        this._redirectToLobby = "lobby?r=".concat(id);
        this._redirectToGame = "game?r=".concat(id);
    }
    Lobby.prototype.addPlayer = function (id) {
        if (this.getPlayerCount() == 0) {
            this._leader = id;
        }
        this._players.add(id);
        this.updateCountText();
    };
    Lobby.prototype.removePlayer = function (id) {
        this._players["delete"](id);
        if (this._leader == id && this.getPlayerCount() > 0) {
            var players = this._players.values();
            this._leader = players.next().value;
        }
        this.updateCountText();
    };
    Lobby.prototype.getPlayerCount = function () {
        return this._players.size;
    };
    Lobby.prototype.updateCountText = function () {
        this._countText = "Players in lobby: ".concat(this.getPlayerCount());
    };
    Lobby.prototype.switchToInGameStatus = function () {
        this._inGame = true;
        this._transition = true;
    };
    Lobby.prototype.endTransitionPhase = function () {
        this._transition = false;
    };
    Lobby.prototype.switchBackFromInGameStatus = function () {
        this._inGame = false;
    };
    Lobby.prototype.getPlayerList = function () {
        var list = [];
        this._players.forEach(function (id) { return list.push(String(id)); });
        return list;
    };
    return Lobby;
}());
exports["default"] = Lobby;
