import { Server } from "socket.io";
import Game from "./Game";
import GameManagerData from "./GameManagerData";

export default class GameManager {
    private static _data = new GameManagerData();

    constructor(io : Server) {
    }

    public static startGame(lobbyId : string) {
        this._data.games[lobbyId] = new Game();
    }   
}