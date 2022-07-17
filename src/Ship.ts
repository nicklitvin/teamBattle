import MyMath from "./MyMath";
import Position from "./Position";

const MAP_WIDTH = 16;
const MAP_HEIGHT = 9;

export default class Ship {
    public health = 100;
    public sideLength = 0.2;
    public angle = 0;
    public speed = 0.5;

    public position : Position;
    public target : Position;

    constructor(position : Position) {
        this.position = position.copy();
        this.target = position.copy();
    }

    public setTarget(newTarget : Position) : void {
        newTarget.x = Math.max(this.sideLength/2, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.sideLength/2, newTarget.x);
        newTarget.y = Math.max(this.sideLength/2, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.sideLength/2, newTarget.y);

        this.target = newTarget.copy();
    }

    public move() : void {
        let xDiff = this.target.x - this.position.x;
        let yDiff = this.target.y - this.position.y;

        if ( (xDiff**2 + yDiff**2)**(1/2) <= this.speed) {
            this.position = this.target.copy()
        } else if (xDiff == 0) {
            this.position.y += this.speed * Math.sign(yDiff);
        } else {
            let angle = MyMath.round(Math.atan(yDiff/xDiff));
            this.position.x += Math.cos(angle) * this.speed * Math.sign(xDiff);
            this.position.y += Math.sin(angle) * this.speed * Math.sign(xDiff);
        }

        this.position.round()
    }

    public processPlayerInput(playerId : string, args : any[]) : void {
        try {
            this.setTarget(new Position(Number(args[0]),Number(args[1])));
        } catch {
            throw Error("input error");
        }
    }
}
