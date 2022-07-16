import MyMath from "./MyMath";
import Position from "./Position";

export default class Ship {
    public readonly id : string;

    public health = 100;
    public width = 0.1;
    public height = 0.2;
    public angle = 0;
    public speed = 0.5;

    public position : Position;
    public target : Position; 

    constructor(shipId : string, position : Position) {
        this.id = shipId;
        this.position = position.copy();
        this.target = position.copy();
    }

    public setTarget(newTarget : Position) : void {
        this.target = newTarget.copy();
    }

    public move() : void {
        let xDiff = this.target.x - this.position.x;
        let yDiff = this.target.y - this.position.y;

        if (xDiff == 0) {
            this.position.y += this.speed * Math.sign(yDiff);
        } else {
            let angle = MyMath.round(Math.atan(yDiff/xDiff));
            this.position.x += Math.cos(angle) * this.speed * Math.sign(xDiff);
            this.position.y += Math.sin(angle) * this.speed * Math.sign(xDiff);
        }

        this.position.round()
    }
}
