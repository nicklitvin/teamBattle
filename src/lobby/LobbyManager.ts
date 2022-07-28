import { Server, Socket } from "socket.io";
import LobbyManagerData from "./LobbyManagerData";
import { hash } from "object-hash";
import Lobby from "./Lobby";

export default class LobbyManager {
    private _data = new LobbyManagerData();

    constructor(io : Server) {
        this.setupIoCommunication(io)
    }

    private setupIoCommunication(io : Server) : void {
        io.on("connection", (socket : Socket) => {
            socket.on("createLobby", () => {
                this.addPlayer(socket);
                let lobby = this.createLobby(socket.id);
                this.sendPlayerToLobby(socket,lobby);
            })
        })
    }
    
    public createLobby(socketId : string) : Lobby {
        let id = this.createId(socketId);
        let lobby = new Lobby(id);
        this._data.lobbys[id] = lobby;
        return lobby;
    }

    public addPlayer(socket : Socket) {
        this._data.players[socket.id] = socket;
    }

    public sendPlayerToLobby(socket : Socket, lobby : Lobby) {
        socket.emit("redirect", lobby.getData().redirect);
    }

    public createId(id : string) : string {
        while (true) {
            id = id.substring(0,this._data.lobbyIdLength);
            if (Object.keys(this._data.lobbys).includes(id)) {
                id = hash(id);
            } else {
                break;
            }
        }
        return id;
    }

    public getData() : LobbyManagerData {
        return this._data;
    }
}