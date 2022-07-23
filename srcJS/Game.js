"use strict";
exports.__esModule = true;
var GameData_1 = require("./GameData");
var MyMath_1 = require("./MyMath");
var Ship_1 = require("./Ship");
var Game = (function () {
    function Game() {
        this._gameData = new GameData_1["default"]();
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        if (Object.keys(this._gameData.ships).includes(shipId)) {
            this._gameData.players[playerId] = shipId;
        }
        else {
        }
    };
    Game.prototype.addShip = function (shipId, position) {
        this._gameData.ships[shipId] = new Ship_1["default"](position);
        this._gameData.ships[shipId].getData().id = shipId;
    };
    Game.prototype.processPlayerInput = function (playerId, args) {
        try {
            var shipId = this._gameData.players[playerId];
            var ship = this._gameData.ships[shipId];
            ship.processPlayerInput(playerId, args);
        }
        catch (_a) {
        }
    };
    Game.prototype.update = function () {
        for (var _i = 0, _a = Object.values(this._gameData.ships); _i < _a.length; _i++) {
            var ship = _a[_i];
            ship.move();
        }
        for (var _b = 0, _c = Object.values(this._gameData.ships); _b < _c.length; _b++) {
            var ship = _c[_b];
            for (var _d = 0, _e = Object.values(this._gameData.ships); _d < _e.length; _d++) {
                var enemy = _e[_d];
                var shipData = ship.getData();
                var enemyData = enemy.getData();
                if (shipData.id == enemyData.id)
                    continue;
                for (var _f = 0, _g = Object.entries(enemyData.shotsSent); _f < _g.length; _f++) {
                    var shotEntry = _g[_f];
                    var shooter = shotEntry[0];
                    var shot = shotEntry[1];
                    var shipProjectileData = ship.getProjectileData();
                    if (MyMath_1["default"].doCirclesIntersect(shot, shipProjectileData)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);
                        if (!shipData.health) {
                            delete this._gameData.ships[shipData.id];
                            break;
                        }
                    }
                }
            }
        }
    };
    Game.prototype.getVisibleProjectiles = function (ship) {
        var list = [];
        var shipData = ship.getData();
        for (var _i = 0, _a = Object.values(this._gameData.ships); _i < _a.length; _i++) {
            var enemy = _a[_i];
            var enemyData = enemy.getData();
            if (MyMath_1["default"].getDistanceBetween(shipData, enemyData) <= shipData.vision) {
                list.push(shipData);
            }
            for (var _b = 0, _c = Object.values(enemyData.shotsSent); _b < _c.length; _b++) {
                var shot = _c[_b];
                if (MyMath_1["default"].getDistanceBetween(shipData, shot) <= shipData.vision) {
                    list.push(shot);
                }
            }
            for (var _d = 0, _e = Object.values(enemyData.scoutsSent); _d < _e.length; _d++) {
                var shot = _e[_d];
                if (MyMath_1["default"].getDistanceBetween(shipData, shot) <= shipData.vision) {
                    list.push(shot);
                }
            }
        }
        return list;
    };
    Game.prototype.getData = function () { return this._gameData; };
    return Game;
}());
exports["default"] = Game;
