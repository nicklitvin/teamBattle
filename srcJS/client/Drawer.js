"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Drawer = (function () {
    function Drawer() {
    }
    Drawer.prototype.updateInstructions = function (instructions) {
        this._instructions = instructions;
        this._timeStart = Date.now();
    };
    Drawer.prototype.draw = function () {
        var timeDiff = Date.now() - this._timeStart;
        for (var _i = 0, _a = this._instructions; _i < _a.length; _i++) {
            var instruction = _a[_i];
            var newPosition = MyMath_1["default"].move(instruction._position, instruction._target, instruction._speed, timeDiff);
            this._canvas.beginPath();
            this._canvas.arc(newPosition.x, newPosition.y, instruction._radius, 0, 2 * Math.PI);
            this._canvas.stroke();
            this._canvas.fill();
        }
    };
    return Drawer;
}());
exports["default"] = Drawer;
