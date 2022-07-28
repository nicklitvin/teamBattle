"use strict";
exports.__esModule = true;
var LobbyData_1 = require("./LobbyData");
var Lobby = (function () {
    function Lobby(id) {
        this._data = new LobbyData_1["default"]();
        this._data.id = id;
        this._data.redirect = "lobby?r=".concat(id);
    }
    Lobby.prototype.getData = function () {
        return this._data;
    };
    Lobby.prototype.addPlayer = function (id) {
        this._data.players.push(id);
    };
    return Lobby;
}());
exports["default"] = Lobby;
