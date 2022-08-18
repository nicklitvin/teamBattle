"use strict";
exports.__esModule = true;
var DrawingInstruction = (function () {
    function DrawingInstruction(projectile, color, mapWidth, mapHeight) {
        this._radius = projectile._radius / mapWidth;
        this._speed = projectile._speed / mapWidth;
        this._position = projectile._position.copy().convertToPercent(mapWidth, mapHeight);
        if (projectile._target)
            this._target = projectile._target.copy().convertToPercent(mapWidth, mapHeight);
        this._color = color;
    }
    return DrawingInstruction;
}());
exports["default"] = DrawingInstruction;
