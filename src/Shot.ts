import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";

export default class Shot implements Projectile{
    private position : Position;
    private target : Position;
    private speed : number;
    private radius = 0.1;
    private expirationTime : number;

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
    }

    public reduceExpirationTime() : void {
        this.expirationTime -= 1;
    }

    public getRadius() {return this.radius;}
    public getSpeed() {return this.speed;}
    public getPosition(){return this.position;}
    public getTarget() {return this.target;}
    public getExpiration() {return this.expirationTime;}
}