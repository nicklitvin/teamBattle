"use strict";
exports.__esModule = true;
var DrawingInstruction_1 = require("../clientModules/DrawingInstruction");
var MyMath_1 = require("../clientModules/MyMath");
var Position_1 = require("../clientModules/Position");
var Ship_1 = require("./Ship");
var Game = (function () {
    function Game() {
        this._players = {};
        this._ships = {};
        this._defaultShipNumber = 4;
        this._drawingInstructions = {};
        this._visionColor = "grey";
        this._enemyColor = "black";
    }
    Game.prototype.addPlayer = function (playerId, shipId) {
        this._creationTime = Date.now();
        if (Object.keys(this._ships).includes(shipId)) {
            this._players[playerId] = shipId;
        }
        else {
        }
    };
    Game.prototype.addShip = function (shipId, position, color) {
        var ship = new Ship_1["default"](position);
        ship.setId(shipId);
        if (color)
            ship.setColor(color);
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
                            if (Object.keys(this._ships).length == 1) {
                                this.updateWinnerText();
                                return;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            }
        }
    };
    Game.prototype.updateWinnerText = function () {
        var shipId = Object.keys(this._ships)[0];
        this._winnerText = "Ship ".concat(shipId, " is the winner");
    };
    Game.prototype.updateDrawingInstructions = function () {
        for (var _i = 0, _a = Object.keys(this._ships); _i < _a.length; _i++) {
            var shipId = _a[_i];
            var ship = this._ships[shipId];
            var instructions = [];
            var shipTarget = ship._target || ship._position.copy();
            var shipVision = {
                _position: ship._position,
                _target: shipTarget,
                _radius: ship._vision,
                _speed: ship._speed
            };
            var shipVisionInstruction = new DrawingInstruction_1["default"](shipVision, this._visionColor);
            instructions.push(shipVisionInstruction);
            for (var _b = 0, _c = Object.values(ship._scoutsSent); _b < _c.length; _b++) {
                var scout = _c[_b];
                var scoutVision = {
                    _position: scout._position,
                    _target: scout._target,
                    _radius: ship._vision,
                    _speed: scout._speed
                };
                var instruction = new DrawingInstruction_1["default"](scoutVision, this._visionColor);
                instructions.push(instruction);
            }
            var shipProjectile = {
                _position: ship._position,
                _target: shipTarget,
                _radius: ship._radius,
                _speed: ship._speed
            };
            var shipInstruction = new DrawingInstruction_1["default"](shipProjectile, ship._color);
            instructions.push(shipInstruction);
            for (var _d = 0, _e = Object.values(ship._scoutsSent); _d < _e.length; _d++) {
                var scout = _e[_d];
                var scoutInstruction = new DrawingInstruction_1["default"](scout, ship._color);
                instructions.push(scoutInstruction);
            }
            for (var _f = 0, _g = Object.values(ship._shotsSent); _f < _g.length; _f++) {
                var shot = _g[_f];
                var shotInstruction = new DrawingInstruction_1["default"](shot, ship._color);
                if (MyMath_1["default"].getDistanceBetween(shot, ship) < ship._vision + shot._radius) {
                    instructions.push(shotInstruction);
                }
                else {
                    for (var _h = 0, _j = Object.values(ship._scoutsSent); _h < _j.length; _h++) {
                        var scout = _j[_h];
                        if (MyMath_1["default"].getDistanceBetween(shot, scout) < ship._vision + shot._radius) {
                            instructions.push(shotInstruction);
                            break;
                        }
                    }
                }
            }
            var enemies = this.getVisibleEnemyProjectiles(ship);
            for (var _k = 0, enemies_1 = enemies; _k < enemies_1.length; _k++) {
                var enemy = enemies_1[_k];
                var enemyInstruction = new DrawingInstruction_1["default"](enemy, this._enemyColor);
                instructions.push(enemyInstruction);
            }
            this._drawingInstructions[shipId] = instructions;
        }
    };
    Game.prototype.getVisibleEnemyProjectiles = function (ship) {
        var list = [];
        for (var _i = 0, _a = Object.values(this._ships); _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (ship._id == enemy._id)
                continue;
            if (MyMath_1["default"].getDistanceBetween(ship, enemy) < ship._vision + enemy._radius) {
                list.push(ship);
            }
            for (var _b = 0, _c = Object.values(enemy._shotsSent).concat(Object.values(enemy._scoutsSent)); _b < _c.length; _b++) {
                var thing = _c[_b];
                if (MyMath_1["default"].getDistanceBetween(ship, thing) < ship._vision + thing._radius) {
                    list.push(thing);
                }
            }
        }
        return list;
    };
    Game.prototype.makeDefaultShips = function () {
        var testShip = new Ship_1["default"]();
        var position0 = new Position_1["default"](testShip._radius, testShip._radius);
        var position1 = new Position_1["default"](testShip._radius, Game._mapHeight - testShip._radius);
        var position2 = new Position_1["default"](Game._mapWidth - testShip._radius, testShip._radius);
        var position3 = new Position_1["default"](Game._mapWidth - testShip._radius, Game._mapHeight - testShip._radius);
        this.addShip("0", position0);
        this.addShip("1", position1);
        this.addShip("2", position2);
        this.addShip("3", position3);
    };
    Game.prototype.deleteEmptyShips = function () {
        var occupiedShips = Object.values(this._players);
        var shipIds = Object.keys(this._ships);
        for (var _i = 0, shipIds_1 = shipIds; _i < shipIds_1.length; _i++) {
            var shipId = shipIds_1[_i];
            if (!occupiedShips.includes(shipId)) {
                delete this._ships[shipId];
            }
        }
    };
    Game.prototype.isGameOver = function () {
        return Object.keys(this._ships).length <= 1;
    };
    Game._mapWidth = 12;
    Game._mapHeight = 9;
    return Game;
}());
exports["default"] = Game;
