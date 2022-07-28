import MyMath from "./MyMath";
import Position from "./Position";
import {Projectile,ProjectileContainer} from "./Projectile";
import Role from "./Role";
import ShipData from "./ShipData";
import Shot from "./Shot";

export default class Ship implements ProjectileContainer {
    private _data = new ShipData();
    private _mapWidth = 16;
    private _mapHeight = 9;

    public static readonly captainTitle = "captain";
    public static readonly medicTitle = "medic";
    public static readonly shooterTitle = "shooter";
    public static readonly scoutTitle = "scout";
    public static readonly roleSelectKeyword = "select";

    constructor(position : Position = new Position(1,1)) {
        this._data.position = position.copy();
    }

    public setTarget(newTarget : Position) : void {
        newTarget.x = Math.max(this._data.radius, newTarget.x);
        newTarget.x = Math.min(this._mapWidth - this._data.radius, newTarget.x);
        newTarget.y = Math.max(this._data.radius, newTarget.y);
        newTarget.y = Math.min(this._mapHeight - this._data.radius, newTarget.y);

        this._data.target = newTarget.copy();
    }

    public move() : void {
        if (this._data.target) {
            this._data.position = MyMath.move(
                this._data.position, this._data.target, this._data.speed
            );
        }

        for (let entry of Object.entries(this._data.shotsSent)) {
            let playerId = entry[0];
            let shot = entry[1];

            shot.move();
            if (!shot.expirationTime) this.deleteShot(playerId); 

        }
        for (let entry of Object.entries(this._data.scoutsSent)) {
            let playerId = entry[0];
            let scout = entry[1];

            scout.move();
            if (!scout.expirationTime) this.deleteScout(playerId); 
        }
    }

    /**
     * Takes in player input and performs action if possible.
     * 
     * ex: args = [Ship.selectKeyword, Ship.roleTitle] or [x,y]
     * 
     * @param playerId 
     * @param args 
     */
    public processPlayerInput(playerId : string, args : any[]) : void {
        try {
            if (args[0] == Ship.roleSelectKeyword) {
                this.processPlayerSelect(playerId,args[1]);
            } else {
                this.processPlayerRoleInput(playerId,args);
            }
        } catch {
            // console.log("player input error");
        }
    }

    /**
     * Removes player's curent role and gives player requested role if possible.
     * 
     * @param playerId 
     * @param role 
     */
    private processPlayerSelect(playerId : string, requestedRoleTitle : string)
        : void 
    {
        if (
            Object.keys(this._data.shotsSent).includes(playerId) ||
            Object.keys(this._data.scoutsSent).includes(playerId)) 
        {
            return
        } 
        for (let role of this._data.roles) {
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        let requestedRole : Role;
        for (let role of this._data.roles) {
            if (role.title == requestedRoleTitle) {
                requestedRole = role;
                break;
            }
        }
        if (!requestedRole.isFull()) requestedRole.addPlayer(playerId);
    }

    private processPlayerRoleInput(playerId : string, args : any[]) : void {
        let playerRole : Role;
        for (let role of this._data.roles) {
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }

        switch (playerRole.title) {
            case Ship.captainTitle: 
               this.setTarget(new Position(Number(args[0]),Number(args[1])));
               break;
            case Ship.shooterTitle: {
                if (this.isShotAvailable(playerId)) {
                    this.shootProjectile(
                        playerId,
                        new Position(Number(args[0]),Number(args[1]))
                    );
                }
                break;
            }
            case Ship.scoutTitle: {
                if (this.isScoutAvailable(playerId)) {
                    this.sendScout(
                        playerId,
                        new Position(Number(args[0]),Number(args[1]))
                    );
                }
                break;
            }
        }
    }

    public heal() : void {
        let medics = this._data.medic.getPlayerCount();
        if (medics) {
            let heal = this._data.medicHeal * 
                (1 - this._data.medicDiminishPercent ** medics) / 
                (1 - this._data.medicDiminishPercent);
            this._data.health = Math.min(100,this._data.health + heal);
        }
    }

    public isShotAvailable(playerId : string) : boolean {
        if (this._data.shotsSent[playerId]) {
            return false;
        }
        return true; 
    } 

    public isScoutAvailable(playerId : string) : boolean {
        if (this._data.scoutsSent[playerId]) {
            return false;
        }
        return true; 
    }

    public shootProjectile(playerId : string, target : Position) : void {
        this._data.shotsSent[playerId] = new Shot(
            this._data.position,
            target,
            this._data.shooterExpirationTime,
            this._data.shooterSpeed
        );
    }

    public sendScout(playerId : string, target : Position) : void {
        this._data.scoutsSent[playerId] = new Shot(
            this._data.position,
            target,
            this._data.scoutExpirationTime,
            this._data.scoutSpeed
        );
    }

    public deleteShot(playerId : string) : void {
        delete this._data.shotsSent[playerId];
    }

    public deleteScout(playerId: string) : void {
        delete this._data.scoutsSent[playerId];
    }

    public takeDamage() : void {
        this._data.health -= this._data.shooterDamage;
    }

    /**
     * @returns all ship data (NOT A COPY)
     */
    public getData() : ShipData {
        return this._data;
    }

    public getProjectileData() : Projectile {
        return this._data;
    }
}