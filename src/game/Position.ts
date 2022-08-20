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

    /** Returns new position as percentages of the max width and height */
    public convertToPercent(maxWidth : number, maxHeight : number) {
        return new Position(this.x / maxWidth, this.y / maxHeight);
    }

    /**
     * Returns new position by multiplying x by maxWidth, and y by maxHeight.
     * To be used for positions that have been converted to percentages.
     */
    public expandByDimensions(maxWidth: number, maxHeight : number) {
        return new Position(this.x * maxWidth, this.y * maxHeight);
    } 
}