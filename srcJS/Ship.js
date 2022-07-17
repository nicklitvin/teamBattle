"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position_1 = require("./Position");
var Role_1 = require("./Role");
var MAP_WIDTH = 16;
var MAP_HEIGHT = 9;
var CAPTAIN_COUNT = 1;
var CAPTAIN_TITLE = "captain";
var ROLE_SELECT_KEYWORD = "select";
var Ship = (function () {
    function Ship(position) {
        this.health = 100;
        this.sideLength = 0.2;
        this.angle = 0;
        this.speed = 0.5;
        this.captain = new Role_1["default"](CAPTAIN_COUNT, CAPTAIN_TITLE);
        this.roles = [this.captain];
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
            if (args[0] == ROLE_SELECT_KEYWORD) {
                this.processPlayerSelect(playerId, args[1]);
            }
            else {
                this.processPlayerRoleInput(playerId, args);
            }
        }
        catch (_a) {
            console.log("input error");
        }
    };
    Ship.prototype.processPlayerSelect = function (playerId, role) {
        for (var _i = 0, _a = this.roles; _i < _a.length; _i++) {
            var role_1 = _a[_i];
            if (role_1.isPlayerHere(playerId)) {
                role_1.removePlayer(playerId);
                break;
            }
        }
        switch (role) {
            case CAPTAIN_TITLE: {
                if (!this.captain.isFull())
                    this.captain.addPlayer(playerId);
            }
        }
    };
    Ship.prototype.processPlayerRoleInput = function (playerId, args) {
        var playerRole;
        for (var _i = 0, _a = this.roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }
        switch (playerRole.title) {
            case CAPTAIN_TITLE:
                this.setTarget(new Position_1["default"](Number(args[0]), Number(args[1])));
        }
    };
    return Ship;
}());
exports["default"] = Ship;
