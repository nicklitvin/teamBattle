"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var MAP_WIDTH = 16;
var MAP_HEIGHT = 9;
var Ship = (function () {
    function Ship(position) {
        this.health = 100;
        this.sideLength = 0.2;
        this.angle = 0;
        this.speed = 0.5;
        this.position = position.copy();
        this.target = position.copy();
    }
    Ship.prototype.setTarget = function (newTarget) {
        newTarget.x = Math.max(this.sideLength / 2, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.sideLength / 2, newTarget.x);
        newTarget.y = Math.max(this.sideLength / 2, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.sideLength / 2, newTarget.y);
        this.target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        var xDiff = this.target.x - this.position.x;
        var yDiff = this.target.y - this.position.y;
        if (Math.pow((Math.pow(xDiff, 2) + Math.pow(yDiff, 2)), (1 / 2)) <= this.speed) {
            this.position = this.target.copy();
        }
        else if (xDiff == 0) {
            this.position.y += this.speed * Math.sign(yDiff);
        }
        else {
            var angle = MyMath_1["default"].round(Math.atan(yDiff / xDiff));
            this.position.x += Math.cos(angle) * this.speed * Math.sign(xDiff);
            this.position.y += Math.sin(angle) * this.speed * Math.sign(xDiff);
        }
        this.position.round();
    };
    return Ship;
}());
exports["default"] = Ship;
