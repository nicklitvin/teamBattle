"use strict";
exports.__esModule = true;
var Ship_1 = require("./Ship");
var Game = (function () {
    function Game() {
        this.players = {};
        this.ships = {};
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        if (Object.keys(this.ships).includes(shipId)) {
            this.players[playerId] = shipId;
        }
        else {
        }
    };
    Game.prototype.addShip = function (shipId) {
        this.ships[shipId] = new Ship_1["default"]();
    };
    Game.prototype.processPlayerInput = function (playerId, args) {
        try {
            var shipId = this.players[playerId];
            var ship = this.ships[shipId];
            ship.processPlayerInput(playerId, args);
        }
        catch (_a) {
        }
    };
    return Game;
}());
exports["default"] = Game;
