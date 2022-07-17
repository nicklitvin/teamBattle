"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Shot = (function () {
    function Shot(position, target, time, speed) {
        this.speed = 2;
        this.sideLength = 0.1;
        this.expirationTime = 2;
        if (time)
            this.expirationTime = time;
        if (speed)
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
