"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Shot = (function () {
    function Shot(position, target, time, speed) {
        this.expirationTime = 2;
        this.expirationTime = time;
        this.speed = speed;
        this.position = position;
        this.target = MyMath_1["default"].extendToMaxRange(this.position, target, this.speed, this.expirationTime);
    }
    Shot.prototype.move = function () {
        MyMath_1["default"].move(this.position, this.target, this.speed);
    };
    return Shot;
}());
exports["default"] = Shot;
