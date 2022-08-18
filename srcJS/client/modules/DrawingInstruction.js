import Position from "./Position.js";

export default class DrawingInstruction {
    constructor(projectile, color) {
        this._radius = projectile._radius;
        this._speed = projectile._speed;
        this._position = projectile._position;
        this._target = projectile._target;
        this._color = color;
    }

    static make(info) {
        let projectile = {
            _radius: info._radius,
            _speed: info._speed,
            _position: new Position(info._position.x,info._position.y)
        }

        if (info._target) {
            projectile._target = new Position(info._target.x,info._target.y);
        } else {
            projectile._target = new Position(info._position.x,info._position.y);
        }
        return new DrawingInstruction(projectile,info._color);
    }
}