import LobbyManager from "../src/lobby/LobbyManager";
import * as express from "express";
import { Server } from "socket.io";
import SocketWrap from "../src/SocketWrap";
import Lobby from "../src/lobby/Lobby";
import * as SocketMessages from "../src/client/socketMessages.json";

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
    beforeEach( () => {
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
    it("should take player input", () => {
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);
        let game = gameManager._games[socketWrapRed.id];
        lobby._transition = false;
        gameManager.makeTeams(lobby,game);

        // red selects captain role
        let selectMessage = [SocketMessages.roleSelectKeyword, SocketMessages.captainTitle];     
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
        selectMessage = [SocketMessages.roleSelectKeyword, SocketMessages.shooterTitle];
        gameManager.socketProcessGameInput(
            socketWrapRed,
            SocketMessages.roleSelectKeyword,
            SocketMessages.shooterTitle
        );

        expect(ship._captain.getPlayerCount()).toEqual(0);
        expect(ship._shooter.getPlayerCount()).toEqual(1);
    })
})