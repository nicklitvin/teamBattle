"use strict";
exports.__esModule = true;
var Role_1 = require("./Role");
var Ship_1 = require("./Ship");
var ShipData = (function () {
    function ShipData() {
        this.radius = 0.2;
        this.speed = 0.5;
        this.health = 100;
        this.captainCount = 1;
        this.medicCount = 10;
        this.medicHeal = 1;
        this.medicDiminishPercent = 0.5;
        this.shooterCount = 5;
        this.shooterSpeed = 5;
        this.shooterExpirationTime = 1;
        this.shooterDamage = 10;
        this.scoutCount = 3;
        this.scoutsSentpeed = 3;
        this.scoutExpirationTime = 1;
        this.shotsSent = {};
        this.scoutsSent = {};
        this.captain = new Role_1["default"](this.captainCount, Ship_1["default"].captainTitle);
        this.medic = new Role_1["default"](this.medicCount, Ship_1["default"].medicTitle);
        this.shooter = new Role_1["default"](this.shooterCount, Ship_1["default"].shooterTitle);
        this.scout = new Role_1["default"](this.scoutCount, Ship_1["default"].scoutTitle);
        this.roles = [this.captain, this.medic, this.shooter, this.scout];
    }
    return ShipData;
}());
exports["default"] = ShipData;
