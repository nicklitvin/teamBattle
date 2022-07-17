import Position from "./Position";

export default interface Projectile {
    position : Position;
    target : Position;
    speed : number;
    sideLength : number;
    move() : void;
}