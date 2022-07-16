"use strict";
exports.__esModule = true;
var Ship_1 = require("./Ship");
var Position_1 = require("./Position");
var Game = (function () {
    function Game() {
        this.players = {};
        this.ships = {};
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        this.players[playerId] = shipId;
    };
    Game.prototype.addShip = function (shipId) {
        this.ships[shipId] = new Ship_1["default"](shipId, new Position_1["default"](5, 5));
    };
    return Game;
}());
exports["default"] = Game;
