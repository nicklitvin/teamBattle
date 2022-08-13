import { Server, Socket } from "socket.io";
import * as hash from "object-hash";
import Lobby from "./Lobby";
import * as SocketMessages from "../client/socketMessages.json";
import Player from "./Player";
import SocketWrap from "../socketWrap";
import GameManager from "../game/GameManager";


/**
 * LobbyManager keeps track of all clients that connect to the server
 * and the lobbies they are a part of. Players only receive information
 * from the lobby they are a part of.
 * 
 * _sockets stores all connected socketIds and the playerId associated with it.
 * Upon any disconnect. the appropriate _sockets must be deleted.
 * 
 * A player in _players is deleted only when not in game and not in a transition
 * or return state.
 * 
 * Lobbies are deleted when they have no players or no online players during game.
 * 
 */
export default class LobbyManager {
    /** socketId : playerId */
    public _sockets : {[socketId : string] : string} = {};
    public _players : {[playerId : string] : Player} = {};
    public _lobbies : {[lobbyId : string] : Lobby} = {};
    public _gameManager : GameManager;
    public _lobbyIdLength = 6;

    constructor(io : Server) {
        this.setupIoCommunication(io);
        this._gameManager = new GameManager(io,this);
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

    /**
     * Creates a lobby and redirects the client that created it to its page.
     * Lobby id matches id of socket that created it unless there is a 
     * duplicate.
     * 
     * @param socketWrap 
     */
    public socketCreateLobby(socketWrap : SocketWrap) {
        let id = this.createId(socketWrap.id);
        let lobby = new Lobby(id);
        this._lobbies[id] = lobby;

        socketWrap.emit(SocketMessages.redirect, lobby._redirectToLobby);
        console.log("creating lobby",lobby._id);
    }

    /**
     * Creates a lobby id with a default length by hashing it until it no
     * longer matches any other lobby id.
     * 
     * @param id 
     * @returns 
     */
    public createId(id : string) : string {
        while (true) {
            id = id.substring(0,this._lobbyIdLength);
            if (Object.keys(this._lobbies).includes(id)) {
                id = hash.sha1(id);
            } else {
                break;
            }
        }
        return id;
    }

    /**
     * Processes lobby join request. If request includes a playerId that belongs to the lobby, their 
     * status is updated. Else, a new player is added to the lobby whose id is equivalent to their
     * socket id.
     * 
     * @param socketWrap 
     * @param lobbyId 
     * @param playerId 
     * @returns 
     */
    public socketJoinLobby(socketWrap : SocketWrap, lobbyId : string | undefined , playerId : string | undefined) {
        let lobby = this._lobbies[lobbyId];
        // check if returning player
        if (playerId) {
            let player = this._players[playerId];
            if (player && player.lobbyId == lobbyId) {
                let lobby = this._lobbies[lobbyId];
                if (lobby._players.has(playerId)) {
                    player.returning = false;
                    player.socketWrap = socketWrap;
                    this._sockets[socketWrap.id] = playerId;
                    this.sendLobbyUpdate(lobby);
                    console.log("player returned");
                    return;
                }
            } 
        }
        // add player if new
        if (lobby && !lobby._inGame) {
            let newPlayer = new Player(socketWrap.id,lobbyId,socketWrap);
            
            this._sockets[socketWrap.id] = newPlayer.id;
            this._players[newPlayer.id] = newPlayer;

            socketWrap.emit(SocketMessages.setId,newPlayer.id);
            
            let lobby = this._lobbies[lobbyId];
            lobby.addPlayer(newPlayer.id);
            this.sendLobbyUpdate(lobby);

            console.log("player joined",socketWrap.id);
        } else {
            socketWrap.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("cant join room",lobbyId);
        }
    }

    /**
     * Deletes socket if exists and deletes player if not currently in game
     * or returning from game. If no players remaining in lobby, lobby is 
     * deleted.
     * 
     * @param socketWrap 
     * @returns 
     */
    public socketRemovePlayer(socketWrap : SocketWrap) {
        if (this._sockets[socketWrap.id]) {
            let playerId = this._sockets[socketWrap.id];
            let player = this._players[playerId];
            let lobby = this._lobbies[player.lobbyId];

            delete this._sockets[socketWrap.id];

            if (lobby._inGame) {
                player.online = false;
                return;
            } else if (player.returning) {
                return;
            } 

            delete this._players[playerId];

            console.log("removing player, global players left: ",
                Object.keys(this._players).length
            );

            lobby.removePlayer(playerId);
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room",lobby._id);
                delete this._lobbies[lobby._id];
            } else {
                this.sendLobbyUpdate(lobby);
            }
        }
    }

    /**
     * Sends every player in the lobby information regarding its
     * status.
     * 
     * @param lobby 
     */
    public sendLobbyUpdate(lobby : Lobby) {
        let captain = lobby._leader;
        let text = lobby._countText;

        for (let playerId of lobby.getPlayerList()) {
            let socketWrap = this._players[playerId].socketWrap;
            socketWrap.emit(SocketMessages.countUpdate,text);
            
            if (playerId == captain) {
                socketWrap.emit(SocketMessages.lobbyLeaderRole);
            }
        }
    }

    /**
     * If client is leader of lobby, starts game and redirects all players
     * to its page.
     * 
     * @param socketWrap 
     */
    public socketStartGame(socketWrap : SocketWrap) {
        let requesterId = this._sockets[socketWrap.id];
        let lobbyId = this._players[requesterId].lobbyId;
        let lobby = this._lobbies[lobbyId];

        if (requesterId == lobby._leader) {
            lobby.switchToInGameStatus();
            this._gameManager.startGame(lobbyId);

            for (let playerId of lobby.getPlayerList()) {
                let socketWrap = this._players[playerId].socketWrap;
                socketWrap.emit(SocketMessages.redirect,lobby._redirectToGame);
            }
            console.log("start game in lobby: ",lobbyId);
        } else {
            console.log("false game start");
        }
    }

    /**
     * Updates player status so player is not deleted upon disconnect
     * and redirects player to lobby. Lobby must not be in game.
     * 
     * @param socketWrap 
     */
    public socketReturnToLobby(socketWrap : SocketWrap) {
        let playerId = this._sockets[socketWrap.id];
        let player = this._players[playerId];
        let lobby = this._lobbies[player.lobbyId];

        if (!lobby._inGame) {
            player.returning = true;
            delete this._sockets[socketWrap.id];
            socketWrap.emit(SocketMessages.redirect,lobby._redirectToLobby);
            console.log("player is returning");            
        } else {
            console.log("false player return");
        }
    }
    
    /**
     * Deletes all stored information regarding lobbies, players, sockets,
     * and games.
     */
    public clearAllData() {
        this._lobbies = {};
        this._players = {};
        this._sockets = {};
        this._gameManager.clearAllData();
    }
}