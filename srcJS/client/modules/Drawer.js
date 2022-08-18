import MyMath from "./MyMath.js";

export default class Drawer {
    constructor(canvas) {
        this._canvas = canvas;
    }

    updateInstructions(instructions) {
        this._instructions = instructions;
        this._timeStart = Date.now();
    }

    draw() {
        let timeDiff = Date.now() - this._timeStart;

        if (!this._instructions) return;

        for (let instruction of this._instructions) {
            let newPosition = MyMath.move(
                instruction._position,
                instruction._target,
                instruction._speed,
                timeDiff
            );
            this._canvas.beginPath();
            this._canvas.arc(
                newPosition.x,
                newPosition.y,
                instruction._radius,
                0,
                2*Math.PI
            )
            this._canvas.stroke();
            this._canvas.fill();
        }
    }
}