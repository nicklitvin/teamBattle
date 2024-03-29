"use strict";
exports.__esModule = true;
var express = require("express");
var socket_io_1 = require("socket.io");
var LobbyManager_1 = require("./lobby/LobbyManager");
var MyServer = (function () {
    function MyServer() {
    }
    MyServer.startServer = function () {
        var app = express();
        var server = app.listen(80);
        var io = new socket_io_1.Server(server);
        new LobbyManager_1["default"](io);
        app.use("/", express.static(__dirname + "/client"));
        console.log("running");
    };
    return MyServer;
}());
exports["default"] = MyServer;
MyServer.startServer();
