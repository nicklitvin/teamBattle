import MyMath from "./MyMath";
import Position from "./Position";
import {Projectile} from "./Projectile";

export default class Shot implements Projectile {
    public position : Position;
    public target : Position;
    public speed : number;
    public radius = 0.1;
    public expirationTime : number;

    constructor(position : Position, target : Position, time : number, speed : number) {
        this.expirationTime = time;
        this.speed = speed;

        this.position = position;
        this.target = MyMath.extendToMaxRange(this.position,target,
            this.speed,this.expirationTime
        );
    }

    public move() : void {
        this.position = MyMath.move(this.position, this.target, this.speed);
        this.expirationTime -= 1;
    }
}