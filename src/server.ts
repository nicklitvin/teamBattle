import * as express from "express";
import { Server } from "socket.io";
import GameManager from "./game/GameManager";
import LobbyManager from "./lobby/LobbyManager";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

new LobbyManager(io);
new GameManager(io);

app.use("/",express.static(__dirname + "/client"));
console.log("running");

