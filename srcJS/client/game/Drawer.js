/**
 * Drawer class takes instructions and draws them on canvas. Canvas and
 * its context need to be updated before drawing to avoid format conflict.
 */
export default class Drawer {
    constructor() {
        this._font = "128px Comic Sans MS";
        this._textAlign = "center";
        this._textColor = "white";
        this._instructions = [];
        this._canvas = null;
        this._ctx = null;
        this._permanentMessage = "";
        this._permanentMessageFont = "24px Comic Sans MS";
    }

    /**
     * Scales instructions to canvas size and inverts y position.
     * Saves results under this._instructions.
     * 
     * @param {{radius: number, position: {x: number, y: number}, color: string }}instructions
     */
    updateInstructions(instructions) {
        this._instructions = instructions;

        for (let instruction of this._instructions) {
            instruction._position.x *= this._canvas.width;
            instruction._position.y = (1 - instruction._position.y)*this._canvas.height;  
            instruction._radius *= this._canvas.width;
        }
    }

    /**
     * Draws every instruction saved under this._instructions. 
     * 
     * @returns {void}
     */
    draw() {
        if (!this._instructions) return;
        for (let instruction of this._instructions) {
            this._ctx.beginPath();
            this._ctx.fillStyle = instruction._color;
            this._ctx.arc(
                instruction._position.x,
                instruction._position.y,
                instruction._radius,
                0,
                2*Math.PI
            )
            this._ctx.fill();
        }
    }

    /**
     * Writes countdown in the middle of the canvas based on default settings.
     * 
     * @param {string} time
     */
    writeCountdown(time) {
        this._ctx.font = this._font;
        this._ctx.textAlign = this._textAlign;        
        this._ctx.fillStyle = this._textColor;
        this._ctx.fillText(time, this._canvas.width/2, this._canvas.height/2);
    }

    /**
     * Writes permanent message in the middle of the canvas.
     */
    writeMessage() {
        this._ctx.font = this._permanentMessageFont;
        this._ctx.textAlign = this._textAlign;        
        this._ctx.fillStyle = this._textColor;
        this._ctx.fillText(this._permanentMessage, this._canvas.width/2, this._canvas.height/2);
    }

    /**
     * Saves new canvas and context.
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    updateContext(canvas, ctx) {
        this._canvas = canvas;
        this._ctx = ctx;
    }
}