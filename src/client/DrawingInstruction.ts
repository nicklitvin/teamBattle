import Position from "./Position";
import Projectile from "./Projectile";

export default class DrawingInstruction implements Projectile {
    public _radius: number;
    public _speed: number;
    public _position: Position;
    public _target: Position;
    public _color : string;

    constructor(projectile : Projectile, color : string) {
        this._radius = projectile._radius;
        this._speed = projectile._speed;
        this._position = projectile._position;
        this._target = projectile._target;
        this._color = color;
    }
}