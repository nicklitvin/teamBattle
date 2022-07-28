import LobbyManager from "../src/lobby/LobbyManager"
import * as express from "express";
import { Server } from "socket.io";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing LobbyManager", () => {
    let lobbyManager = new LobbyManager(io);
    let data = lobbyManager.getData();

    it("should create lobby", () => {
        let id = lobbyManager.createId("test")
        let lobby = lobbyManager.createLobby(id);

        expect(data.lobbys[id]).toBeTruthy();
        expect(lobby.getData().redirect).toEqual(`lobby?r=${id}`)
    })
})

server.close();