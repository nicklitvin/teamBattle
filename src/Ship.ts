import MyMath from "./MyMath";
import Position from "./Position";
import Role from "./Role";

const MAP_WIDTH = 16;
const MAP_HEIGHT = 9;

const CAPTAIN_COUNT = 1;
const CAPTAIN_TITLE = "captain";
const ROLE_SELECT_KEYWORD = "select";

export default class Ship {
    public health = 100;
    public sideLength = 0.2;
    public angle = 0;
    public speed = 0.5;

    public captain = new Role(CAPTAIN_COUNT, CAPTAIN_TITLE);
    private roles = [this.captain]

    public position : Position;
    public target : Position;

    constructor(position : Position) {
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
            if (args[0] == ROLE_SELECT_KEYWORD) {
                this.processPlayerSelect(playerId,args[1]);
            } else {
                this.processPlayerRoleInput(playerId,args);
            }
        } catch {
            console.log("input error");
        }
    }

    /**
     * Removes player's curent role and gives player requested role if possible.
     * 
     * @param playerId 
     * @param role 
     */
    private processPlayerSelect(playerId : string, role : string) : void {
        for (let role of this.roles) {
            if (role.isPlayerHere(playerId)) {
                role.removePlayer(playerId);
                break;
            }
        }
        switch (role) {
            case CAPTAIN_TITLE : {
                if (!this.captain.isFull()) this.captain.addPlayer(playerId);
            }
        }
    }

    private processPlayerRoleInput(playerId : string, args : any[]) : void {
        let playerRole : Role;
        for (let role of this.roles) {
            if (role.isPlayerHere(playerId)) {
                playerRole = role;
                break;
            }
        }

        switch (playerRole.title) {
            case CAPTAIN_TITLE: 
               this.setTarget(new Position(Number(args[0]),Number(args[1])));
        }
    }
}
