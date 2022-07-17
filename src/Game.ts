import Ship from "./Ship";
import Position from "./Position";

export default class Game {
    // players = {PlayerId : ShipId}
    public players : { [playerId : string]: string };
    public ships : { [shipId: string]: Ship };

    constructor() {
        this.players = {};
        this.ships = {};
    }

    public addPlayer(playerId : string, shipId : string) : void {
        this.players[playerId] = shipId;
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
            throw Error("inputError TEMPORARY");
        }
    }
}