import { Server, Socket } from "socket.io";
import Game from "./Game";
import GameManagerData from "./GameManagerData";
import * as SocketMessages from "../client/socketMessages.json";
import LobbyManagerData from "../lobby/LobbyManagerData";
import Lobby from "../lobby/Lobby";

export default class GameManager {
    private _data = new GameManagerData();

    constructor(io : Server, data : LobbyManagerData) {
        this._data.lobbyData = data;

        io.on("connection", (socket : Socket) => {
            socket.on(SocketMessages.disconnect, () => {
                try {
                    this.socketLeaveGame(socket);
                } catch {
                    // console.log("error leaving game");
                }
            })
            socket.on(SocketMessages.joinGame, (...args) => {
                try {
                    let id = args[0];
                    let lobbyId = args[1];
                    this.socketJoinGame(id,lobbyId,socket);
                } catch {
                    console.log("GameManager.joinGame error");
                }
            })
        })
    }

    public startGame(lobbyId : string) {
        let game = new Game();
        let lobby = this._data.lobbyData.lobbies[lobbyId];
        this._data.games[lobbyId] = game;

        setTimeout( () => {
            console.log("checking if all gone");
            lobby.endTransitionPhase();
            if (this.areAllOffline(lobby)) {
                this.deleteLobby(lobby);
            } else {
                this.endGame(lobby); // TEMPORARY for testing
            }
        }, this._data.transitionTime);
    }

    public socketJoinGame(playerId : string, lobbyId : string, socket : Socket) {
        let lobby = this._data.lobbyData.lobbies[lobbyId];

        if (lobby && lobby.getData().players.has(playerId)) {
            this._data.lobbyData.sockets[socket.id] = playerId;
            let player = this._data.lobbyData.players[playerId];
            player.socket = socket;
            player.online = true;
            console.log("player joined game",playerId);
        } else {
            socket.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("player cant join game");
        }
    }

    public socketLeaveGame(socket : Socket) {
        let leaverId = this._data.lobbyData.sockets[socket.id];
        let player = this._data.lobbyData.players[leaverId];
        let lobby = this._data.lobbyData.lobbies[player.lobbyId];
        let lobbyData = lobby.getData();

        if (lobbyData.inGame) {
            player.online = false;
            console.log("player goes offline");

            if (lobbyData.transition) {
                return;
            } else if (this.areAllOffline(lobby)) {
                this.deleteLobby(lobby);
            }
        }
    }

    public areAllOffline(lobby : Lobby) {
        let lobbyData = lobby.getData();
        let playerIds = lobbyData.players.values();
        let allOffline = true;

        while (true) {
            let next = playerIds.next();
            let playerId = next.value;
            let done = next.done;
            
            if (done) break;

            if (this._data.lobbyData.players[playerId].online) {
                allOffline = false;
                break;
            }
        }

        return allOffline;
    }

    public deleteLobby(lobby : Lobby) {
        let lobbyId = lobby.getData().id;
        let playerIds = lobby.getData().players.values();

        while (true) {
            let next = playerIds.next();
            let playerId = next.value;
            let done = next.done;
            
            if (done) break;

            let player = this._data.lobbyData.players[playerId];

            delete this._data.lobbyData.sockets[player.socket.id];
            delete this._data.lobbyData.players[playerId];
        }
        delete this._data.lobbyData.lobbies[lobbyId];
        delete this._data.games[lobbyId];
        console.log("deleting lobby",lobbyId);
    }

    public endGame(lobby : Lobby) {
        lobby.switchBackFromInGameStatus();

        let lobbyData = lobby.getData();
        let playerIds = lobbyData.players.values();

        while (true) {
            let next = playerIds.next();
            let playerId = next.value;
            let done = next.done;
            
            if (done) break;

            let player = this._data.lobbyData.players[playerId];
            if (!player.online) {
                lobby.removePlayer(playerId);
                delete this._data.lobbyData.sockets[player.socket.id];
                delete this._data.lobbyData.players[playerId];
            } else {
                player.socket.emit(SocketMessages.showReturnButton);
            }
        }
    }
}