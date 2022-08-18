import Position from "./Position";
import Projectile from "./Projectile";

export default class DrawingInstruction implements Projectile {
    public _radius: number;
    public _speed: number;
    public _position: Position;
    public _target: Position;
    public _color : string;

    constructor(projectile : Projectile, color : string, mapWidth : number, mapHeight : number) {
        this._radius = projectile._radius / mapWidth;
        this._speed = projectile._speed / mapWidth;
        this._position = projectile._position.copy().convertToPercent(mapWidth,mapHeight);
        if (projectile._target) this._target = projectile._target.copy().convertToPercent(mapWidth,mapHeight);
        this._color = color;
    }
}