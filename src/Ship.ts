import MyMath from "./MyMath";
import Position from "./Position";
import Role from "./Role";

const MAP_WIDTH = 16;
const MAP_HEIGHT = 9;

export default class Ship {
    public health = 100;
    public sideLength = 0.2;
    public speed = 0.5;

    public captainCount = 1;
    public medicCount = 10;
    public shooterCount = 5;

    public static readonly captainTitle = "captain";
    public static readonly medicTitle = "medic";
    public static readonly shooterTitle = "shooter";
    public static readonly roleSelectKeyword = "select";

    public medicHeal = 1;
    public medicDiminishPercent = 0.5;

    public captain = new Role(this.captainCount, Ship.captainTitle);
    public medic = new Role(this.medicCount, Ship.medicTitle);
    public shooter = new Role(this.shooterCount, Ship.shooterTitle);

    public position : Position;
    public target : Position;


    constructor(position : Position = new Position(1,1)) {
        this.position = position.copy();
        this.target = position.copy();
    }

    public setTarget(newTarget : Position) : void {
        newTarget.x = Math.max(this.sideLength/2, newTarget.x);
        newTarget.x = Math.min(MAP_WIDTH - this.sideLength/2, newTarget.x);
        newTarget.y = Math.max(this.sideLength/2, newTarget.y);
        newTarget.y = Math.min(MAP_HEIGHT - this.sideLength/2, newTarget.y);

        this.target = newTarget.copy();
    }

    public move() : void {
        let xDiff = this.target.x - this.position.x;
        let yDiff = this.target.y - this.position.y;

        if ( (xDiff**2 + yDiff**2)**(1/2) <= this.speed) {
            this.position = this.target.copy()
        } else if (xDiff == 0) {
            this.position.y += this.speed * Math.sign(yDiff);
        } else {
            let angle = MyMath.round(Math.atan(yDiff/xDiff));
            this.position.x += Math.cos(angle) * this.speed * Math.sign(xDiff);
            this.position.y += Math.sin(angle) * this.speed * Math.sign(xDiff);
        }

        this.position.round()
    }

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
        for (let role of this.getRoles()) {
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        let requestedRole : Role;
        for (let role of this.getRoles()) {
            if (role.title == requestedRoleTitle) {
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

        switch (playerRole.title) {
            case Ship.captainTitle: 
               this.setTarget(new Position(Number(args[0]),Number(args[1])));
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

    private getRoles() : Role[] {
        return [this.captain, this.medic, this.shooter];
    }
}