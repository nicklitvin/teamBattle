import LobbyManager from "../src/lobby/LobbyManager"
import * as express from "express";
import { Server } from "socket.io";
import Lobby from "../src/lobby/Lobby";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing LobbyManager", () => {
    let lobbyManager = new LobbyManager(io);
    let data = lobbyManager.getData();

    it("should create lobby", () => {
        let id = lobbyManager.createId("test")
        let lobby = lobbyManager.createLobby(id);
        let lobbyData = lobby.getData();

        expect(data.lobbies[id]).toBeTruthy();
        expect(lobbyData.redirectToLobby).toEqual(`lobby?r=${id}`);
    })
    it("should not conflict ids", () => {
        let id = lobbyManager.createId("1");
        data.lobbies[id] = new Lobby(id);

        let id1 = lobbyManager.createId("1");
        expect(id == id1).toBeFalsy();
    })
})

server.close();