import { Server } from "socket.io";
import Game from "../game/Game";
import GameManager from "../game/GameManager";
import Lobby from "./Lobby";
import Player from "./Player";

export default class LobbyManagerData {
    /** socketId : playerId */
    public sockets : {[socketId : string] : string} = {};
    public players : {[playerId : string] : Player} = {};
    public lobbies : {[lobbyId : string] : Lobby} = {};
    
    public gameManager : GameManager;
    public lobbyIdLength = 6;

    constructor(io : Server) {
        this.gameManager = new GameManager(io,this.players,this.lobbies);
    }
}