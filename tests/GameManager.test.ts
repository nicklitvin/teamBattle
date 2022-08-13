import LobbyManager from "../src/lobby/LobbyManager";
import GameManager from "../src/game/GameManager";
import * as express from "express";
import { Server } from "socket.io";
import SocketWrap from "../src/SocketWrap";
import Lobby from "../src/lobby/Lobby";
import Game from "../src/game/Game";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing gameManager", () => {
    let lobbyManager = new LobbyManager(io);
    let gameManager = lobbyManager._gameManager;
    gameManager._setTimerBeforeGameStart = false;

    let socketWrapRed = new SocketWrap();
    socketWrapRed.id = "red";

    let socketWrapBlu = new SocketWrap();
    socketWrapBlu.id = "blu";

    let lobbyId : string;
    let lobby : Lobby;

    // create lobby with 2 players
    beforeAll( () => {
        lobbyManager.clearAllData();
        gameManager.clearAllData();

        lobbyId = socketWrapRed.id;

        lobbyManager.socketCreateLobby(socketWrapRed);
        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);

        lobby = lobbyManager._lobbies[lobbyId];
    })

    it("should setup game correctly", () => {
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        let game = gameManager._games[lobbyId];

        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        expect(gameManager.areAllOffline(lobby)).toEqual(false);

        gameManager.makeTeams(lobby,game);
        game.deleteEmptyShips();
        let shipIds = Object.keys(game._ships);
        expect(shipIds.length).toEqual(2);
        expect(game._players[socketWrapRed.id]).toEqual(shipIds[0]);
        expect(game._players[socketWrapBlu.id]).toEqual(shipIds[1]);
    })
    it("should delete player that didnt transition", () => {
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        let game = gameManager._games[lobbyId];

        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.makeTeams(lobby,game);
        game.deleteEmptyShips();
        let shipIds = Object.keys(game._ships);

        expect(gameManager.areAllOffline(lobby)).toBeFalsy();
        expect(shipIds.length).toEqual(1);
        expect(game._players[socketWrapRed.id]).toEqual(shipIds[0]);
        expect(Object.keys(lobbyManager._players).length).toEqual(1);
    })
    it("should delete when nobody joins game", () => {
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        expect(gameManager.areAllOffline(lobby)).toBeTruthy();
        gameManager.deleteLobby(lobby);

        expect(lobbyManager._lobbies).toEqual({});
        expect(lobbyManager._players).toEqual({});
        expect(gameManager._games).toEqual({});
    })
})