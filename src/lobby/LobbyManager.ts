import { Server, Socket } from "socket.io";
import LobbyManagerData from "./LobbyManagerData";
import * as hash from "object-hash";
import Lobby from "./Lobby";
import * as SocketMessages from "../client/socketMessages.json";
import Player from "./Player";
import SocketWrap from "../socketWrap";

export default class LobbyManager {
    private _data : LobbyManagerData;

    constructor(io : Server) {
        this._data = new LobbyManagerData(io);
        this.setupIoCommunication(io);
    }

    private setupIoCommunication(io : Server) : void {
        io.on("connection", (socket : Socket) => {
            let socketWrap = new SocketWrap(socket);

            socket.on(SocketMessages.disconnect, () => {
                this.socketRemovePlayer(socketWrap);
            })
            socket.on(SocketMessages.createLobby, () => {
                this.socketCreateLobby(socketWrap);
            })
            socket.on(SocketMessages.joinLobby, (...args) => {
                try {
                    let lobbyId : string | undefined = args[0];
                    let playerId : string | undefined = args[1];
                    this.socketJoinLobby(socketWrap,lobbyId,playerId)
                } catch {
                    console.log("Lobbymanager.joinLobby error");
                }
            })
            socket.on(SocketMessages.startGame, () => {
                try {
                    this.socketStartGame(socketWrap);
                } catch {
                    console.log("Lobbymanager.startGame error");
                }
            })
            socket.on(SocketMessages.playerWantsToReturn, () => {
                try {
                    this.socketReturnToLobby(socketWrap);
                } catch {
                    console.log("LobbyManager.playerWantsToReturn error");
                }
                
            })
        })
    }

    public socketCreateLobby(socketWrap : SocketWrap) {
        let lobby = this.createLobby(socketWrap.id);
        socketWrap.emit(SocketMessages.redirect, lobby.getData().redirectToLobby);
        console.log("creating lobby",lobby.getData().id);
    }
    
    public createLobby(socketId : string) : Lobby {
        let id = this.createId(socketId);
        let lobby = new Lobby(id);

        this._data.lobbies[id] = lobby;
        return lobby;
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
        return id;
    }

    public getData() : LobbyManagerData {
        return this._data;
    }

    public socketJoinLobby(socketWrap : SocketWrap, lobbyId : string | undefined , playerId : string | undefined) {
        let lobby = this._data.lobbies[lobbyId];
        // check if returning player
        if (playerId) {
            let player = this._data.players[playerId];
            if (player && player.lobbyId == lobbyId) {
                let lobby = this._data.lobbies[lobbyId];
                if (lobby.getData().players.has(playerId)) {
                    player.returning = false;
                    player.socketWrap = socketWrap;
                    this._data.sockets[socketWrap.id] = playerId;
                    this.sendLobbyUpdate(lobby);
                    console.log("player returned")
                    return;
                }
            } 
        }
        // add player if new
        if (lobby && !lobby.getData().inGame) {
            this._data.sockets[socketWrap.id] = socketWrap.id;
            this._data.players[socketWrap.id] = new Player(lobbyId,socketWrap);

            socketWrap.emit(SocketMessages.setId,socketWrap.id);
            
            let lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socketWrap.id);

            this.sendLobbyUpdate(lobby);

            console.log("player joined",socketWrap.id);
        } else {
            socketWrap.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("cant join room",lobbyId);
        }
    }

    public socketRemovePlayer(socketWrap : SocketWrap) {
        if (this._data.sockets[socketWrap.id]) {
            let playerId = this._data.sockets[socketWrap.id];
            let player = this._data.players[playerId];
            let lobby = this._data.lobbies[player.lobbyId];

            if (lobby.getData().inGame) {
                player.online = false;
                return;
            }
            if (player.returning) {
                return;
            }

            delete this._data.sockets[socketWrap.id];
            delete this._data.players[playerId];

            console.log("removing player, global players left: ",
                Object.keys(this._data.players).length
            );

            lobby.removePlayer(playerId);
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room",lobby.getData().id);
                delete this._data.lobbies[lobby.getData().id];
            } else {
                this.sendLobbyUpdate(lobby);
            }
        }
    }

    public sendLobbyUpdate(lobby : Lobby) {
        let data = lobby.getData();
        let players = data.players.values();
        let captain = data.leader;
        let text = data.countText;

        while (true) {
            let next = players.next();
            let playerId = next.value;
            let done = next.done;
            
            if (done) break;

            let socketWrap = this._data.players[playerId].socketWrap;
            socketWrap.emit(SocketMessages.countUpdate,text);
            
            if (playerId == captain) {
                socketWrap.emit(SocketMessages.lobbyLeaderRole);
            }
        }
    }

    public socketStartGame(socketWrap : SocketWrap) {
        let captainId = this._data.sockets[socketWrap.id];
        let lobbyId = this._data.players[captainId].lobbyId;
        let lobby = this._data.lobbies[lobbyId];

        if (captainId == lobby.getData().leader) {
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
                let socketWrap = player.socketWrap;
                socketWrap.emit(SocketMessages.redirect,redirectUrl);
            }
            
            console.log("start game in lobby: ",lobbyId);
        } else {
            console.log("false game start");
        }
    }

    public socketReturnToLobby(socketWrap : SocketWrap) {
        let playerId = this._data.sockets[socketWrap.id];
        let player = this._data.players[playerId];
        let lobby = this._data.lobbies[player.lobbyId];

        if (!lobby.getData().inGame) {
            player.returning = true;
            socketWrap.emit(SocketMessages.redirect,lobby.getData().redirectToLobby);
            console.log("player is returning");            
        } else {
            console.log("false player return");
        }
    } 
}