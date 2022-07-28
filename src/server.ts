import * as express from "express";
import { Server } from "socket.io";
import LobbyManager from "./lobby/LobbyManager";

const app = express();
const server = app.listen(5000);
const io = new Server(server);
new LobbyManager(io);

app.use("/",express.static("srcJs/client"));
console.log("running");

