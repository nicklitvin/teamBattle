"use strict";
exports.__esModule = true;
var Game = (function () {
    function Game() {
        this.players = {};
        this.ships = {};
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        this.players[playerId] = shipId;
    };
    Game.prototype.addShip = function (shipId) {
        this.ships[shipId] = new Ship(shipId);
    };
    return Game;
}());
exports["default"] = Game;
