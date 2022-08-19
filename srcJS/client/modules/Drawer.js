import MyMath from "./MyMath.js";
import DrawingInstruction from "./DrawingInstruction.js";

export default class Drawer {
    constructor() {
        this._font = "128px Comic Sans MS";
        this._textAlign = "center";
        this._textColor = "white";
        this._instructions = [];
    }

    updateInstructions(instructions) {
        this._timeStart = Date.now();
        this._instructions = instructions;
    }

    getDrawingInstructions() {
        if (!this._canvas) return;
        let instructions = [];

        for (let instruction of this._instructions) {
            let instructionObject = DrawingInstruction.make(instruction);
            instructionObject._position.x *= this._canvas.width;

            instructionObject._position.y = (1 - instructionObject._position.y)*this._canvas.height;  
            instructionObject._target.x *= this._canvas.width;  
            instructionObject._target.y = (1 - instructionObject._target.y)*this._canvas.height;
            instructionObject._radius *= this._canvas.width;
            instructionObject._speed *= this._canvas.width;  
            instructions.push(instructionObject);
        }
        return instructions;
    }

    draw() {
        let timeDiff = Date.now() - this._timeStart;
        let instructions = this.getDrawingInstructions();
        if (!instructions) return;

        for (let instruction of instructions) {
            let newPosition = MyMath.move(
                instruction._position,
                instruction._target,
                instruction._speed,
                timeDiff
            );
            this._ctx.beginPath();
            this._ctx.fillStyle = instruction._color;
            console.log(instruction,newPosition);
            this._ctx.arc(
                newPosition.x,
                newPosition.y,
                instruction._radius,
                0,
                2*Math.PI
            )
            this._ctx.fill();
        }
    }

    drawCountdown(time) {
        this._ctx.font = this._font;
        this._ctx.textAlign = this._textAlign;        
        this._ctx.fillStyle = this._textColor;
        this._ctx.fillText(time, this._canvas.width/2, this._canvas.height/2);
    }

    updateContext(canvas, ctx) {
        this._canvas = canvas;
        this._ctx = ctx;
    }
}