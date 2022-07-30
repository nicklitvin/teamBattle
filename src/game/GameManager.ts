import { Server, Socket } from "socket.io";
import Game from "./Game";
import GameManagerData from "./GameManagerData";
import * as SocketMessages from "../client/socketMessages.json";
import Player from "../lobby/Player";
import Lobby from "../lobby/Lobby";

export default class GameManager {
    private _data = new GameManagerData();

    constructor(io : Server, players : {[playerId : string] : Player}, lobbies : {[lobbyId : string] : Lobby}) {
        this._data.players = players;
        this._data.lobbies = lobbies;

        io.on("connection", (socket : Socket) => {
            socket.on(SocketMessages.joinGame, (...args) => {
                try {
                    let id = args[0];
                    let lobbyId = args[1];
                    this.socketJoinGame(id,lobbyId,socket);
                } catch {
                    console.log("player cant join game");
                }
            })
        })
    }

    public startGame(lobbyId : string) {
        this._data.games[lobbyId] = new Game();
    }

    public socketJoinGame(id : string, lobbyId : string, socket : Socket) {
        if (this._data.lobbies[lobbyId].getData().players.has(id)) {
            this._data.players[id].socket = socket;
            console.log("player joined game",id);
        }
    }
}