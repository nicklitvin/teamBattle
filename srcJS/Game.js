"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
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
    Game.prototype.addShip = function (shipId, position) {
        this.ships[shipId] = new Ship_1["default"](position);
        this.ships[shipId].setId(shipId);
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
    Game.prototype.update = function () {
        for (var _i = 0, _a = Object.values(this.ships); _i < _a.length; _i++) {
            var ship = _a[_i];
            ship.move();
        }
        for (var _b = 0, _c = Object.values(this.ships); _b < _c.length; _b++) {
            var ship = _c[_b];
            for (var _d = 0, _e = Object.values(this.ships); _d < _e.length; _d++) {
                var enemy = _e[_d];
                if (ship.id == enemy.id)
                    continue;
                for (var _f = 0, _g = Object.entries(enemy.shots); _f < _g.length; _f++) {
                    var shotEntry = _g[_f];
                    var shooter = shotEntry[0];
                    var shot = shotEntry[1];
                    if (MyMath_1["default"].doCirclesIntersect(shot, ship)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);
                        if (!ship.health) {
                            delete this.ships[ship.id];
                        }
                    }
                }
            }
        }
    };
    return Game;
}());
exports["default"] = Game;
