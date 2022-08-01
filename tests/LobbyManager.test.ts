import * as SocketMessages from "../src/client/socketMessages.json";
import SocketWrap from "../src/SocketWrap";
import * as express from "express";
import { Server } from "socket.io";
import LobbyManager from "../src/lobby/LobbyManager";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing lobbyManager", () => {
    
    it("should properly create lobby", () => {
        let lobbyManager = new LobbyManager(io);
        let data = lobbyManager.getData();
        let socketWrap = new SocketWrap();

        socketWrap.id = "id1";
        lobbyManager.socketCreateLobby(socketWrap);
        expect(data.lobbies[socketWrap.id]).toBeTruthy();

        let expectedMessage = [
            SocketMessages.redirect,
            data.lobbies[socketWrap.id].getData().redirectToLobby
        ];
        expect(socketWrap.savedMessages[0]).toEqual(expectedMessage);
    })
})
server.close();