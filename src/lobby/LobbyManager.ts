import { Server, Socket } from "socket.io";
import LobbyManagerData from "./LobbyManagerData";
import * as hash from "object-hash";
import Lobby from "./Lobby";
import * as SocketMessages from "../../srcJS/client/socketMessages.json";

export default class LobbyManager {
    private _data = new LobbyManagerData();

    constructor(io : Server) {
        this.setupIoCommunication(io);
    }

    private setupIoCommunication(io : Server) : void {
        io.on("connection", (socket : Socket) => {
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

    public addPlayer(socket : Socket) {
        this._data.players[socket.id] = socket;
        console.log("adding player",socket.id);
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
        if (Object.keys(this._data.lobbies).includes(lobbyId)) {
            this.addPlayer(socket);
            this.sendPlayerId(socket,socket.id);
            
            let lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socket.id);

            console.log("player joined",socket.id);
        } else {
            console.log("cant join room",lobbyId);
        }
    }
}