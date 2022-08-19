"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position_1 = require("./Position");
var Role_1 = require("./Role");
var Shot_1 = require("./Shot");
var SocketMessages = require("../client/socketMessages.json");
var Game_1 = require("./Game");
var Ship = (function () {
    function Ship(position) {
        if (position === void 0) { position = new Position_1["default"](1, 1); }
        this._radius = 0.5;
        this._speed = 0.02;
        this._health = 100;
        this._vision = 3;
        this._captainCount = 1;
        this._medicCount = 10;
        this._medicHeal = 1;
        this._medicDiminishPercent = 0.5;
        this._shooterCount = 5;
        this._shooterSpeed = 0.02;
        this._shooterExpirationTime = 120;
        this._shooterDamage = 50;
        this._scoutCount = 3;
        this._scoutSpeed = 0.02;
        this._scoutExpirationTime = 120;
        this._shotsSent = {};
        this._scoutsSent = {};
        this._captain = new Role_1["default"](this._captainCount, SocketMessages.captainTitle);
        this._medic = new Role_1["default"](this._medicCount, SocketMessages.medicTitle);
        this._shooter = new Role_1["default"](this._shooterCount, SocketMessages.shooterTitle);
        this._scout = new Role_1["default"](this._scoutCount, SocketMessages.scoutTitle);
        this._roles = [this._captain, this._medic, this._shooter, this._scout];
        this._position = position.copy();
    }
    Ship.prototype.setId = function (id) {
        this._id = id;
    };
    Ship.prototype.setTarget = function (newTarget) {
        newTarget.x = Math.max(this._radius, newTarget.x);
        newTarget.x = Math.min(Game_1["default"]._mapWidth - this._radius, newTarget.x);
        newTarget.y = Math.max(this._radius, newTarget.y);
        newTarget.y = Math.min(Game_1["default"]._mapHeight - this._radius, newTarget.y);
        this._target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        if (this._target) {
            this._position = MyMath_1["default"].move(this._position, this._target, this._speed);
        }
        for (var _i = 0, _a = Object.entries(this._shotsSent); _i < _a.length; _i++) {
            var entry = _a[_i];
            var playerId = entry[0];
            var shot = entry[1];
            shot.move();
            if (!shot._expirationTime) {
                delete this._shotsSent[playerId];
            }
        }
        for (var _b = 0, _c = Object.entries(this._scoutsSent); _b < _c.length; _b++) {
            var entry = _c[_b];
            var playerId = entry[0];
            var scout = entry[1];
            scout.move();
            if (!scout._expirationTime) {
                delete this._scoutsSent[playerId];
            }
        }
    };
    Ship.prototype.processPlayerInput = function (playerId, args) {
        try {
            if (args[0] == SocketMessages.roleSelectKeyword) {
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
        if (Object.keys(this._shotsSent).includes(playerId) ||
            Object.keys(this._scoutsSent).includes(playerId)) {
            return;
        }
        for (var _i = 0, _a = this._roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        var requestedRole;
        for (var _b = 0, _c = this._roles; _b < _c.length; _b++) {
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
        for (var _i = 0, _a = this._roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }
        switch (playerRole.title) {
            case SocketMessages.captainTitle:
                this.setTarget(new Position_1["default"](Number(args[0]), Number(args[1])));
                break;
            case SocketMessages.shooterTitle: {
                if (this.isShotAvailable(playerId)) {
                    this.shootProjectile(playerId, new Position_1["default"](Number(args[0]), Number(args[1])));
                }
                break;
            }
            case SocketMessages.scoutTitle: {
                if (this.isScoutAvailable(playerId)) {
                    this.sendScout(playerId, new Position_1["default"](Number(args[0]), Number(args[1])));
                }
                break;
            }
        }
    };
    Ship.prototype.heal = function () {
        var medics = this._medic.getPlayerCount();
        if (medics) {
            var heal = this._medicHeal *
                (1 - Math.pow(this._medicDiminishPercent, medics)) /
                (1 - this._medicDiminishPercent);
            this._health = Math.min(100, this._health + heal);
        }
    };
    Ship.prototype.isShotAvailable = function (playerId) {
        if (this._shotsSent[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.isScoutAvailable = function (playerId) {
        if (this._scoutsSent[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.shootProjectile = function (playerId, target) {
        this._shotsSent[playerId] = new Shot_1["default"](this._position, target, this._shooterExpirationTime, this._shooterSpeed, this._color);
    };
    Ship.prototype.sendScout = function (playerId, target) {
        this._scoutsSent[playerId] = new Shot_1["default"](this._position, target, this._scoutExpirationTime, this._scoutSpeed, this._color);
    };
    Ship.prototype.takeDamage = function () {
        this._health -= this._shooterDamage;
    };
    Ship.prototype.deleteShot = function (playerId) {
        delete this._shotsSent[playerId];
    };
    Ship.prototype.setColor = function (color) {
        this._color = color;
    };
    return Ship;
}());
exports["default"] = Ship;
