import Position from "./Position";
import {Projectile} from "./Projectile";
import Role from "./Role";
import Shot from "./Shot";
import * as SocketMessages from "../client/socketMessages.json";

export default class ShipData implements Projectile {
    public id : string;

    public radius = 0.2;
    public speed = 0.5;
    public position : Position;
    public target : Position;

    public health = 100;
    public vision = 3;

    public captainCount = 1;

    public medicCount = 10;
    public medicHeal = 1;
    public medicDiminishPercent = 0.5;

    public shooterCount = 5;
    public shooterSpeed = 5;
    public shooterExpirationTime = 1;
    public shooterDamage = 10;

    public scoutCount = 3;
    public scoutSpeed = 3;
    public scoutExpirationTime = 1;

    public shotsSent : { [playerId : string] : Shot} = {};
    public scoutsSent : { [playerId : string] : Shot} = {};

    public captain = new Role(this.captainCount, SocketMessages.captainTitle);
    public medic = new Role(this.medicCount, SocketMessages.medicTitle);
    public shooter = new Role(this.shooterCount, SocketMessages.shooterTitle);
    public scout = new Role(this.scoutCount, SocketMessages.scoutTitle);

    public roles = [this.captain,this.medic,this.shooter,this.scout];
}