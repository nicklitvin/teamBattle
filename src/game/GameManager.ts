import { Server, Socket } from "socket.io";
import Game from "./Game";
import * as SocketMessages from "../client/socketMessages.json";
import Lobby from "../lobby/Lobby";
import SocketWrap from "../socketWrap";
import LobbyManager from "../lobby/LobbyManager";

/**
 * GameManager processes any player input and keeps track of
 * certain game events for all ongoing games. Needs access
 * to LobbyManager for access to sockets, players,and lobbies.
 */
export default class GameManager {
    /** List of all ongoing games */
    public _games : {[lobbyId : string] : Game} = {};

    /** Pointer to lobby and all of its variables */
    public _lobbyManager : LobbyManager;
    
    /** unts of time: ms*/
    public _transitionTime = 1000*3;
    public _refreshTime = 10;

    /** 
     * When true, a timer will be set when game is created
     * after which the game will start if all players
     * are not offline. 
     */
    public _setTimerBeforeGameStart = true;

    /**
     * When true, game will speedrun until reaching end condition
     * instead of playing out in real time.
     */
    public _instantGameUpdates = false;

    /**
     * Immediately ends the game after starting.
     */
    public _immediatelyEndGame = false;

    public _runGameAfterTransition = true;

    constructor(io : Server, data : LobbyManager) {
        this._lobbyManager = data;

        io.on("connection", (socket : Socket) => {
            let socketWrap = new SocketWrap(socket);

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

    /**
     * Creates a game with the specified lobbyId. Sets a timer
     * after which the game starts.
     * 
     * @param lobbyId 
     */
    public startGame(lobbyId : string) {
        let lobby = this._lobbyManager._lobbies[lobbyId];
        let game = new Game();
        this._games[lobbyId] = game;
        this.makeTeams(lobby);

        if (this._setTimerBeforeGameStart) {
            setTimeout( () => {
                this.endTransitionPhase(lobby);
            }, this._transitionTime);
        } 
    }

    /**
     * Deletes lobby if all players are offline. Otherwise
     * runs game.
     * 
     * @param lobby 
     * @param game 
     */
    public endTransitionPhase(lobby : Lobby) {
        console.log("starting game");
        lobby.endTransitionPhase();
        lobby.switchToInGameStatus();

        if (this.areAllOffline(lobby)) {
            this.deleteLobby(lobby);
        } else if (this._runGameAfterTransition) {
            let game = this._games[lobby._id];
            this.runGame(game);
        }
    }

    /**
     * Updates player's status if joining a legit game they are a part of and
     * adds entry to match socket id to player id. Else sends client to error
     * page.
     * 
     * @param socketWrap 
     * @param playerId 
     * @param lobbyId 
     */
    public socketJoinGame(socketWrap : SocketWrap, playerId : string, lobbyId : string) {
        let lobby = this._lobbyManager._lobbies[lobbyId];

        if (lobby && lobby._players.has(playerId)) {
            this._lobbyManager._sockets[socketWrap.id] = playerId;
            let player = this._lobbyManager._players[playerId];
            player.socketWrap = socketWrap;
            player.online = true;
            console.log("player joined game",playerId);
        } else {
            socketWrap.emit(SocketMessages.redirect,SocketMessages.errorUrlBit);
            console.log("player cant join game");
        }
    }

    /**
     * Deletes game associated with lobby if all players are offline.
     * 
     * @param socketWrap 
     * @returns 
     */
    public deleteGameIfEmpty(lobby : Lobby) {
        if (this.areAllOffline(lobby)) {
            this.deleteLobby(lobby);
        }
    }

    /**
     * Checks whether all players in lobby are offline.
     * 
     * @param lobby 
     * @returns 
     */
    public areAllOffline(lobby : Lobby) : boolean {
        let allOffline = true;

        for (let playerId of lobby.getPlayerList()) {
            let player = this._lobbyManager._players[playerId];
            if (player.online) {
                allOffline = false;
                break;
            }
        }
        return allOffline;
    }

    /**
     * Deletes game, lobby, and all players.
     * 
     * @param lobby 
     */
    public deleteLobby(lobby : Lobby) {
        let lobbyId = lobby._id;

        for (let playerId of lobby.getPlayerList()) {
            let player = this._lobbyManager._players[playerId];
            delete this._lobbyManager._sockets[player.socketWrap.id];
            delete this._lobbyManager._players[playerId];
        }

        delete this._lobbyManager._lobbies[lobbyId];
        delete this._games[lobbyId];
        console.log("deleting lobby",lobbyId);
    }

    /**
     * Changes lobby status to not in game and deletes offline players.
     * Sends return button to remaining players.
     * 
     * @param lobby 
     */
    public endGame(lobby : Lobby) {
        lobby.switchBackFromInGameStatus();

        for (let playerId of lobby.getPlayerList()) {
            let player = this._lobbyManager._players[playerId];
            if (!player.online) {
                lobby.removePlayer(playerId);
                delete this._lobbyManager._sockets[player.socketWrap.id];
                delete this._lobbyManager._players[playerId];
            } else {
                player.socketWrap.emit(SocketMessages.showReturnButton);
            }
        }

        delete this._games[lobby._id];
    }

    /**
     * Checks whether player is legit and sends input to game for processing.
     * 
     * @param socketWrap 
     * @param args 
     */
    public socketProcessGameInput(socketWrap : SocketWrap, ...args : any) {
        let playerId = this._lobbyManager._sockets[socketWrap.id];
        if (playerId) {
            let player = this._lobbyManager._players[playerId];
            let lobby = this._lobbyManager._lobbies[player.lobbyId];
            let game = this._games[player.lobbyId];
            if (lobby._inGame) {
                game.processPlayerInput(playerId,args);
            }
        }
    }

    /**
     * Makes even teams with players in the lobby. Game must already
     * be created.
     * 
     * @param lobby 
     * @param game 
     */
    public makeTeams(lobby : Lobby) {
        let game = this._games[lobby._id];
        game.makeDefaultShips();

        let currentShipNum = 0;
        for (let playerId of lobby.getPlayerList()) {
            game.addPlayer(playerId, String(currentShipNum));
            currentShipNum = (currentShipNum + 1) % game._defaultShipNumber;
        }

        game.deleteEmptyShips();
    }

    /**
     * Updates game until end condition is achieved.
     * 
     * @param game 
     */
    public runGame(game : Game) {
        if (game.isGameOver() || this._immediatelyEndGame) {
            let somePlayerId = Object.keys(game._players)[0];
            let lobbyId = this._lobbyManager._players[somePlayerId].lobbyId;
            let lobby = this._lobbyManager._lobbies[lobbyId];
            lobby.switchBackFromInGameStatus();
            console.log("ending game");
            
            for (let playerId of Object.keys(game._players)) {
                let player = this._lobbyManager._players[playerId];
                player.socketWrap.emit(SocketMessages.showReturnButton);
            }
        } else {
            game.update();
            if (this._instantGameUpdates) {
                this.runGame(game);
            } else {
                setTimeout( () => {
                    this.runGame(game);
                }, this._refreshTime);
            }
        }
    }

    /**
     * Clears all stored data.
     */
    public clearAllData() {
        this._games = {};
    }

    /**
     * Sets default settings regarding transitions and game.
     */
    public setDefaultSettings() {
        this._setTimerBeforeGameStart = true;
        this._instantGameUpdates = false;
        this._immediatelyEndGame = false;
        this._runGameAfterTransition = true;
    }
}