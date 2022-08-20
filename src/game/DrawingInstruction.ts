import Position from "./Position";
import Projectile from "./Projectile";

/**
 * A drawing instruction contains all information necessary to draw the object.
 */
export default class DrawingInstruction {
    public _radius: number;
    public _position: Position;
    public _color : string;

    constructor(projectile : Projectile, mapWidth : number, mapHeight : number) {
        this._radius = projectile._radius / mapWidth;
        this._position = projectile._position.copy().
            convertToPercent(mapWidth,mapHeight);
        this._color = projectile._color;
    }
}