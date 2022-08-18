import MyMath from "./MyMath.js";
/**
 * A position stores (x,y)
 */
export default class Position {
    constructor(x, y) {
       this.x = x;
       this.y = y;
    }

    round() {
        this.x = MyMath.round(this.x);
        this.y = MyMath.round(this.y);
    }

    copy() {
        return new Position(this.x, this.y);
    }
}