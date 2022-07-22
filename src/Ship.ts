import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";
import Role from "./Role";
import Shot from "./Shot";

const MAP_WIDTH = 16;
const MAP_HEIGHT = 9;

export default class Ship implements Projectile {
    private id : string;

    private health = 100;
    private radius = 0.2;
    private speed = 0.5;

    private captainCount = 1;

    private medicCount = 10;
    private medicHeal = 1;
    private medicDiminishPercent = 0.5;

    private shooterCount = 5;
    private shotSpeed = 5;
    private shotExpirationTime = 1;
    private shotDamage = 10;

    private scoutCount = 3;
    private scoutSpeed = 3;
    private scoutExpirationTime = 1;

    /** Add this.ROLEtitle to this.getRoles to work properly */
    public static readonly captainTitle = "captain";
    public static readonly medicTitle = "medic";
    public static readonly shooterTitle = "shooter";
    public static readonly scoutTitle = "scout";
    public static readonly roleSelectKeyword = "select";

    private shots : { [playerId : string] : Shot} = {};
    private scouts : { [playerId : string] : Shot} = {};

    private captain = new Role(this.captainCount, Ship.captainTitle);
    private medic = new Role(this.medicCount, Ship.medicTitle);
    private shooter = new Role(this.shooterCount, Ship.shooterTitle);
    private scout = new Role(this.scoutCount, Ship.scoutTitle);

    private position : Position;
    private target : Position;

    constructor(position : Position = new Position(1,1)) {
        this.position = position.copy();
        this.target = position.copy();
    }

    public setTarget(newTarget : Position) : void {
        newTarget.x = Math.max(this.radius, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.radius, newTarget.x);
        newTarget.y = Math.max(this.radius, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.radius, newTarget.y);

        this.target = newTarget.copy();
    }

    public move() : void {
        this.position = MyMath.move(this.position, this.target, this.speed);

        for (let entry of Object.entries(this.shots)) {
            let playerId = entry[0];
            let shot = entry[1];

            shot.move();
            shot.reduceExpirationTime();
            if (!shot.getExpiration()) this.deleteShot(playerId); 
        }
    }

    /**
     * Takes in player input and performs action if possible.
     * 
     * ex:
     * 
     * args = [Ship.selectKeyword, Ship.roleTitle]
     * 
     * args = [x,y]
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
            // console.log("input error");
        }
    }

    /**
     * Removes player's curent role and gives player requested role if possible.
     * 
     * @param playerId 
     * @param role 
     */
    private processPlayerSelect(playerId : string, requestedRoleTitle : string) : void {
        if (
            Object.keys(this.shots).includes(playerId) ||
            Object.keys(this.scouts).includes(playerId)) 
        {
            return
        } 

        for (let role of this.getRoles()) {
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        let requestedRole : Role;
        for (let role of this.getRoles()) {
            if (role.getTitle() == requestedRoleTitle) {
                requestedRole = role;
                break;
            }
        }
        if (!requestedRole.isFull()) requestedRole.addPlayer(playerId);
    }

    private processPlayerRoleInput(playerId : string, args : any[]) : void {
        let playerRole : Role;
        for (let role of this.getRoles()) {
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }

        switch (playerRole.getTitle()) {
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
        let medics = this.medic.getPlayerCount();
        if (medics) {
            let heal = this.medicHeal * 
                (1 - this.medicDiminishPercent ** medics) / 
                (1 - this.medicDiminishPercent);
            this.health = Math.min(100,this.health + heal);
        }
    }

    public getRoles() : Role[] {
        return [this.captain, this.medic, this.shooter, this.scout];
    }

    public isShotAvailable(playerId : string) : boolean {
        if (this.shots[playerId]) {
            return false;
        }
        return true; 
    } 

    public isScoutAvailable(playerId : string) : boolean {
        if (this.scouts[playerId]) {
            return false;
        }
        return true; 
    }

    public shootProjectile(playerId : string, target : Position) : void {
        this.shots[playerId] = new Shot(
            this.position,
            target,
            this.shotExpirationTime,
            this.shotSpeed
        );
    }

    public sendScout(playerId : string, target : Position) : void {
        this.scouts[playerId] = new Shot(
            this.position,
            target,
            this.scoutExpirationTime,
            this.scoutSpeed
        );
    }

    public deleteShot(playerId : string) : void {
        delete this.shots[playerId];
    }

    public deleteScout(playerId: string) : void {
        delete this.scouts[playerId];
    }

    public takeDamage() : void {
        this.health -= this.shotDamage;
    }

    // SET AND GET FUNCTIONS
    public setId(id : string) : void {this.id = id;}

    public setHealth(health : number) {this.health = health;}
    public setRadius(radius : number) {this.radius = radius;}
    public setSpeed(speed : number) {this.speed = speed}
    
    public setScoutCount(count : number) {this.scoutCount = count;}
    public setScoutSpeed(speed : number) {this.scoutSpeed = speed;}
    public setScoutExpiration(time : number) {this.scoutExpirationTime = time;}

    public setShooterCount(count : number) {this.shooterCount = count;}
    public setShooterSpeed(speed : number) {this.shotSpeed = speed;}
    public setShooterExpiration(time : number) {this.shotExpirationTime = time;}

    public setMedicCount(count : number) {this.medicCount = count;}
    public setMedicHeal(heal : number) {this.medicHeal = heal;}
    public setMedicDiminish(percent : number) {this.medicDiminishPercent = percent;}

    public setCaptainCount(count : number) {this.captainCount = count;}

    public setPosition(pos : Position) {this.position = pos;}

    public getId() {return this.id}
    public getShots() { return {...this.shots};}
    public getScouts() {return {...this.scouts};}
    public getHealth() {return this.health;}
    public getRadius() {return this.radius;}
    public getSpeed() {return this.speed;}
    public getPosition() {return this.position;}
    public getTarget() {return this.target;}
    public getShooterDamage() {return this.shotDamage;}

    /**
     * @param role 
     * @returns clone of roleTitle and its properties
     */
    public getRole(role : string) : Role {
        switch (role) {
            case Ship.captainTitle:
                return this.captain;
                // return structuredClone(this.captain);
            case Ship.scoutTitle:
                return this.scout;
                // return structuredClone(this.scout);
            case Ship.medicTitle:
                return this.medic;
                // return structuredClone(this.medic);
            case Ship.shooterTitle:
                return this.shooter;
                // return structuredClone(this.shooter);
            default:
                return null;            
        }
    }

}