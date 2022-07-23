"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position_1 = require("./Position");
var ShipData_1 = require("./ShipData");
var Shot_1 = require("./Shot");
var Ship = (function () {
    function Ship(position) {
        if (position === void 0) { position = new Position_1["default"](1, 1); }
        this._data = new ShipData_1["default"]();
        this._mapWidth = 16;
        this._mapHeight = 9;
        this._data.position = position.copy();
        this._data.target = position.copy();
    }
    Ship.prototype.setTarget = function (newTarget) {
        newTarget.x = Math.max(this._data.radius, newTarget.x);
        newTarget.x = Math.min(this._mapWidth - this._data.radius, newTarget.x);
        newTarget.y = Math.max(this._data.radius, newTarget.y);
        newTarget.y = Math.min(this._mapHeight - this._data.radius, newTarget.y);
        this._data.target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        this._data.position = MyMath_1["default"].move(this._data.position, this._data.target, this._data.speed);
        for (var _i = 0, _a = Object.entries(this._data.shotsSent); _i < _a.length; _i++) {
            var entry = _a[_i];
            var playerId = entry[0];
            var shot = entry[1];
            shot.move();
            shot.reduceExpirationTime();
            if (!shot.expirationTime)
                this.deleteShot(playerId);
        }
        for (var _b = 0, _c = Object.entries(this._data.scoutsSent); _b < _c.length; _b++) {
            var entry = _c[_b];
            var playerId = entry[0];
            var scout = entry[1];
            scout.move();
            scout.reduceExpirationTime();
            if (!scout.expirationTime)
                this.deleteScout(playerId);
        }
    };
    Ship.prototype.processPlayerInput = function (playerId, args) {
        try {
            if (args[0] == Ship.roleSelectKeyword) {
                this.processPlayerSelect(playerId, args[1]);
            }
            else {
                this.processPlayerRoleInput(playerId, args);
            }
        }
        catch (_a) {
        }
    };
    Ship.prototype.processPlayerSelect = function (playerId, requestedRoleTitle) {
        if (Object.keys(this._data.shotsSent).includes(playerId) ||
            Object.keys(this._data.scoutsSent).includes(playerId)) {
            return;
        }
        for (var _i = 0, _a = this._data.roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        var requestedRole;
        for (var _b = 0, _c = this._data.roles; _b < _c.length; _b++) {
            var role = _c[_b];
            if (role.title == requestedRoleTitle) {
                requestedRole = role;
                break;
            }
        }
        if (!requestedRole.isFull())
            requestedRole.addPlayer(playerId);
    };
    Ship.prototype.processPlayerRoleInput = function (playerId, args) {
        var playerRole;
        for (var _i = 0, _a = this._data.roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }
        switch (playerRole.title) {
            case Ship.captainTitle:
                this.setTarget(new Position_1["default"](Number(args[0]), Number(args[1])));
                break;
            case Ship.shooterTitle: {
                if (this.isShotAvailable(playerId)) {
                    this.shootProjectile(playerId, new Position_1["default"](Number(args[0]), Number(args[1])));
                }
                break;
            }
            case Ship.scoutTitle: {
                if (this.isScoutAvailable(playerId)) {
                    this.sendScout(playerId, new Position_1["default"](Number(args[0]), Number(args[1])));
                }
                break;
            }
        }
    };
    Ship.prototype.heal = function () {
        var medics = this._data.medic.getPlayerCount();
        if (medics) {
            var heal = this._data.medicHeal *
                (1 - Math.pow(this._data.medicDiminishPercent, medics)) /
                (1 - this._data.medicDiminishPercent);
            this._data.health = Math.min(100, this._data.health + heal);
        }
    };
    Ship.prototype.isShotAvailable = function (playerId) {
        if (this._data.shotsSent[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.isScoutAvailable = function (playerId) {
        if (this._data.scoutsSent[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.shootProjectile = function (playerId, target) {
        this._data.shotsSent[playerId] = new Shot_1["default"](this._data.position, target, this._data.shooterExpirationTime, this._data.shooterSpeed);
    };
    Ship.prototype.sendScout = function (playerId, target) {
        this._data.scoutsSent[playerId] = new Shot_1["default"](this._data.position, target, this._data.scoutExpirationTime, this._data.scoutsSentpeed);
    };
    Ship.prototype.deleteShot = function (playerId) {
        delete this._data.shotsSent[playerId];
    };
    Ship.prototype.deleteScout = function (playerId) {
        delete this._data.scoutsSent[playerId];
    };
    Ship.prototype.takeDamage = function () {
        this._data.health -= this._data.shooterDamage;
    };
    Ship.prototype.getData = function () {
        return this._data;
    };
    Ship.prototype.getProjectileData = function () {
        return this._data;
    };
    Ship.captainTitle = "captain";
    Ship.medicTitle = "medic";
    Ship.shooterTitle = "shooter";
    Ship.scoutTitle = "scout";
    Ship.roleSelectKeyword = "select";
    return Ship;
}());
exports["default"] = Ship;
