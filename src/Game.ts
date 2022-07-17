import Ship from "./Ship";
import Position from "./Position";

/**
 * Game stores ships and which ships each player is associated with.
 * Game processes player input accordingly. Cannot add players if no
 * ships exist.
 */
export default class Game {
    // players = {PlayerId : ShipId}
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
            console.log("no such ship");
        }
    }

    public addShip(shipId : string) : void {
        this.ships[shipId] = new Ship(new Position(5,5));
    }

    public processPlayerInput(playerId : string, args : any[]) : void {
        try {
            let shipId = this.players[playerId];
            let ship = this.ships[shipId];
            ship.processPlayerInput(playerId,args);
        } catch {
            console.log("inputError TEMPORARY");
        }
    }
}