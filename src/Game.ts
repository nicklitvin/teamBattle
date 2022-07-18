import MyMath from "./MyMath";
import Position from "./Position";
import Ship from "./Ship";

/**
 * Game stores ships and which ships each player is associated with.
 * Game processes player input accordingly. Cannot add players if no
 * ships exist.
 */
export default class Game {
    /** players = {PlayerId : ShipId} */
    public players : { [playerId : string]: string };
    public ships : { [shipId: string]: Ship };

    constructor() {
        this.players = {};
        this.ships = {};
    }

    public addPlayer(playerId : string, shipId : string) : void {
        if (Object.keys(this.ships).includes(shipId)) {
            this.players[playerId] = shipId;
        } else {
            // console.log("no such ship");
        }
    }

    public addShip(shipId : string, position? : Position) : void {
        this.ships[shipId] = new Ship(position);
        this.ships[shipId].setId(shipId);
    }

    public processPlayerInput(playerId : string, args : any[]) : void {
        try {
            let shipId = this.players[playerId];
            let ship = this.ships[shipId];
            ship.processPlayerInput(playerId,args);
        } catch {
            // console.log("inputError TEMPORARY");
        }
    }

    public update() : void {
        for (let ship of Object.values(this.ships)) {
            ship.move();
        }

        for (let ship of Object.values(this.ships)) {
            for (let enemy of Object.values(this.ships)) {
                if (ship.id == enemy.id) continue;

                for (let shotEntry of Object.entries(enemy.shots)) {
                    let shooter = shotEntry[0];
                    let shot = shotEntry[1];

                    if (MyMath.doCirclesIntersect(shot,ship)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);

                        if (!ship.health) {
                            delete this.ships[ship.id];
                        }
                    }
                }
            }
        }
    }
}