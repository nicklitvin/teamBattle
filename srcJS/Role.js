"use strict";
exports.__esModule = true;
var Role = (function () {
    function Role(capacity, title) {
        this.playerIds = [];
        this.title = title;
        this.capacity = capacity;
    }
    Role.prototype.isFull = function () {
        var yes = this.playerIds.length == this.capacity ? true : false;
        return yes;
    };
    Role.prototype.addPlayer = function (playerId) {
        if (!this.isFull()) {
            this.playerIds.push(playerId);
        }
    };
    Role.prototype.removePlayer = function (playerId) {
        var index = this.playerIds.indexOf(playerId);
        this.playerIds.splice(index, 1);
    };
    Role.prototype.isPlayerHere = function (playerId) {
        var index = this.playerIds.indexOf(playerId);
        if (index == -1)
            return false;
        return true;
    };
    Role.prototype.getPlayerCount = function () {
        return this.playerIds.length;
    };
    return Role;
}());
exports["default"] = Role;
