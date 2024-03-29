"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Position = (function () {
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    Position.prototype.round = function () {
        this.x = MyMath_1["default"].round(this.x);
        this.y = MyMath_1["default"].round(this.y);
    };
    Position.prototype.copy = function () {
        return new Position(this.x, this.y);
    };
    Position.prototype.convertToPercent = function (maxWidth, maxHeight) {
        return new Position(this.x / maxWidth, this.y / maxHeight);
    };
    Position.prototype.expandByDimensions = function (maxWidth, maxHeight) {
        return new Position(this.x * maxWidth, this.y * maxHeight);
    };
    return Position;
}());
exports["default"] = Position;
