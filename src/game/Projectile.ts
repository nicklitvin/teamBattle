import Position from "./Position";

/**
 * A projectile is an interface which is used for objects that
 * move towards a particular target and may collide with other
 * projectiles.
 */
export default interface Projectile {
    _speed : number;
    _radius : number;
    _color : string;
    _position : Position;
    _target : Position;
}