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

    })
})
server.close();