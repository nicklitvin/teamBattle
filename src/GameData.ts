import Ship from "./Ship";

export default class GameData {
    /** players = {PlayerId : ShipId} */
    public players : { [playerId : string]: string } = {};
    public ships : { [shipId: string]: Ship } = {};
}