import DrawingInstruction from "./DrawingInstruction";
import MyMath from "./MyMath";

export default class Drawer {
    _instructions : DrawingInstruction[];
    _timeStart : number;
    _canvas : CanvasRenderingContext2D;

    public updateInstructions(instructions : DrawingInstruction[]) {
        this._instructions = instructions;
        this._timeStart = Date.now();
    }

    public draw() {
        let timeDiff = Date.now() - this._timeStart;

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