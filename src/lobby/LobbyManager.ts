import { Server, Socket } from "socket.io";
import LobbyManagerData from "./LobbyManagerData";
import * as hash from "object-hash";
import Lobby from "./Lobby";
import * as SocketMessages from "../client/socketMessages.json";
import Player from "./Player";

export default class LobbyManager {
    private _data = new LobbyManagerData();

    constructor(io : Server) {
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
        socket.emit(SocketMessages.redirect, lobby.getData().redirect);
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

    private sendPlayerId(socket : Socket, playerId : string) : void {
        socket.emit(SocketMessages.setId,playerId);
    }

    public socketJoinLobby(socket : Socket, lobbyId : string) {
        if (this._data.lobbies[lobbyId]) {
            this.sendPlayerId(socket,socket.id);
            this._data.sockets[socket.id] = socket.id;
            this._data.players[socket.id] = new Player(lobbyId,socket);
            
            let lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socket.id);

            console.log("player joined",socket.id);
        } else {
            console.log("cant join room",lobbyId);
        }
    }

    public socketRemovePlayer(socket : Socket) {
        if (this._data.sockets[socket.id]) {
            let playerId = this._data.sockets[socket.id];
            let player = this._data.players[playerId];
            let lobby = this._data.lobbies[player.lobbyId];

            lobby.removePlayer(playerId);
            console.log(lobby.getPlayerCount())
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room",lobby.getData().id);
                delete this._data.lobbies[lobby.getData().id];
            }

            delete this._data.sockets[socket.id];
            delete this._data.players[playerId];
            console.log("removing player",Object.keys(this._data.players).length);
        }
    }
}