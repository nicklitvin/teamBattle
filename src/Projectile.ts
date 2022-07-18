import Position from "./Position";

export default interface Projectile {
    position : Position;
    target : Position;
    speed : number;
    radius : number;
    move() : void;
}