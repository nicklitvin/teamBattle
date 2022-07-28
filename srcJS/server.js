"use strict";
exports.__esModule = true;
var express = require("express");
var socket_io_1 = require("socket.io");
var app = express();
var server = app.listen(5000);
var io = new socket_io_1.Server(server);
app.use("/", express.static("srcJs/client"));
console.log("running");
io.on("connection", function (socket) {
    socket.on("createRoom", function () {
        console.log("create room");
    });
});
