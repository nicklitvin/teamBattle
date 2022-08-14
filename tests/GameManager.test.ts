import LobbyManager from "../src/lobby/LobbyManager";
import * as express from "express";
import { Server } from "socket.io";
import SocketWrap from "../src/SocketWrap";
import Lobby from "../src/lobby/Lobby";
import * as SocketMessages from "../src/client/socketMessages.json";
import Position from "../src/game/Position";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing gameManager", () => {
    let lobbyManager = new LobbyManager(io);
    let gameManager = lobbyManager._gameManager;

    let socketWrapRed = new SocketWrap();
    socketWrapRed.id = "red";

    let socketWrapBlu = new SocketWrap();
    socketWrapBlu.id = "blu";

    let lobbyId : string;
    let lobby : Lobby;

    // create lobby with 2 players
    beforeEach( () => {
        lobbyManager.clearAllData();
        gameManager.clearAllData();
        gameManager.setDefaultSettings();

        lobbyManager.socketCreateLobby(socketWrapRed);
        lobbyId = Object.keys(lobbyManager._lobbies)[0];

        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);

        lobby = lobbyManager._lobbies[lobbyId];
    })

    it("should setup game correctly", () => {
        gameManager._setTimerBeforeGameStart = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        let game = gameManager._games[lobbyId];

        expect(gameManager.areAllOffline(lobby)).toBeTruthy();
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);
        expect(gameManager.areAllOffline(lobby)).toBeFalsy();

        let redShip = game._ships[game._players[socketWrapRed.id]];
        let bluShip = game._ships[game._players[socketWrapBlu.id]];
        
        expect(redShip).toBeTruthy();
        expect(bluShip).toBeTruthy();
        expect(Object.keys(game._ships).length).toEqual(2);
    })

    it("should delete when nobody joins game", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        
        let game = gameManager._games[lobbyId];
        gameManager.endTransitionPhase(lobby,game);

        expect(lobbyManager._lobbies).toEqual({});
        expect(lobbyManager._players).toEqual({});
        expect(gameManager._games).toEqual({});
    })

    it("should send return after game end", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._immediatelyEndGame = true;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        let game = gameManager._games[lobbyId];
        socketWrapRed.clearSavedMessages();
        socketWrapBlu.clearSavedMessages();
        gameManager.endTransitionPhase(lobby,game);

        let expect0 = [SocketMessages.showReturnButton];
        expect(socketWrapRed.savedMessages[0]).toEqual(expect0);
        expect(socketWrapBlu.savedMessages[0]).toEqual(expect0);
    })

    it("should take player input", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        let game = gameManager._games[socketWrapRed.id];
        gameManager.endTransitionPhase(lobby,game);

        // red selects captain role
        let ship = game._ships[game._players[socketWrapRed.id]];
        gameManager.socketProcessGameInput(
            socketWrapRed,
            SocketMessages.roleSelectKeyword, 
            SocketMessages.captainTitle
        );
        
        expect(ship._captain.getPlayerCount()).toEqual(1);

        // red chooses target
        let positionMessage = [4,8];
        gameManager.socketProcessGameInput(socketWrapRed,positionMessage[0],positionMessage[1]);
        
        expect(ship._target.x).toEqual(positionMessage[0]);
        expect(ship._target.y).toEqual(positionMessage[1]);

        // red chooses different role
        gameManager.socketProcessGameInput(
            socketWrapRed,
            SocketMessages.roleSelectKeyword,
            SocketMessages.shooterTitle
        );

        expect(ship._captain.getPlayerCount()).toEqual(0);
        expect(ship._shooter.getPlayerCount()).toEqual(1);

        // blu disconnects and rejoins
        expect(lobbyManager._sockets[socketWrapBlu.id]).toEqual(socketWrapBlu.id);
        expect(lobbyManager._players[socketWrapBlu.id]).toBeTruthy();
        expect(lobbyManager._players[socketWrapBlu.id].lobbyId).toEqual(lobbyId);

        lobbyManager.socketRemovePlayer(socketWrapBlu);
        expect(Object.keys(lobbyManager._sockets).length).toEqual(1);
        expect(Object.keys(lobbyManager._players).length).toEqual(2);

        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);
        expect(Object.keys(lobbyManager._sockets).length).toEqual(2);

        // blu picks scout and sends scout
        let bluShip = game._ships[game._players[socketWrapBlu.id]];
        gameManager.socketProcessGameInput(
            socketWrapBlu,
            SocketMessages.roleSelectKeyword,
            SocketMessages.scoutTitle
        )
        expect(bluShip._scout.getPlayerCount()).toEqual(1);
    })

    it("should run game", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;
        gameManager._instantGameUpdates = true;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        let game = gameManager._games[socketWrapRed.id];
        gameManager.endTransitionPhase(lobby,game);

        // make ships close to each other
        let redShip = game._ships[game._players[socketWrapRed.id]];
        let bluShip = game._ships[game._players[socketWrapBlu.id]];

        redShip._position = new Position(5,5);
        bluShip._position = new Position(9,5);
        bluShip._health = redShip._shooterDamage;
        redShip._shooterExpirationTime = 10;
        redShip._shooterSpeed = 1;

        // red shoots blu
        gameManager.socketProcessGameInput(
            socketWrapRed,
            SocketMessages.roleSelectKeyword,
            SocketMessages.shooterTitle
        )
        gameManager.socketProcessGameInput(
            socketWrapRed,
            bluShip._position.x,
            bluShip._position.y
        );
        
        expect(Object.keys(redShip._shotsSent).length).toEqual(1);

        // run game
        gameManager.runGame(game);
        expect(game.isGameOver()).toBeTruthy();
    })
})
server.close();