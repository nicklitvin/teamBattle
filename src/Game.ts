import Ship from "./Ship";
import Position from "./Position";

export default class Game {
    public players : { [playerId : string]: string };
    public ships : { [shipId: string]: Ship };

    constructor() {
        this.players = {};
        this.ships = {};
    }

    public addPlayer(playerId : string, shipId : string) : void {
        this.players[playerId] = shipId;
    }

    public addShip(shipId : string) {
        this.ships[shipId] = new Ship(new Position(5,5));
    }
}