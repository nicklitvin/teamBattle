import Position from "./Position";
import Projectile from "./Projectile";

export default class DrawingInstruction {
    public _radius: number;
    public _position: Position;
    public _color : string;

    constructor(projectile : Projectile, mapWidth : number, mapHeight : number) {
        this._radius = projectile._radius / mapWidth;
        this._position = projectile._position.copy().convertToPercent(mapWidth,mapHeight);
        this._color = projectile._color;
    }
}