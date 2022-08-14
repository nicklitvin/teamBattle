import * as SocketMessages from "../src/client/socketMessages.json";
import SocketWrap from "../src/SocketWrap";
import * as express from "express";
import { Server } from "socket.io";
import LobbyManager from "../src/lobby/LobbyManager";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing lobbyManager", () => {
    let lobbyManager = new LobbyManager(io);
    lobbyManager._gameManager._setTimerBeforeGameStart = false;

    afterEach(() => {
        lobbyManager.clearAllData();
    })

    it("should handle join/leave", () => {
        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "red";
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "blu";

        // red creates lobby
        lobbyManager.socketCreateLobby(socketWrapRed);
        let lobby = lobbyManager._lobbies[socketWrapRed.id];
        expect(lobby).toBeTruthy();

        // red joins as leader
        lobbyManager.socketJoinLobby(socketWrapRed,lobby._id,undefined);
        expect(lobby._players.size).toEqual(1);
        expect(lobbyManager._players[socketWrapRed.id]).toBeTruthy();
        expect(lobbyManager._sockets[socketWrapRed.id]).toEqual(socketWrapRed.id);
        expect(lobby._leader).toEqual(socketWrapRed.id);

        // blu joins
        lobbyManager.socketJoinLobby(socketWrapBlu,lobby._id,undefined);
        expect(lobby._players.size).toEqual(2);
        expect(lobbyManager._players[socketWrapBlu.id]).toBeTruthy();
        expect(lobbyManager._sockets[socketWrapBlu.id]).toEqual(socketWrapBlu.id);
        expect(lobby._leader).toEqual(socketWrapRed.id);

        // red leaves, blu is leader
        lobbyManager.socketRemovePlayer(socketWrapRed);
        expect(lobby._players.size).toEqual(1);
        expect(lobbyManager._players[socketWrapRed.id]).toBeFalsy();
        expect(lobbyManager._sockets[socketWrapRed.id]).toBeFalsy();
        expect(lobby._leader).toEqual(socketWrapBlu.id);

        // blu leaves, lobby deleted
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        expect(lobbyManager._lobbies[lobby._id]).toBeFalsy();
        expect(lobbyManager._players[socketWrapBlu.id]).toBeFalsy();
        expect(lobbyManager._sockets[socketWrapBlu.id]).toBeFalsy();
    })

    it("should send messages", () => {
        expect(lobbyManager._lobbies).toEqual({});
        expect(lobbyManager._players).toEqual({});
        expect(lobbyManager._sockets).toEqual({});

        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "id0";
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "id1";

        // red creates lobby
        lobbyManager.socketCreateLobby(socketWrapRed);
        let lobby = lobbyManager._lobbies[socketWrapRed.id];
        let expected0 = [SocketMessages.redirect,lobby._redirectToLobby];
        expect(socketWrapRed.savedMessages[0]).toEqual(expected0);
        socketWrapRed.clearSavedMessages();

        // red joins lobby
        lobbyManager.socketJoinLobby(socketWrapRed,lobby._id,undefined);
        let firstPlayerId = lobby.getPlayerList()[0];

        let expectRed1 = [SocketMessages.setId,firstPlayerId];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed1);
        let expectRed2 = [SocketMessages.countUpdate,lobby._countText];
        expect(socketWrapRed.savedMessages[1]).toEqual(expectRed2);
        let expectRed3 = [SocketMessages.lobbyLeaderRole];
        expect(socketWrapRed.savedMessages[2]).toEqual(expectRed3);
        socketWrapRed.clearSavedMessages();

        // blu joins lobby
        lobbyManager.socketJoinLobby(socketWrapBlu,lobby._id,undefined);
        let secondPlayerId = lobby.getPlayerList()[1];

        let expectRed4 = [SocketMessages.countUpdate,lobby._countText];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed4);
        expect(socketWrapRed.savedMessages[1]).toEqual(expectRed3)

        let expectBlu0 = [SocketMessages.setId,secondPlayerId];
        expect(socketWrapBlu.savedMessages[0]).toEqual(expectBlu0);
        let expectBlu1 = [SocketMessages.countUpdate,lobby._countText];
        expect(socketWrapBlu.savedMessages[1]).toEqual(expectBlu1);

        // blu leaves lobby, red starts game
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        socketWrapRed.clearSavedMessages();
        lobbyManager.socketStartGame(socketWrapRed);

        let expectRed5 = [SocketMessages.redirect, lobby._redirectToGame];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed5);
    })

    it("should prevent hack/break", () => {
        // cant join nonexisiting lobby
        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "id0";
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "id1";

        lobbyManager.socketCreateLobby(socketWrapRed);
        lobbyManager.socketJoinLobby(socketWrapRed,socketWrapRed.id,undefined);

        let lobby = lobbyManager._lobbies[socketWrapRed.id];

        lobbyManager.socketJoinLobby(socketWrapBlu,"badId",undefined);
        let errorRedirect = [SocketMessages.redirect,SocketMessages.errorUrlBit];
        expect(socketWrapBlu.savedMessages[0]).toEqual(errorRedirect);

        // cant start game when not leader
        lobbyManager.socketJoinLobby(socketWrapBlu,lobby._id,undefined);
        socketWrapBlu.clearSavedMessages();

        lobbyManager.socketStartGame(socketWrapBlu);
        expect(lobby._leader).toEqual(socketWrapRed.id);
        expect(lobby._transition).toBeFalsy();

        // cant join lobby when ingame
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        lobby.endTransitionPhase();
        lobby.switchToInGameStatus();
        socketWrapBlu.clearSavedMessages();

        lobbyManager.socketJoinLobby(socketWrapBlu,lobby._id,undefined);
        expect(socketWrapBlu.savedMessages[0]).toEqual(errorRedirect);

        // cant join game when not in lobby
        socketWrapBlu.clearSavedMessages();
        let gameManager = lobbyManager._gameManager;
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobby._id);
        expect(socketWrapBlu.savedMessages[0]).toEqual(errorRedirect);
    })
    
    it("should transition to game and back", () => {
        let socketWrapRed = new SocketWrap();
        let redSocketId = "red";
        socketWrapRed.id = redSocketId;

        let socketWrapBlu = new SocketWrap();
        let bluSocketId = "blu";
        socketWrapBlu.id = bluSocketId;

        // start game
        lobbyManager.socketCreateLobby(socketWrapRed);
        let lobbyId = Object.keys(lobbyManager._lobbies)[0];
        let lobby = lobbyManager._lobbies[lobbyId];
        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        expect(Object.keys(lobbyManager._sockets).length).toEqual(0);
        expect(Object.keys(lobbyManager._players).length).toEqual(2);
        expect(Object.keys(lobbyManager._lobbies).length).toEqual(1);
        expect(Object.keys(lobbyManager._gameManager._games).length).toEqual(1);
        expect(lobbyManager._players[redSocketId].online).toBeFalsy();
        expect(lobbyManager._players[bluSocketId].online).toBeFalsy();

        // red connect to game
        let gameManager = lobbyManager._gameManager;
        let newRedSocketId = "newRed";
        let newBluSocketId = "newBlu";
        socketWrapRed.id = newRedSocketId;
        socketWrapBlu.id = newBluSocketId;
        
        gameManager.socketJoinGame(socketWrapRed,redSocketId,lobbyId);

        expect(Object.keys(lobbyManager._sockets).length).toEqual(1);
        expect(Object.keys(lobbyManager._players).length).toEqual(2);
        expect(Object.keys(lobbyManager._lobbies).length).toEqual(1);
        expect(Object.keys(lobbyManager._gameManager._games).length).toEqual(1);
        expect(lobbyManager._players[redSocketId].online).toBeTruthy();
        expect(lobbyManager._players[redSocketId].socketWrap.id).toEqual(newRedSocketId);
        expect(lobbyManager._players[bluSocketId].online).toBeFalsy();

        // game starts, blu reconnects
        lobby.endTransitionPhase();
        lobby.switchToInGameStatus();
        gameManager.socketJoinGame(socketWrapBlu,bluSocketId,lobbyId);

        expect(Object.keys(lobbyManager._sockets).length).toEqual(2);
        expect(lobbyManager._players[bluSocketId].online).toBeTruthy();

        // game ends, red returns, blu disconnects
        lobby.switchBackFromInGameStatus();
        lobbyManager.socketReturnToLobby(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        expect(Object.keys(lobbyManager._sockets).length).toEqual(0);
        expect(Object.keys(lobbyManager._players).length).toEqual(1);
        expect(Object.keys(lobbyManager._lobbies).length).toEqual(1);
        expect(lobbyManager._players[redSocketId].online).toBeFalsy();
        expect(lobbyManager._players[redSocketId].returning).toBeTruthy();

        // red reconnects to lobby
        let newestRedSocketId = "newestId";
        socketWrapRed.id = newestRedSocketId;

        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,redSocketId);
        expect(Object.keys(lobbyManager._sockets).length).toEqual(1);
        expect(Object.keys(lobbyManager._players).length).toEqual(1);
        expect(lobbyManager._players[redSocketId].online).toBeTruthy();
        expect(lobbyManager._players[redSocketId].returning).toBeFalsy();
        expect(lobbyManager._players[redSocketId].socketWrap.id).toEqual(newestRedSocketId);
    })
})
server.close();
