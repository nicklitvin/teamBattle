import { Server, Socket } from "socket.io";
import LobbyManagerData from "./LobbyManagerData";
import * as hash from "object-hash";
import Lobby from "./Lobby";
import * as SocketMessages from "../client/socketMessages.json";
import Player from "./Player";

export default class LobbyManager {
    private _data : LobbyManagerData;

    constructor(io : Server) {
        this._data = new LobbyManagerData(io);
        this.setupIoCommunication(io);
    }

    private setupIoCommunication(io : Server) : void {
        io.on("connection", (socket : Socket) => {
            socket.on(SocketMessages.disconnect, () => {
                this.socketRemovePlayer(socket);
            })
            socket.on(SocketMessages.createLobby, () => {
                this.socketCreateLobby(socket);
            })
            socket.on(SocketMessages.joinLobby, (...args) => {
                try {
                    let lobbyId : string = args[0];
                    this.socketJoinLobby(socket,lobbyId);
                } catch {
                    console.log("error join");
                }
            })
            socket.on(SocketMessages.startGame, () => {
                try {
                    this.socketStartGame(socket);
                } catch {
                    console.log("not legit start");
                }
            })
        })
    }

    public socketCreateLobby(socket : Socket) {
        let lobby = this.createLobby(socket.id);
        this.sendPlayerToLobby(socket,lobby);
        console.log("creating lobby",lobby.getData().id);
    }
    
    public createLobby(socketId : string) : Lobby {
        let id = this.createId(socketId);
        let lobby = new Lobby(id);

        this._data.lobbies[id] = lobby;
        return lobby;
    }

    private sendPlayerToLobby(socket : Socket, lobby : Lobby) {
        socket.emit(SocketMessages.redirect, lobby.getData().redirectToLobby);
    }

    public createId(id : string) : string {
        while (true) {
            id = id.substring(0,this._data.lobbyIdLength);
            if (Object.keys(this._data.lobbies).includes(id)) {
                id = hash.sha1(id);
            } else {
                break;
            }
        }
        console.log("created id",id);
        return id;
    }

    public getData() : LobbyManagerData {
        return this._data;
    }

    public socketJoinLobby(socket : Socket, lobbyId : string) {
        let lobby = this._data.lobbies[lobbyId];
        if (lobby && !lobby.getData().inGame) {
            this._data.sockets[socket.id] = socket.id;
            this._data.players[socket.id] = new Player(lobbyId,socket);

            socket.emit(SocketMessages.setId,socket.id);
            
            let lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socket.id);

            this.sendLobbyUpdate(lobby);

            console.log("player joined",socket.id);
        } else {
            socket.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("cant join room",lobbyId);
        }
    }

    public socketRemovePlayer(socket : Socket) {
        if (this._data.sockets[socket.id]) {
            let playerId = this._data.sockets[socket.id];
            let player = this._data.players[playerId];
            let lobby = this._data.lobbies[player.lobbyId];

            if (lobby.getData().inGame) {
                player.online = false;
                return;
            }

            lobby.removePlayer(playerId);
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room",lobby.getData().id);
                delete this._data.lobbies[lobby.getData().id];
            } else {
                this.sendLobbyUpdate(lobby);
            }

            delete this._data.sockets[socket.id];
            delete this._data.players[playerId];

            console.log("removing player, global players left: ",
                Object.keys(this._data.players).length
            );
        }
    }

    public sendLobbyUpdate(lobby : Lobby) {
        let data = lobby.getData();
        let players = data.players.values();
        let captain = data.captain;
        let text = data.countText;

        while (true) {
            let next = players.next();
            let playerId = next.value;
            let done = next.done;
            
            if (done) break;

            let socket = this._data.players[playerId].socket;
            socket.emit(SocketMessages.countUpdate,text);
            
            if (playerId == captain) {
                socket.emit(SocketMessages.captainPower);
            }
        }
    }

    public socketStartGame(socket : Socket) {
        let captainId = this._data.sockets[socket.id];
        let lobbyId = this._data.players[captainId].lobbyId;
        let lobby = this._data.lobbies[lobbyId];

        if (captainId == lobby.getData().captain) {
            lobby.switchToInGameStatus();
            this._data.gameManager.startGame(lobbyId);

            let data = lobby.getData();
            let playerIds = data.players.values();
            let redirectUrl = data.redirectToGame;

            while (true) {
                let next = playerIds.next();
                let playerId = next.value;
                let done = next.done;

                if (done) break;

                let player = this._data.players[playerId];
                let socket = player.socket;
                socket.emit(SocketMessages.redirect,redirectUrl);
            }
            
            console.log("start game in lobby: ",lobbyId);
        }
    }
}