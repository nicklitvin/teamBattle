"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Shot = (function () {
    function Shot(position, target, time, speed, color) {
        if (color === void 0) { color = "black"; }
        this._radius = 0.1;
        this._expirationTime = time;
        this._speed = speed;
        this._color = color;
        this._position = position;
        this._target = MyMath_1["default"].extendToMaxRange(this._position, target, this._speed, this._expirationTime);
    }
    Shot.prototype.move = function () {
        this._position = MyMath_1["default"].move(this._position, this._target, this._speed);
        this._expirationTime -= 1;
    };
    return Shot;
}());
exports["default"] = Shot;
