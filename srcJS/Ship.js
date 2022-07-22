"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position_1 = require("./Position");
var Role_1 = require("./Role");
var Shot_1 = require("./Shot");
var MAP_WIDTH = 16;
var MAP_HEIGHT = 9;
var Ship = (function () {
    function Ship(position) {
        if (position === void 0) { position = new Position_1["default"](1, 1); }
        this.health = 100;
        this.radius = 0.2;
        this.speed = 0.5;
        this.captainCount = 1;
        this.medicCount = 10;
        this.medicHeal = 1;
        this.medicDiminishPercent = 0.5;
        this.shooterCount = 5;
        this.shotSpeed = 5;
        this.shotExpirationTime = 1;
        this.shotDamage = 10;
        this.scoutCount = 3;
        this.scoutSpeed = 3;
        this.scoutExpirationTime = 1;
        this.shots = {};
        this.scouts = {};
        this.captain = new Role_1["default"](this.captainCount, Ship.captainTitle);
        this.medic = new Role_1["default"](this.medicCount, Ship.medicTitle);
        this.shooter = new Role_1["default"](this.shooterCount, Ship.shooterTitle);
        this.scout = new Role_1["default"](this.scoutCount, Ship.scoutTitle);
        this.position = position.copy();
        this.target = position.copy();
    }
    Ship.prototype.setTarget = function (newTarget) {
        newTarget.x = Math.max(this.radius, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.radius, newTarget.x);
        newTarget.y = Math.max(this.radius, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.radius, newTarget.y);
        this.target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        this.position = MyMath_1["default"].move(this.position, this.target, this.speed);
        for (var _i = 0, _a = Object.entries(this.shots); _i < _a.length; _i++) {
            var entry = _a[_i];
            var playerId = entry[0];
            var shot = entry[1];
            shot.move();
            shot.reduceExpirationTime();
            if (!shot.getExpiration())
                this.deleteShot(playerId);
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
        if (Object.keys(this.shots).includes(playerId) ||
            Object.keys(this.scouts).includes(playerId)) {
            return;
        }
        for (var _i = 0, _a = this.getRoles(); _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        var requestedRole;
        for (var _b = 0, _c = this.getRoles(); _b < _c.length; _b++) {
            var role = _c[_b];
            if (role.getTitle() == requestedRoleTitle) {
                requestedRole = role;
                break;
            }
        }
        if (!requestedRole.isFull())
            requestedRole.addPlayer(playerId);
    };
    Ship.prototype.processPlayerRoleInput = function (playerId, args) {
        var playerRole;
        for (var _i = 0, _a = this.getRoles(); _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }
        switch (playerRole.getTitle()) {
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
        var medics = this.medic.getPlayerCount();
        if (medics) {
            var heal = this.medicHeal *
                (1 - Math.pow(this.medicDiminishPercent, medics)) /
                (1 - this.medicDiminishPercent);
            this.health = Math.min(100, this.health + heal);
        }
    };
    Ship.prototype.getRoles = function () {
        return [this.captain, this.medic, this.shooter, this.scout];
    };
    Ship.prototype.isShotAvailable = function (playerId) {
        if (this.shots[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.isScoutAvailable = function (playerId) {
        if (this.scouts[playerId]) {
            return false;
        }
        return true;
    };
    Ship.prototype.shootProjectile = function (playerId, target) {
        this.shots[playerId] = new Shot_1["default"](this.position, target, this.shotExpirationTime, this.shotSpeed);
    };
    Ship.prototype.sendScout = function (playerId, target) {
        this.scouts[playerId] = new Shot_1["default"](this.position, target, this.scoutExpirationTime, this.scoutSpeed);
    };
    Ship.prototype.deleteShot = function (playerId) {
        delete this.shots[playerId];
    };
    Ship.prototype.deleteScout = function (playerId) {
        delete this.scouts[playerId];
    };
    Ship.prototype.takeDamage = function () {
        this.health -= this.shotDamage;
    };
    Ship.prototype.setId = function (id) { this.id = id; };
    Ship.prototype.setHealth = function (health) { this.health = health; };
    Ship.prototype.setRadius = function (radius) { this.radius = radius; };
    Ship.prototype.setSpeed = function (speed) { this.speed = speed; };
    Ship.prototype.setScoutCount = function (count) { this.scoutCount = count; };
    Ship.prototype.setScoutSpeed = function (speed) { this.scoutSpeed = speed; };
    Ship.prototype.setScoutExpiration = function (time) { this.scoutExpirationTime = time; };
    Ship.prototype.setShooterCount = function (count) { this.shooterCount = count; };
    Ship.prototype.setShooterSpeed = function (speed) { this.shotSpeed = speed; };
    Ship.prototype.setShooterExpiration = function (time) { this.shotExpirationTime = time; };
    Ship.prototype.setMedicCount = function (count) { this.medicCount = count; };
    Ship.prototype.setMedicHeal = function (heal) { this.medicHeal = heal; };
    Ship.prototype.setMedicDiminish = function (percent) { this.medicDiminishPercent = percent; };
    Ship.prototype.setCaptainCount = function (count) { this.captainCount = count; };
    Ship.prototype.setPosition = function (pos) { this.position = pos; };
    Ship.prototype.getId = function () { return this.id; };
    Ship.prototype.getShots = function () { return __assign({}, this.shots); };
    Ship.prototype.getScouts = function () { return __assign({}, this.scouts); };
    Ship.prototype.getHealth = function () { return this.health; };
    Ship.prototype.getRadius = function () { return this.radius; };
    Ship.prototype.getSpeed = function () { return this.speed; };
    Ship.prototype.getPosition = function () { return this.position; };
    Ship.prototype.getTarget = function () { return this.target; };
    Ship.prototype.getShooterDamage = function () { return this.shotDamage; };
    Ship.prototype.getRole = function (role) {
        switch (role) {
            case Ship.captainTitle:
                return this.captain;
            case Ship.scoutTitle:
                return this.scout;
            case Ship.medicTitle:
                return this.medic;
            case Ship.shooterTitle:
                return this.shooter;
            default:
                return null;
        }
    };
    Ship.captainTitle = "captain";
    Ship.medicTitle = "medic";
    Ship.shooterTitle = "shooter";
    Ship.scoutTitle = "scout";
    Ship.roleSelectKeyword = "select";
    return Ship;
}());
exports["default"] = Ship;
