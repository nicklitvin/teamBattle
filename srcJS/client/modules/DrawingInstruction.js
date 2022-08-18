export default class DrawingInstruction {
    constructor(projectile, color) {
        this._radius = projectile._radius;
        this._speed = projectile._speed;
        this._position = projectile._position.copy();
        if (projectile._target) this._target = projectile._target.copy();
        this._color = color;
    }
}