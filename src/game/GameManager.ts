import { Server, Socket } from "socket.io";
import Game from "./Game";
import GameManagerData from "./GameManagerData";
import * as SocketMessages from "../client/socketMessages.json";
import LobbyManagerData from "../lobby/LobbyManagerData";
import Lobby from "../lobby/Lobby";
import SocketWrap from "../socketWrap";

export default class GameManager {
    private _data = new GameManagerData();

    constructor(io : Server, data : LobbyManagerData) {
        this._data.lobbyData = data;

        io.on("connection", (socket : Socket) => {
            let socketWrap = new SocketWrap(socket);

            socket.on(SocketMessages.disconnect, () => {
                try {
                    this.socketLeaveGame(socketWrap);
                } catch {
                    // console.log("error leaving game");
                }
            })
            socket.on(SocketMessages.joinGame, (...args) => {
                try {
                    let id = args[0];
                    let lobbyId = args[1];
                    this.socketJoinGame(socketWrap,id,lobbyId);
                } catch {
                    console.log("GameManager.joinGame error");
                }
            })
            socket.on(SocketMessages.gameInput, (...args) => {
                try {
                    this.socketProcessGameInput(socketWrap,args);
                } catch {
                    console.log("GameManager.processinput error");
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
            } else if (this._data.automaticGameEnd) {
                this.endGame(lobby);
            }
        }, this._data.transitionTime);
    }

    public socketJoinGame(socketWrap : SocketWrap, playerId : string, lobbyId : string) {
        let lobby = this._data.lobbyData.lobbies[lobbyId];

        if (lobby && lobby.getData().players.has(playerId)) {
            this._data.lobbyData.sockets[socketWrap.id] = playerId;
            let player = this._data.lobbyData.players[playerId];
            player.socketWrap = socketWrap;
            player.online = true;
            console.log("player joined game",playerId);
        } else {
            socketWrap.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("player cant join game");
        }
    }

    public socketLeaveGame(socketWrap : SocketWrap) {
        let leaverId = this._data.lobbyData.sockets[socketWrap.id];
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

            delete this._data.lobbyData.sockets[player.socketWrap.id];
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
                delete this._data.lobbyData.sockets[player.socketWrap.id];
                delete this._data.lobbyData.players[playerId];
            } else {
                player.socketWrap.emit(SocketMessages.showReturnButton);
            }
        }
    }

    public socketProcessGameInput(socketWrap : SocketWrap, ...args : any) {
        let playerId = this._data.lobbyData.sockets[socketWrap.id];
        if (playerId) {
            let player = this._data.lobbyData.players[playerId];
            let lobbyData = this._data.lobbyData.lobbies[player.lobbyId].getData();
            let game = this._data.games[player.lobbyId];
            
            if (lobbyData.inGame && !lobbyData.transition) {
                game.processPlayerInput(playerId,args);
            }
        }
    }
    
    public getData() {
        return this._data;
    }
}