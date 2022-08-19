"use strict";
exports.__esModule = true;
var DrawingInstruction = (function () {
    function DrawingInstruction(projectile, mapWidth, mapHeight) {
        this._radius = projectile._radius / mapWidth;
        this._position = projectile._position.copy().convertToPercent(mapWidth, mapHeight);
        this._color = projectile._color;
    }
    return DrawingInstruction;
}());
exports["default"] = DrawingInstruction;
