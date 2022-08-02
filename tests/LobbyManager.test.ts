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
    let data = lobbyManager.getData();

    it("should handle join/leave", () => {
        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "id0";
        let playerIdRed = socketWrapRed.id;
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "id1";
        let playerIdBlu = socketWrapBlu.id;

        let lobbyId = lobbyManager.createId(socketWrapRed.id);

        lobbyManager.socketCreateLobby(socketWrapRed);
        let lobby = data.lobbies[lobbyId];
        let lobbyData = lobby.getData();
        expect(lobby).toBeTruthy();

        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        expect(lobbyData.players.size).toEqual(1);
        expect(data.players[playerIdRed]).toBeTruthy();
        expect(data.sockets[socketWrapRed.id]).toEqual(playerIdRed);
        expect(lobbyData.leader).toEqual(playerIdRed);

        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);
        expect(lobbyData.players.size).toEqual(2);
        expect(data.players[playerIdBlu]).toBeTruthy();
        expect(data.sockets[socketWrapBlu.id]).toEqual(playerIdBlu);
        expect(lobbyData.leader).toEqual(playerIdRed);

        lobbyManager.socketRemovePlayer(socketWrapRed);
        expect(lobbyData.players.size).toEqual(1);
        expect(data.players[playerIdRed]).toBeFalsy();
        expect(data.sockets[socketWrapRed.id]).toBeFalsy();
        expect(lobbyData.leader).toEqual(playerIdBlu);

        lobbyManager.socketRemovePlayer(socketWrapBlu);
        expect(data.lobbies[lobbyId]).toBeFalsy();
        expect(data.players[playerIdBlu]).toBeFalsy();
        expect(data.sockets[socketWrapBlu.id]).toBeFalsy();
    })

    it("should send messages", () => {
        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "id0";
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "id1";

        let lobbyId = lobbyManager.createId(socketWrapRed.id);

        // red creates lobby
        lobbyManager.socketCreateLobby(socketWrapRed);
        let lobby = data.lobbies[lobbyId];
        let lobbyData = lobby.getData();
        let expected0 = [SocketMessages.redirect,lobbyData.redirectToLobby];
        expect(socketWrapRed.savedMessages[0]).toEqual(expected0);
        socketWrapRed.clearSavedMessages();

        // red joins lobby
        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        let playerIds = lobbyData.players.values();
        let firstPlayerId : string = playerIds.next().value;

        let expectRed1 = [SocketMessages.setId,firstPlayerId];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed1);
        let expectRed2 = [SocketMessages.countUpdate,lobbyData.countText];
        expect(socketWrapRed.savedMessages[1]).toEqual(expectRed2);
        let expectRed3 = [SocketMessages.lobbyLeaderRole];
        expect(socketWrapRed.savedMessages[2]).toEqual(expectRed3);
        socketWrapRed.clearSavedMessages();

        // blu joins lobby
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);
        playerIds = lobbyData.players.values();
        playerIds.next();
        let secondPlayerId : string = playerIds.next().value;

        let expectRed4 = [SocketMessages.countUpdate,lobbyData.countText];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed4);
        expect(socketWrapRed.savedMessages[1]).toEqual(expectRed3)

        let expectBlu0 = [SocketMessages.setId,secondPlayerId];
        expect(socketWrapBlu.savedMessages[0]).toEqual(expectBlu0);
        let expectBlu1 = [SocketMessages.countUpdate,lobbyData.countText];
        expect(socketWrapBlu.savedMessages[1]).toEqual(expectBlu1);

        // blu leaves lobby, red starts game
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        socketWrapRed.clearSavedMessages();
        lobbyManager.socketStartGame(socketWrapRed);

        let expectRed5 = [SocketMessages.redirect, lobbyData.redirectToGame];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectRed5);
    })

    it("should prevent hack", () => {
        // cant join nonexisiting lobby
        let socketWrapRed = new SocketWrap();
        socketWrapRed.id = "id0";
    
        let socketWrapBlu = new SocketWrap();
        socketWrapBlu.id = "id1";

        let lobbyId = lobbyManager.createId(socketWrapRed.id);
        lobbyManager.socketCreateLobby(socketWrapRed);
        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);

        let lobby = lobbyManager.getData().lobbies[lobbyId];
        let lobbyData = lobby.getData();

        lobbyManager.socketJoinLobby(socketWrapBlu,"badId",undefined);
        let expect0 = [SocketMessages.redirect,SocketMessages.errorUrlBit];
        expect(socketWrapBlu.savedMessages[0]).toEqual(expect0);

        // cant start game when not leader
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);
        socketWrapBlu.clearSavedMessages();

        lobbyManager.socketStartGame(socketWrapBlu);
        expect(lobbyData.leader).toEqual(socketWrapRed.id);
        expect(lobbyData.inGame).toBeFalsy();

        // cant join lobby when ingame
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        lobby.switchToInGameStatus();
        socketWrapBlu.clearSavedMessages();

        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);
        expect(socketWrapBlu.savedMessages[0]).toEqual(expect0);
    })
})
server.close();
