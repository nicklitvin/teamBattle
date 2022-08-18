import MyMath from "./MyMath";

/**
 * A position stores (x,y)
 */
export default class Position {
    public x : number;
    public y : number;

    constructor(x : number, y : number) {
       this.x = x;
       this.y = y;
    }

    public round() : void {
        this.x = MyMath.round(this.x);
        this.y = MyMath.round(this.y);
    }

    public copy() : Position {
        return new Position(this.x, this.y);
    }
}