import Lobby from "./Lobby";
import Player from "./Player";

export default class LobbyManagerData {
    /** socketId : playerId */
    public sockets : {[socketId : string] : string} = {};
    public players : {[playerId : string] : Player} = {};
    public lobbies : {[lobbyId : string] : Lobby} = {};

    public lobbyIdLength = 6;
}