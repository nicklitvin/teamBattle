"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position_1 = require("./Position");
var Role_1 = require("./Role");
var MAP_WIDTH = 16;
var MAP_HEIGHT = 9;
var Ship = (function () {
    function Ship(position) {
        if (position === void 0) { position = new Position_1["default"](1, 1); }
        this.health = 100;
        this.sideLength = 0.2;
        this.speed = 0.5;
        this.captainCount = 1;
        this.medicCount = 10;
        this.shooterCount = 5;
        this.medicHeal = 1;
        this.medicDiminishPercent = 0.5;
        this.captain = new Role_1["default"](this.captainCount, Ship.captainTitle);
        this.medic = new Role_1["default"](this.medicCount, Ship.medicTitle);
        this.shooter = new Role_1["default"](this.shooterCount, Ship.shooterTitle);
        this.position = position.copy();
        this.target = position.copy();
    }
    Ship.prototype.setTarget = function (newTarget) {
        newTarget.x = Math.max(this.sideLength / 2, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.sideLength / 2, newTarget.x);
        newTarget.y = Math.max(this.sideLength / 2, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.sideLength / 2, newTarget.y);
        this.target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        var xDiff = this.target.x - this.position.x;
        var yDiff = this.target.y - this.position.y;
        if (Math.pow((Math.pow(xDiff, 2) + Math.pow(yDiff, 2)), (1 / 2)) <= this.speed) {
            this.position = this.target.copy();
        }
        else if (xDiff == 0) {
            this.position.y += this.speed * Math.sign(yDiff);
        }
        else {
            var angle = MyMath_1["default"].round(Math.atan(yDiff / xDiff));
            this.position.x += Math.cos(angle) * this.speed * Math.sign(xDiff);
            this.position.y += Math.sin(angle) * this.speed * Math.sign(xDiff);
        }
        this.position.round();
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
        for (var _i = 0, _a = this.getRoles(); _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }
        switch (playerRole.title) {
            case Ship.captainTitle:
                this.setTarget(new Position_1["default"](Number(args[0]), Number(args[1])));
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
        return [this.captain, this.medic, this.shooter];
    };
    Ship.captainTitle = "captain";
    Ship.medicTitle = "medic";
    Ship.shooterTitle = "shooter";
    Ship.roleSelectKeyword = "select";
    return Ship;
}());
exports["default"] = Ship;
