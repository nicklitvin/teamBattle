"use strict";
exports.__esModule = true;
var Game_1 = require("./Game");
var GameManagerData_1 = require("./GameManagerData");
var GameManager = (function () {
    function GameManager(io) {
    }
    GameManager.startGame = function (lobbyId) {
        this._data.games[lobbyId] = new Game_1["default"]();
    };
    GameManager._data = new GameManagerData_1["default"]();
    return GameManager;
}());
exports["default"] = GameManager;
