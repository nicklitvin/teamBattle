import * as express from "express";
import { Server } from "socket.io";

const app = express();
const server = app.listen(5000);
const io = new Server(server);

app.use("/",express.static("srcJs/client"));
console.log("running");

io.on("connection", (socket) => {
    socket.on("createRoom", () => {
        console.log("create room");
    })
})
