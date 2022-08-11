import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";

/**
 * A shot is a projectile that moves towards a particular target
 * and contains an expiration data for external purposes.
 */
export default class Shot implements Projectile {
    public _position : Position;
    public _target : Position;
    public _speed : number;
    public _radius = 0.1;
    public _expirationTime : number;

    constructor(position : Position, target : Position, time : number, speed : number) {
        this._expirationTime = time;
        this._speed = speed;

        this._position = position;
        this._target = MyMath.extendToMaxRange(this._position,target,
            this._speed,this._expirationTime
        );
    }

    public move() : void {
        this._position = MyMath.move(this._position, this._target, this._speed);
        this._expirationTime -= 1;
    }
}