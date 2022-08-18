"use strict";
exports.__esModule = true;
var DrawingInstruction = (function () {
    function DrawingInstruction(projectile, color) {
        this._radius = projectile._radius;
        this._speed = projectile._speed;
        this._position = projectile._position.copy();
        if (projectile._target)
            this._target = projectile._target.copy();
        this._color = color;
    }
    return DrawingInstruction;
}());
exports["default"] = DrawingInstruction;
