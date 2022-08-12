import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";
import Role from "./Role";
import Shot from "./Shot";
import * as SocketMessages from "../client/socketMessages.json";


/**
 * A ship is a projectile that can be used by players to take
 * certain actions, which it can process. The ship does not
 * keep track if a player belongs to a ship, but does recognize
 * if a player has taken a specific action. 
 * 
 * If position not specified, ship has default position.
 */

export default class Ship implements Projectile {
    public _id : string;
    public _radius = 0.2;
    public _speed = 0.5;
    public _position : Position;
    public _target : Position;
    public _health = 100;
    public _vision = 3;
    public _captainCount = 1;
    public _medicCount = 10;
    public _medicHeal = 1;
    public _medicDiminishPercent = 0.5;
    public _shooterCount = 5;
    public _shooterSpeed = 5;
    public _shooterExpirationTime = 1;
    public _shooterDamage = 10;
    public _scoutCount = 3;
    public _scoutSpeed = 3;
    public _scoutExpirationTime = 1;
    public _shotsSent : { [playerId : string] : Shot} = {};
    public _scoutsSent : { [playerId : string] : Shot} = {};
    public _captain = new Role(this._captainCount, SocketMessages.captainTitle);
    public _medic = new Role(this._medicCount, SocketMessages.medicTitle);
    public _shooter = new Role(this._shooterCount, SocketMessages.shooterTitle);
    public _scout = new Role(this._scoutCount, SocketMessages.scoutTitle);
    public _roles = [this._captain,this._medic,this._shooter,this._scout];
    public _mapWidth = 16;
    public _mapHeight = 9;

    constructor(position : Position = new Position(1,1)) {
        this._position = position.copy();
    }

    public setId(id : string) {
        this._id = id;
    }

    public setTarget(newTarget : Position)  {
        newTarget.x = Math.max(this._radius, newTarget.x);
        newTarget.x = Math.min(this._mapWidth - this._radius, newTarget.x);
        newTarget.y = Math.max(this._radius, newTarget.y);
        newTarget.y = Math.min(this._mapHeight - this._radius, newTarget.y);

        this._target = newTarget.copy();
    }

    /**
     * Moves ship and all of its projectiles. Projectiles are removed when 
     * their expiration time = 0
     */
    public move()  {
        if (this._target) {
            this._position = MyMath.move(
                this._position, this._target, this._speed
            );
        }

        for (let entry of Object.entries(this._shotsSent)) {
            let playerId = entry[0];
            let shot = entry[1];

            shot.move();
            if (!shot._expirationTime) {
                delete this._shotsSent[playerId];
            }
        }
        for (let entry of Object.entries(this._scoutsSent)) {
            let playerId = entry[0];
            let scout = entry[1];

            scout.move();
            if (!scout._expirationTime) {
                delete this._scoutsSent[playerId];
            }
        }
    }

    /**
     * Takes in player input and performs action if possible.
     * 
     * ex: args = [roleSelectKeyword, roleTitle] or [x,y]
     * 
     * @param playerId 
     * @param args 
     */
    public processPlayerInput(playerId : string, args : any[])  {
        try {
            if (args[0] == SocketMessages.roleSelectKeyword) {
                this.processPlayerSelect(playerId,args[1]);
            } else {
                this.processPlayerRoleInput(playerId,args);
            }
        } catch {
            // console.log("player input error");
        }
    }

    /**
     * Adds player to list of members with a particular role if the role is
     * not full. A player cannot be added if they have shot a projectile that
     * has not expired.
     * 
     * @param playerId 
     * @param role 
     */
    private processPlayerSelect(playerId : string, requestedRoleTitle : string) {
        if (
            Object.keys(this._shotsSent).includes(playerId) ||
            Object.keys(this._scoutsSent).includes(playerId)) 
        {
            return
        } 
        for (let role of this._roles) {
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        let requestedRole : Role;
        for (let role of this._roles) {
            if (role.title == requestedRoleTitle) {
                requestedRole = role;
                break;
            }
        }
        if (!requestedRole.isFull()) requestedRole.addPlayer(playerId);
    }

    /**
     * Takes player input and takes the action associatd with their role.
     * Does not do anything if the player does not have a role.
     * 
     * @param playerId 
     * @param args 
     */
    private processPlayerRoleInput(playerId : string, args : any[])  {
        let playerRole : Role;
        for (let role of this._roles) {
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }

        switch (playerRole.title) {
            case SocketMessages.captainTitle: 
               this.setTarget(new Position(Number(args[0]),Number(args[1])));
               break;
            case SocketMessages.shooterTitle: {
                if (this.isShotAvailable(playerId)) {
                    this.shootProjectile(
                        playerId,
                        new Position(Number(args[0]),Number(args[1]))
                    );
                }
                break;
            }
            case SocketMessages.scoutTitle: {
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

    /**
     * Heals ship with diminishing results based on number of players 
     * with medic role. Health capped at 100.
     */
    public heal()  {
        let medics = this._medic.getPlayerCount();
        if (medics) {
            let heal = this._medicHeal * 
                (1 - this._medicDiminishPercent ** medics) / 
                (1 - this._medicDiminishPercent);
            this._health = Math.min(100,this._health + heal);
        }
    }

    public isShotAvailable(playerId : string) : boolean {
        if (this._shotsSent[playerId]) {
            return false;
        }
        return true; 
    } 

    public isScoutAvailable(playerId : string) : boolean {
        if (this._scoutsSent[playerId]) {
            return false;
        }
        return true; 
    }

    public shootProjectile(playerId : string, target : Position)  {
        this._shotsSent[playerId] = new Shot(
            this._position,
            target,
            this._shooterExpirationTime,
            this._shooterSpeed
        );
    }

    public sendScout(playerId : string, target : Position)  {
        this._scoutsSent[playerId] = new Shot(
            this._position,
            target,
            this._scoutExpirationTime,
            this._scoutSpeed
        );
    }

    public takeDamage()  {
        this._health -= this._shooterDamage;
    }

    public deleteShot(playerId : string) {
        delete this._shotsSent[playerId];
    }
}