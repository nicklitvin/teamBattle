"use strict";
exports.__esModule = true;
var MyMath_1 = require("./MyMath");
var Ship = (function () {
    function Ship(shipId, position) {
        this.health = 100;
        this.width = 0.1;
        this.height = 0.2;
        this.angle = 0;
        this.speed = 0.5;
        this.id = shipId;
        this.position = position.copy();
        this.target = position.copy();
    }
    Ship.prototype.setTarget = function (newTarget) {
        this.target = newTarget.copy();
    };
    Ship.prototype.move = function () {
        var xDiff = this.target.x - this.position.x;
        var yDiff = this.target.y - this.position.y;
        if (xDiff == 0) {
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
