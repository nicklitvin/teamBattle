import MyMath from "./MyMath.js";
import DrawingInstruction from "./DrawingInstruction.js";

export default class Drawer {
    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._ctx.font = "42 Comic Sans MS";
        this._ctx.textAlign = "center";
    }

    updateInstructions(instructions) {
        this._instructions = [];

        for (let instruction of instructions) {
            let instructionObject = DrawingInstruction.make(instruction);
            instructionObject._position.x *= this._canvas.width;
            instructionObject._position.y *= this._canvas.height;  
            instructionObject._target.x *= this._canvas.width;  
            instructionObject._target.y *= this._canvas.height;
            instructionObject._radius *= this._canvas.width;
            instructionObject._speed *= this._canvas.width;  
            this._instructions.push(instructionObject);
        }
        this._timeStart = Date.now();
    }

    draw() {
        this._ctx.clearRect(0,0,this._canvas.width,this._canvas.height);
        let timeDiff = Date.now() - this._timeStart;

        if (!this._instructions) return;

        for (let instruction of this._instructions) {
            let newPosition = MyMath.move(
                instruction._position,
                instruction._target,
                instruction._speed,
                timeDiff
            );
            this._ctx.beginPath();
            this._ctx.arc(
                newPosition.x,
                newPosition.y,
                instruction._radius,
                0,
                2*Math.PI
            )
            this._ctx.stroke();
            this._ctx.fill();
        }
    }

    drawCountdown(time) {
        this._ctx.fillStyle = "white";
        this._ctx.fillText(time, this._canvas.width/2, this._canvas.height/2);
    }
}