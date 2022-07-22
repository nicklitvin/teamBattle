"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Shot = (function () {
    function Shot(position, target, time, speed) {
        this.radius = 0.1;
        this.expirationTime = time;
        this.speed = speed;
        this.position = position;
        this.target = MyMath_1["default"].extendToMaxRange(this.position, target, this.speed, this.expirationTime);
    }
    Shot.prototype.move = function () {
        this.position = MyMath_1["default"].move(this.position, this.target, this.speed);
    };
    Shot.prototype.reduceExpirationTime = function () {
        this.expirationTime -= 1;
    };
    Shot.prototype.getRadius = function () { return this.radius; };
    Shot.prototype.getSpeed = function () { return this.speed; };
    Shot.prototype.getPosition = function () { return this.position; };
    Shot.prototype.getTarget = function () { return this.target; };
    Shot.prototype.getExpiration = function () { return this.expirationTime; };
    return Shot;
}());
exports["default"] = Shot;
