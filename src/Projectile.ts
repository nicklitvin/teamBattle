import Position from "./Position";

export default interface Projectile {
    move() : void;
    getSpeed() : number;
    getRadius() : number;
    getPosition() : Position;
    getTarget() : Position;
}