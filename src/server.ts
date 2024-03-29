import * as express from "express";
import { Server } from "socket.io";
import LobbyManager from "./lobby/LobbyManager";

export default class MyServer {
    public static startServer() {
        const app : any = express();
        const server = app.listen(80);
        const io = new Server(server);
        
        new LobbyManager(io);
        
        app.use("/",express.static(__dirname + "/client"));
        console.log("running");
    }
}   

MyServer.startServer();

