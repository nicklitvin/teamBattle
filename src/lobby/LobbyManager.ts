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
    /** _sockets = {socketId : playerId} */
    public _sockets : {[socketId : string] : string} = {};
    public _players : {[playerId : string] : Player} = {};
    public _lobbies : {[lobbyId : string] : Lobby} = {};
    public _gameManager : GameManager;
    public _lobbyIdLength = 6;
    /** how much time is given for leader to join created lobby in ms */
    public _transitionTime = 1000*1;
    /** sets timer after which lobby is deleted if leader does not join */
    public _setLeaderJoinTimer = true;

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
     * Creates a lobby and redirects the user that created it to its page.
     * Lobby id matches id of socket that created it unless there is a 
     * an existing duplicate.
     * 
     * @param socketWrap 
     */
    public socketCreateLobby(socketWrap : SocketWrap) {
        let id = this.createId(socketWrap.id);
        let lobby = new Lobby(id);
        this._lobbies[id] = lobby;

        socketWrap.emit(SocketMessages.redirect, lobby._redirectToLobby);
        if (this._setLeaderJoinTimer) {
            setTimeout( () => {
                this.deleteLobbyIfEmpty(lobby);
            }, this._transitionTime)
        }
        console.log("creating lobby",lobby._id);
    }

    /**
     * Lobby is deleted if empty.
     * @param lobby 
     */
    public deleteLobbyIfEmpty(lobby : Lobby) {
        if (lobby.getPlayerCount() == 0) {
            console.log("deleting lobby that leader did not join");
            delete this._lobbies[lobby._id];
        }
    }

    /**
     * Creates a unique lobby id with a default length by hashing it until it no
     * longer matches any other existing lobby id.
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
     * status is updated. Else, a new player is added to the lobby and their id is 
     * equivalent to their socket id.
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
                    player.online = true;
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
     * Socket is deleted from saved list of sockets. Player information
     * is not deleted if they are transitioning or returning from game.
     * If no online players remain in the lobby, the lobby is deleted.
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

            if (lobby._transition) {
                player.online = false;
                console.log("transitioning to game", playerId);
                return;
            } else if (lobby._inGame) {
                player.online = false;
                console.log("disconnect during game", playerId);
                this._gameManager.deleteGameIfEmpty(lobby);
                return;
            } else if (player.returning) {
                player.online = false;
                console.log("player returning to lobby ", playerId);
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
     * If the player is the leader of the lobby, the lobby 
     * enters transition phase and all players are redirected
     * to the game page. The game will start after transition
     * phase is over.
     * 
     * @param socketWrap 
     */
    public socketStartGame(socketWrap : SocketWrap) {
        let requesterId = this._sockets[socketWrap.id];
        let lobbyId = this._players[requesterId].lobbyId;
        let lobby = this._lobbies[lobbyId];

        if (requesterId == lobby._leader) {
            lobby.startTransitionPhase();
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
            player.online = false;
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