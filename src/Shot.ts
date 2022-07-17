import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";

export default class Shot implements Projectile{
    public position : Position;
    public target : Position;
    public speed : number;
    public sideLength : number;

    public expirationTime = 2;

    constructor(position : Position, target : Position, time : number, speed : number) {
        this.expirationTime = time;
        this.speed = speed;

        this.position = position;
        this.target = MyMath.extendToMaxRange(this.position,target,
            this.speed,this.expirationTime
        );
    }

    public move() : void {
        MyMath.move(this.position, this.target, this.speed);
    }
}