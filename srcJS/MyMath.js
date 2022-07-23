"use strict";
exports.__esModule = true;
var Position_1 = require("./Position");
var MyMath = (function () {
    function MyMath() {
    }
    MyMath.round = function (val) {
        var roundingVal = Math.pow(10, MyMath.roundDigit);
        val = Math.round(val * roundingVal) / roundingVal;
        if (val == -0)
            val = 0;
        return val;
    };
    MyMath.move = function (from, to, speed) {
        var xDiff = to.x - from.x;
        var yDiff = to.y - from.y;
        var newPosition = from.copy();
        if (Math.pow((Math.pow(xDiff, 2) + Math.pow(yDiff, 2)), (1 / 2)) <= speed) {
            newPosition = to.copy();
        }
        else if (xDiff == 0) {
            newPosition.y += speed * Math.sign(yDiff);
        }
        else {
            var angle = MyMath.round(Math.atan(yDiff / xDiff));
            newPosition.x += Math.cos(angle) * speed * Math.sign(xDiff);
            newPosition.y += Math.sin(angle) * speed * Math.sign(xDiff);
        }
        newPosition.round();
        return newPosition;
    };
    MyMath.extendToMaxRange = function (from, to, speed, time) {
        var xDiff = to.x - from.x;
        var yDiff = to.y - from.y;
        if (speed * time == 0)
            return from;
        var currDistanceRatio = Math.pow((Math.pow(xDiff, 2) + Math.pow(yDiff, 2)), (1 / 2)) / (speed * time);
        if (!currDistanceRatio)
            return new Position_1["default"](from.x, from.y + speed * time);
        xDiff *= 1 / currDistanceRatio;
        yDiff *= 1 / currDistanceRatio;
        var newPosition = new Position_1["default"](from.x + xDiff, from.y + yDiff);
        newPosition.round();
        return newPosition;
    };
    MyMath.doCirclesIntersect = function (c1, c2) {
        var dist = Math.pow((Math.pow((c2.position.x - c1.position.x), 2) +
            Math.pow((c2.position.y - c1.position.y), 2)), (1 / 2));
        if (dist <= c1.radius + c2.radius)
            return true;
        return false;
    };
    MyMath.roundDigit = 4;
    return MyMath;
}());
exports["default"] = MyMath;
