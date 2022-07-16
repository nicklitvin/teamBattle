"use strict";
exports.__esModule = true;
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
    MyMath.roundDigit = 4;
    return MyMath;
}());
exports["default"] = MyMath;
