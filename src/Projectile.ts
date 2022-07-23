import Position from "./Position";

export interface Projectile {
    speed : number;
    radius : number;
    position : Position;
    target : Position;
}

export interface ProjectileContainer {
    getProjectileData() : Projectile;
}