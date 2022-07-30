import Lobby from "../lobby/Lobby";
import Player from "../lobby/Player";
import Game from "./Game";

export default class GameManagerData {
    public games : {[lobbyId : string] : Game} = {};
    public players : {[playerId : string] : Player};
    public lobbies : {[lobbyId : string] : Lobby};
}