"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Ship_1 = require("./Ship");
var Game = (function () {
    function Game() {
        this._players = {};
        this._ships = {};
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        if (Object.keys(this._ships).includes(shipId)) {
            this._players[playerId] = shipId;
        }
        else {
        }
    };
    Game.prototype.addShip = function (shipId, position) {
        var ship = new Ship_1["default"](position);
        ship.setId(shipId);
        this._ships[shipId] = ship;
    };
    Game.prototype.processPlayerInput = function (playerId, args) {
        try {
            var shipId = this._players[playerId];
            var ship = this._ships[shipId];
            ship.processPlayerInput(playerId, args);
        }
        catch (_a) {
        }
    };
    Game.prototype.update = function () {
        for (var _i = 0, _a = Object.values(this._ships); _i < _a.length; _i++) {
            var ship = _a[_i];
            ship.move();
        }
        for (var _b = 0, _c = Object.values(this._ships); _b < _c.length; _b++) {
            var ship = _c[_b];
            for (var _d = 0, _e = Object.values(this._ships); _d < _e.length; _d++) {
                var enemy = _e[_d];
                if (ship._id == enemy._id)
                    continue;
                for (var _f = 0, _g = Object.entries(enemy._shotsSent); _f < _g.length; _f++) {
                    var shotEntry = _g[_f];
                    var shooter = shotEntry[0];
                    var shot = shotEntry[1];
                    if (MyMath_1["default"].doCirclesIntersect(shot, ship)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);
                        if (ship._health == 0) {
                            delete this._ships[ship._id];
                            break;
                        }
                    }
                }
            }
        }
    };
    Game.prototype.getVisibleProjectiles = function (ship) {
        var list = [];
        for (var _i = 0, _a = Object.values(this._ships); _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (MyMath_1["default"].getDistanceBetween(ship, enemy) <= ship._vision) {
                list.push(ship);
            }
            for (var _b = 0, _c = Object.values(enemy._shotsSent); _b < _c.length; _b++) {
                var shot = _c[_b];
                if (MyMath_1["default"].getDistanceBetween(ship, shot) <= ship._vision) {
                    list.push(shot);
                }
            }
            for (var _d = 0, _e = Object.values(enemy._scoutsSent); _d < _e.length; _d++) {
                var shot = _e[_d];
                if (MyMath_1["default"].getDistanceBetween(ship, shot) <= ship._vision) {
                    list.push(shot);
                }
            }
        }
        return list;
    };
    return Game;
}());
exports["default"] = Game;
